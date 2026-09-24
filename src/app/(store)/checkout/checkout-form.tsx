"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import type { DeliveryZoneInfo } from "@/lib/delivery";
import { SITE } from "@/lib/site";
import { cn, formatUSD } from "@/lib/utils";
import { searchLocations, type ZWLocation } from "@/lib/zw-locations";
import {
  Banknote,
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

interface CheckoutFormProps {
  zones: DeliveryZoneInfo[];
  defaultName: string;
  defaultEmail: string;
  walletBalance: number | null;
}

const paymentMethods = [
  { value: "PAYNOW", label: "Paynow (EcoCash / InnBucks / Visa / Mastercard)" },
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery / Pickup" },
  { value: "ECOCASH", label: "EcoCash (manual)" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "IN_STORE", label: "Pay In Store" },
];

type Method = "PICKUP" | "DELIVERY" | "COUNTRYWIDE";

export function CheckoutForm({ zones, defaultName, defaultEmail, walletBalance }: CheckoutFormProps) {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState<Method>("DELIVERY");
  const [suburb, setSuburb] = useState("");
  const [suburbQuery, setSuburbQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [city, setCity] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PAYNOW");
  const [paynowMode, setPaynowMode] = useState<"web" | "mobile">("mobile");
  const [mobilePhone, setMobilePhone] = useState("");
  const [mobileMoney, setMobileMoney] = useState<"ecocash" | "onemoney">("ecocash");
  const [mobileInstructions, setMobileInstructions] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState("");
  const [paid, setPaid] = useState(false);
  const suburbRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Poll Paynow status while a mobile express payment is pending
  useEffect(() => {
    if (!pendingOrderId || paid) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch("/api/paynow/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: pendingOrderId }),
        });
        const data = await res.json();
        if (data.paid) {
          setPaid(true);
          clear();
        }
      } catch {
        /* keep polling */
      }
    }, 5000);
    return () => clearInterval(t);
  }, [pendingOrderId, paid, clear]);

  // Close suggestion dropdowns on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (suburbRef.current && !suburbRef.current.contains(e.target as Node))
        setShowSuggestions(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node))
        setShowCitySuggestions(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Flatten suburb → zone lookup
  const suburbZone = useMemo(() => {
    const map = new Map<string, DeliveryZoneInfo>();
    for (const z of zones) {
      for (const s of z.suburbs) map.set(s, z);
    }
    return map;
  }, [zones]);

  const suggestions = useMemo(() => {
    if (method !== "DELIVERY") return [];
    // Prefer zone-matched suburbs, fall back to all ZW locations
    const zoneMatches = searchLocations(suburbQuery).filter((l) => l.zone);
    return zoneMatches.length ? zoneMatches : searchLocations(suburbQuery);
  }, [suburbQuery, method]);

  const citySuggestions = useMemo(
    () => searchLocations(cityQuery).filter((l) => l.type !== "street"),
    [cityQuery]
  );

  const selectedZone = suburb ? suburbZone.get(suburb) ?? null : null;
  const deliveryFee =
    method === "DELIVERY" ? selectedZone?.fee ?? 0 : 0; // countrywide: FedEx paid at collection
  const subtotal = mounted ? cartSubtotal(items) : 0;
  const total = subtotal + deliveryFee;

  function pickSuburb(l: ZWLocation) {
    setSuburb(l.name);
    setSuburbQuery(l.name);
    setShowSuggestions(false);
  }

  function pickCity(l: ZWLocation) {
    setCity(l.name);
    setCityQuery(l.name);
    setShowCitySuggestions(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (method === "DELIVERY" && !suburb) {
      setError("Please select your suburb for delivery.");
      return;
    }
    if (method === "COUNTRYWIDE" && !city) {
      setError("Please select your town or city for countrywide delivery.");
      return;
    }

    setLoading(true);
    const form = new FormData(e.currentTarget);
    const paymentMethod = form.get("paymentMethod") as string;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("customerName"),
          email: form.get("email"),
          phone: form.get("phone"),
          deliveryMethod: method,
          address: form.get("address") || null,
          suburb: method === "DELIVERY" ? suburb : null,
          city: method === "COUNTRYWIDE" ? city : null,
          paymentMethod,
          notes: form.get("notes") || null,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            qty: i.qty,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to place order");

      // Paynow — web redirect or mobile express checkout
      if (paymentMethod === "PAYNOW" && data.orderId) {
        if (paynowMode === "mobile") {
          const payRes = await fetch("/api/paynow/mobile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              phone: mobilePhone,
              method: mobileMoney,
            }),
          });
          const payData = await payRes.json();
          if (payRes.ok) {
            setMobileInstructions(payData.instructions ?? "");
            setPendingOrderId(data.orderId);
            setOrderNumber(data.orderNumber);
            return; // keep cart until paid
          }
          console.warn("Paynow mobile init failed:", payData.error);
        } else {
          const payRes = await fetch("/api/paynow/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId }),
          });
          const payData = await payRes.json();
          if (payRes.ok && payData.redirectUrl) {
            clear();
            window.location.href = payData.redirectUrl;
            return;
          }
          console.warn("Paynow init failed:", payData.error);
        }
      }

      clear();
      setOrderNumber(data.orderNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return <div className="h-64 bg-muted rounded-xl animate-pulse" />;
  }

  if (orderNumber) {
    // Mobile express checkout — waiting for customer to approve on their phone
    if (pendingOrderId && !paid) {
      return (
        <Card className="max-w-lg mx-auto p-8 text-center">
          <Smartphone className="size-14 text-brand-600 mx-auto mb-4" aria-hidden />
          <h2 className="text-xl font-bold">Check Your Phone</h2>
          <p className="text-[13.5px] text-muted-foreground mt-2">
            Order <span className="font-bold text-foreground tnum">{orderNumber}</span> created.
            A payment prompt was sent to <span className="font-semibold tnum">{mobilePhone}</span>.
          </p>
          {mobileInstructions && (
            <p className="text-[13px] bg-muted rounded-lg p-3 mt-4">
              {mobileInstructions}
            </p>
          )}
          <p className="text-[12.5px] text-muted-foreground mt-4 flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Waiting for payment confirmation…
          </p>
        </Card>
      );
    }
    return (
      <Card className="max-w-lg mx-auto p-8 text-center">
        <CheckCircle2 className="size-14 text-success mx-auto mb-4" aria-hidden />
        <h2 className="text-xl font-bold">{paid ? "Payment Received!" : "Order Placed!"}</h2>
        <p className="text-[13.5px] text-muted-foreground mt-2">
          Your order number is{" "}
          <span className="font-bold text-foreground tnum">{orderNumber}</span>.
          {paid
            ? " Payment confirmed — we'll be in touch shortly."
            : " We'll contact you shortly to confirm."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <ButtonLink href="/account">Track Order</ButtonLink>
          <ButtonLink href="/shop" variant="secondary">
            Continue Shopping
          </ButtonLink>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          hint="Add some products before checking out."
          action={<ButtonLink href="/shop">Browse Shop</ButtonLink>}
        />
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
      {/* Left: details */}
      <div className="lg:col-span-2 space-y-5">
        {/* Contact */}
        <Card className="p-5">
          <h2 className="text-[15px] font-semibold mb-4">Contact Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" htmlFor="customerName" required>
              <Input
                id="customerName"
                name="customerName"
                required
                defaultValue={defaultName}
                placeholder="Your name"
              />
            </Field>
            <Field label="Phone" htmlFor="phone" required>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+263 7XX XXX XXX"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Email" htmlFor="email" required>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={defaultEmail}
                  placeholder="you@example.com"
                />
              </Field>
            </div>
          </div>
        </Card>

        {/* Delivery method */}
        <Card className="p-5">
          <h2 className="text-[15px] font-semibold mb-4">Delivery Method</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMethod("DELIVERY")}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border text-left transition-colors",
                method === "DELIVERY"
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-950"
                  : "hover:bg-muted"
              )}
            >
              <Truck className="size-5 text-brand-600 mt-0.5 shrink-0" aria-hidden />
              <div>
                <p className="text-[13.5px] font-semibold">Harare Delivery</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Within {SITE.deliveryRadiusKm}km of CBD — from{" "}
                  {formatUSD(zones[0]?.fee ?? 3)}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMethod("COUNTRYWIDE")}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border text-left transition-colors",
                method === "COUNTRYWIDE"
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-950"
                  : "hover:bg-muted"
              )}
            >
              <Globe className="size-5 text-brand-600 mt-0.5 shrink-0" aria-hidden />
              <div>
                <p className="text-[13.5px] font-semibold">Countrywide</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  FedEx courier — pay courier on collection
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMethod("PICKUP")}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border text-left transition-colors",
                method === "PICKUP"
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-950"
                  : "hover:bg-muted"
              )}
            >
              <Store className="size-5 text-brand-600 mt-0.5 shrink-0" aria-hidden />
              <div>
                <p className="text-[13.5px] font-semibold">Pickup In Store</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Free — {SITE.address.line1}
                </p>
              </div>
            </button>
          </div>

          {/* Harare delivery — suburb autocomplete */}
          {method === "DELIVERY" && (
            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <div ref={suburbRef} className="relative">
                <Field label="Suburb / Area" htmlFor="suburb" required>
                  <Input
                    id="suburb"
                    name="suburb"
                    value={suburbQuery}
                    onChange={(e) => {
                      setSuburbQuery(e.target.value);
                      setSuburb("");
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    required
                    autoComplete="off"
                    placeholder="Start typing your suburb…"
                  />
                </Field>
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-20 inset-x-0 top-full mt-1 bg-card border rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                    {suggestions.map((l) => (
                      <li key={l.name}>
                        <button
                          type="button"
                          onClick={() => pickSuburb(l)}
                          className="w-full text-left px-3.5 py-2.5 text-[13px] hover:bg-muted flex items-center justify-between gap-2"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="size-3.5 text-brand-600 shrink-0" aria-hidden />
                            {l.name}
                          </span>
                          {l.zone && (
                            <span className="text-[11px] text-muted-foreground">
                              {l.zone.split("—")[0].trim()}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Field label="Street Address" htmlFor="address" required>
                <Input
                  id="address"
                  name="address"
                  required={method === "DELIVERY"}
                  placeholder="e.g. 12 Samora Machel Ave"
                />
              </Field>
              {suburb && !selectedZone && (
                <p className="sm:col-span-2 text-[12.5px] text-warning">
                  This area may be outside our delivery zone — we&apos;ll
                  confirm the fee when we contact you.
                </p>
              )}
              {selectedZone && (
                <p className="sm:col-span-2 text-[12.5px] text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-brand-600" aria-hidden />
                  {selectedZone.name} — delivery fee{" "}
                  <span className="font-semibold text-foreground tnum">
                    {formatUSD(selectedZone.fee)}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Countrywide — city autocomplete + FedEx note */}
          {method === "COUNTRYWIDE" && (
            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <div ref={cityRef} className="relative">
                <Field label="Town / City" htmlFor="city" required>
                  <Input
                    id="city"
                    name="city"
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value);
                      setCity("");
                      setShowCitySuggestions(true);
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    required
                    autoComplete="off"
                    placeholder="e.g. Bulawayo, Mutare, Gweru…"
                  />
                </Field>
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <ul className="absolute z-20 inset-x-0 top-full mt-1 bg-card border rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                    {citySuggestions.map((l) => (
                      <li key={l.name}>
                        <button
                          type="button"
                          onClick={() => pickCity(l)}
                          className="w-full text-left px-3.5 py-2.5 text-[13px] hover:bg-muted flex items-center gap-2"
                        >
                          <MapPin className="size-3.5 text-brand-600 shrink-0" aria-hidden />
                          {l.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Field label="Collection Point / Address" htmlFor="address" required>
                <Input
                  id="address"
                  name="address"
                  required={method === "COUNTRYWIDE"}
                  placeholder="FedEx collection point or address"
                />
              </Field>
              <p className="sm:col-span-2 text-[12.5px] text-muted-foreground flex items-start gap-1.5">
                <Globe className="size-3.5 text-brand-600 mt-0.5 shrink-0" aria-hidden />
                We ship via FedEx pay-forward — you pay the courier fee directly
                to FedEx when collecting your parcel. No delivery charge from us.
              </p>
            </div>
          )}
        </Card>

        {/* Payment + notes */}
        <Card className="p-5">
          <h2 className="text-[15px] font-semibold mb-4">Payment</h2>
          <Field label="Payment Method" htmlFor="paymentMethod" required>
            <Select
              id="paymentMethod"
              name="paymentMethod"
              required
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {walletBalance !== null && (
                <option value="WALLET">
                  LapTech Wallet ({formatUSD(walletBalance)} available)
                </option>
              )}
              {paymentMethods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>

          {paymentMethod === "WALLET" && walletBalance !== null && (
            <p className="mt-3 text-[12.5px] rounded-lg bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-200 px-3 py-2">
              {walletBalance >= total
                ? `Your wallet will be charged ${formatUSD(total)} on order placement.`
                : `Insufficient balance — your wallet has ${formatUSD(walletBalance)} but this order is ${formatUSD(total)}. Please top up or choose another method.`}
            </p>
          )}

          {/* Paynow sub-options */}
          {paymentMethod === "PAYNOW" && (
            <div className="mt-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaynowMode("mobile")}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-colors",
                    paynowMode === "mobile"
                      ? "border-brand-600 bg-brand-50 dark:bg-brand-950"
                      : "hover:bg-muted"
                  )}
                >
                  <Smartphone className="size-5 text-brand-600 mt-0.5 shrink-0" aria-hidden />
                  <div>
                    <p className="text-[13px] font-semibold">Pay on my phone</p>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5">
                      EcoCash / OneMoney prompt sent to your number
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaynowMode("web")}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-colors",
                    paynowMode === "web"
                      ? "border-brand-600 bg-brand-50 dark:bg-brand-950"
                      : "hover:bg-muted"
                  )}
                >
                  <Globe className="size-5 text-brand-600 mt-0.5 shrink-0" aria-hidden />
                  <div>
                    <p className="text-[13px] font-semibold">Paynow website</p>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5">
                      Visa, Mastercard, InnBucks & more
                    </p>
                  </div>
                </button>
              </div>

              {paynowMode === "mobile" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Mobile Number" htmlFor="mobilePhone" required>
                    <Input
                      id="mobilePhone"
                      value={mobilePhone}
                      onChange={(e) => setMobilePhone(e.target.value)}
                      required={paymentMethod === "PAYNOW" && paynowMode === "mobile"}
                      placeholder="077X XXX XXX"
                      type="tel"
                    />
                  </Field>
                  <Field label="Mobile Money" htmlFor="mobileMoney" required>
                    <Select
                      id="mobileMoney"
                      value={mobileMoney}
                      onChange={(e) => setMobileMoney(e.target.value as "ecocash" | "onemoney")}
                    >
                      <option value="ecocash">EcoCash</option>
                      <option value="onemoney">OneMoney</option>
                    </Select>
                  </Field>
                </div>
              )}
            </div>
          )}
          <div className="mt-4">
            <Field label="Order Notes (optional)" htmlFor="notes">
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any special instructions…"
              />
            </Field>
          </div>
        </Card>
      </div>

      {/* Right: summary */}
      <Card className="p-5 h-fit lg:sticky lg:top-20">
        <h2 className="text-[15px] font-semibold mb-4">Your Order</h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3 items-center">
              <div className="relative size-12 rounded-lg overflow-hidden bg-muted shrink-0">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium line-clamp-1">
                  {item.name}
                </p>
                <p className="text-[11.5px] text-muted-foreground tnum">
                  {item.qty} × {formatUSD(item.price)}
                </p>
              </div>
              <p className="text-[12.5px] font-semibold tnum">
                {formatUSD(item.price * item.qty)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4 space-y-2 text-[13.5px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tnum">{formatUSD(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {method === "DELIVERY"
                ? "Delivery"
                : method === "COUNTRYWIDE"
                  ? "FedEx Courier"
                  : "Pickup"}
            </span>
            <span className="tnum">
              {method === "PICKUP"
                ? "Free"
                : method === "COUNTRYWIDE"
                  ? "Paid to FedEx"
                  : selectedZone
                    ? formatUSD(deliveryFee)
                    : "—"}
            </span>
          </div>
          <div className="border-t pt-2.5 flex justify-between font-bold text-[15px]">
            <span>Total</span>
            <span className="tnum">{formatUSD(total)}</span>
          </div>
        </div>

        {error && (
          <p className="text-[12.5px] text-destructive mt-3">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-5"
          loading={loading}
          disabled={
            (method === "DELIVERY" && !suburb) ||
            (method === "COUNTRYWIDE" && !city)
          }
        >
          <Banknote className="size-4" aria-hidden />
          Place Order — {formatUSD(total)}
        </Button>
        <p className="text-[11.5px] text-muted-foreground text-center mt-3">
          We&apos;ll call or WhatsApp you to confirm your order.
        </p>
      </Card>
    </form>
  );
}
