import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  const emailConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );

  return (
    <>
      <PageHeader title="Settings" description="Shop configuration and account." />

      <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
        {/* Business info */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Shown across the storefront and invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-[13.5px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business</span>
              <span className="font-medium">{SITE.legalName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{SITE.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phones</span>
              <span className="font-medium text-right">{SITE.phones[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium text-right">
                {SITE.address.line1}, {SITE.address.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hours</span>
              <span className="font-medium">{SITE.hours}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery radius</span>
              <span className="font-medium tnum">{SITE.deliveryRadiusKm} km</span>
            </div>
            <p className="text-[12px] text-muted-foreground pt-2 border-t">
              Edit these in <code className="text-[11.5px] bg-muted px-1 py-0.5 rounded">src/lib/site.ts</code>
            </p>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Admin Password</CardTitle>
            <CardDescription>
              Update the password for your admin account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Order, payment, and booking updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge tone={emailConfigured ? "success" : "neutral"}>
              {emailConfigured
                ? "Email notifications: configured"
                : "Email notifications: not configured (set SMTP_* env vars)"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
