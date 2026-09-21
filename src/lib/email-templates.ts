import { SITE, whatsappLink } from "@/lib/site";
import { formatUSD } from "@/lib/utils";

export interface EmailOrder {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: string;
  address: string | null;
  suburb: string | null;
  city: string | null;
  paymentMethod: string;
  status: string;
  items: { name: string; price: number; qty: number }[];
}

export interface EmailBooking {
  name: string;
  email: string | null;
  phone: string;
  device: string;
  serviceType: string;
  description: string | null;
  preferredDate: string | null;
  status: string;
}

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const escapeHtml = (value: string | number) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const displayValue = (value: string) =>
  value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

function layout(title: string, content: string, text: string) {
  const phones = SITE.phones.join(" · ");
  return {
    html: `<!doctype html><html><body style="margin:0;background:#f5f7fa;font-family:Arial,sans-serif;color:#18212f"><div style="max-width:600px;margin:24px auto;background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden"><div style="background:#123b67;color:#fff;padding:22px 24px;font-size:22px;font-weight:700">LapTech</div><div style="padding:24px"><h1 style="font-size:20px;margin:0 0 18px">${escapeHtml(title)}</h1>${content}</div><div style="border-top:1px solid #e5e7eb;padding:16px 24px;color:#667085;font-size:12px;line-height:1.6">LapTech (Pvt) Ltd · ${escapeHtml(phones)}<br/><a href="${whatsappLink()}" style="color:#1677c8">Chat with us on WhatsApp</a></div></div></body></html>`,
    text: `${text}\n\n${SITE.name} · ${phones}\nWhatsApp: ${whatsappLink()}`,
  };
}

function itemRows(order: EmailOrder) {
  return order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eef0f3">${escapeHtml(item.name)}</td><td style="padding:8px 0;border-bottom:1px solid #eef0f3;text-align:center">${item.qty}</td><td style="padding:8px 0;border-bottom:1px solid #eef0f3;text-align:right">${formatUSD(item.price * item.qty)}</td></tr>`
    )
    .join("");
}

function orderDetails(order: EmailOrder) {
  const delivery =
    order.deliveryMethod === "PICKUP"
      ? `Pickup from ${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.city}`
      : `${displayValue(order.deliveryMethod)}${order.address ? ` — ${order.address}` : ""}${order.suburb ? `, ${order.suburb}` : ""}${order.city ? `, ${order.city}` : ""}`;
  return `<p style="margin:0 0 16px">Order <strong>${escapeHtml(order.orderNumber)}</strong></p><table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="padding:8px 0;text-align:left;border-bottom:2px solid #123b67">Item</th><th style="padding:8px 0;text-align:center;border-bottom:2px solid #123b67">Qty</th><th style="padding:8px 0;text-align:right;border-bottom:2px solid #123b67">Amount</th></tr></thead><tbody>${itemRows(order)}</tbody></table><p style="margin:16px 0 4px">Delivery: ${escapeHtml(delivery)}</p><p style="margin:4px 0">Payment: ${escapeHtml(displayValue(order.paymentMethod))}</p><p style="margin:14px 0 0;font-size:17px"><strong>Total: ${formatUSD(order.total)}</strong></p>`;
}

export function orderPlacedEmail(order: EmailOrder): EmailContent {
  const text = `Hi ${order.customerName},\n\nWe received order ${order.orderNumber}. We'll confirm it shortly.\n\n${order.items.map((item) => `${item.qty} × ${item.name} — ${formatUSD(item.price * item.qty)}`).join("\n")}\n\nDelivery: ${order.deliveryMethod}\nPayment: ${displayValue(order.paymentMethod)}\nTotal: ${formatUSD(order.total)}`;
  return {
    subject: `Order ${order.orderNumber} received`,
    ...layout(`Order ${order.orderNumber} received`, `<p>Hi ${escapeHtml(order.customerName)},</p><p>Thanks for your order. We received it and we&apos;ll confirm it shortly.</p>${orderDetails(order)}`, text),
  };
}

export function orderPlacedAdminEmail(order: EmailOrder): EmailContent {
  const text = `New order ${order.orderNumber} from ${order.customerName}.\nTotal: ${formatUSD(order.total)}\nEmail: ${order.email}\nPhone: ${order.phone}`;
  return {
    subject: `New order ${order.orderNumber} — ${formatUSD(order.total)}`,
    ...layout(`New order ${order.orderNumber}`, `<p><strong>${escapeHtml(order.customerName)}</strong> placed a new order.</p>${orderDetails(order)}`, text),
  };
}

export function paymentReceivedEmail(order: EmailOrder): EmailContent {
  const text = `Payment confirmed for ${order.orderNumber}.\nTotal: ${formatUSD(order.total)}\nThank you, ${order.customerName}.`;
  return {
    subject: `Payment confirmed for ${order.orderNumber}`,
    ...layout(`Payment confirmed for ${order.orderNumber}`, `<p>Hi ${escapeHtml(order.customerName)},</p><p>We&apos;ve received your payment of <strong>${formatUSD(order.total)}</strong>. Your order is now confirmed.</p>`, text),
  };
}

export function paymentReceivedAdminEmail(order: EmailOrder): EmailContent {
  const text = `Payment confirmed for ${order.orderNumber}.\nCustomer: ${order.customerName}\nTotal: ${formatUSD(order.total)}`;
  return {
    subject: `Payment confirmed for ${order.orderNumber}`,
    ...layout(`Payment confirmed for ${order.orderNumber}`, `<p>Payment received from <strong>${escapeHtml(order.customerName)}</strong>.</p><p>Order: ${escapeHtml(order.orderNumber)}<br/>Total: <strong>${formatUSD(order.total)}</strong></p>`, text),
  };
}

const statusMessages: Record<string, string> = {
  CONFIRMED: "We have confirmed your order and will prepare it shortly.",
  PROCESSING: "Your order is being prepared by our team.",
  OUT_FOR_DELIVERY: "Your order is on its way.",
  DELIVERED: "Your order has been delivered. Thank you for shopping with LapTech.",
  CANCELLED: "Your order has been cancelled. Please contact us if you have any questions.",
};

export function orderStatusEmail(order: EmailOrder): EmailContent {
  const message = statusMessages[order.status] ?? `Your order status is now ${displayValue(order.status)}.`;
  const text = `Order ${order.orderNumber}: ${displayValue(order.status)}.\n\n${message}`;
  return {
    subject: `Order ${order.orderNumber} — ${displayValue(order.status)}`,
    ...layout(`Order ${order.orderNumber} update`, `<p>Hi ${escapeHtml(order.customerName)},</p><p>${escapeHtml(message)}</p><p>Status: <strong>${escapeHtml(displayValue(order.status))}</strong></p>`, text),
  };
}

export function bookingCreatedEmail(booking: EmailBooking): EmailContent {
  const text = `We received your ${booking.serviceType} booking.\nDevice: ${booking.device}\nPreferred date: ${booking.preferredDate ?? "To be confirmed"}`;
  return {
    subject: `We received your ${booking.serviceType} booking`,
    ...layout(`Booking received`, `<p>Hi ${escapeHtml(booking.name)},</p><p>We received your <strong>${escapeHtml(booking.serviceType)}</strong> booking and will contact you shortly.</p><p>Device: ${escapeHtml(booking.device)}<br/>Preferred date: ${escapeHtml(booking.preferredDate ?? "To be confirmed")}</p>`, text),
  };
}

export function bookingCreatedAdminEmail(booking: EmailBooking): EmailContent {
  const text = `New ${booking.serviceType} booking from ${booking.name}.\nDevice: ${booking.device}\nPhone: ${booking.phone}\nEmail: ${booking.email ?? "not provided"}`;
  return {
    subject: `New ${booking.serviceType} booking`,
    ...layout(`New booking`, `<p><strong>${escapeHtml(booking.name)}</strong> submitted a ${escapeHtml(booking.serviceType)} booking.</p><p>Device: ${escapeHtml(booking.device)}<br/>Phone: ${escapeHtml(booking.phone)}<br/>Email: ${escapeHtml(booking.email ?? "not provided")}<br/>Preferred date: ${escapeHtml(booking.preferredDate ?? "Not specified")}</p>`, text),
  };
}

const bookingStatusMessages: Record<string, string> = {
  CONFIRMED: "Your booking has been confirmed.",
  IN_PROGRESS: "Our team is working on your booking.",
  COMPLETED: "Your booking has been completed.",
  CANCELLED: "Your booking has been cancelled. Please contact us if you have any questions.",
};

export function bookingStatusEmail(booking: EmailBooking): EmailContent {
  const message = bookingStatusMessages[booking.status] ?? `Your booking status is now ${displayValue(booking.status)}.`;
  const text = `${booking.serviceType} booking: ${displayValue(booking.status)}.\n\n${message}`;
  return {
    subject: `${booking.serviceType} booking — ${displayValue(booking.status)}`,
    ...layout(`Booking update`, `<p>Hi ${escapeHtml(booking.name)},</p><p>${escapeHtml(message)}</p><p>Status: <strong>${escapeHtml(displayValue(booking.status))}</strong></p>`, text),
  };
}
