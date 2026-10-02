import {
  bookingCreatedAdminEmail,
  bookingCreatedEmail,
  bookingStatusAdminEmail,
  bookingStatusEmail,
  orderPlacedAdminEmail,
  orderPlacedEmail,
  orderStatusAdminEmail,
  orderStatusEmail,
  paymentReceivedAdminEmail,
  paymentReceivedEmail,
  staffNoticeEmail,
  walletGiftReceivedEmail,
  type EmailBooking,
  type EmailOrder,
} from "@/lib/email-templates";
import { sendMail } from "@/lib/mailer";
import { formatUSD } from "@/lib/utils";

/** Shared team inbox — all founders/staff monitor this mailbox. */
const TEAM_EMAIL = "admin@laptech.co.zw";

/**
 * All notification copies go to the shared team inbox.
 * ADMIN_NOTIFY_EMAIL (if set) is added as an extra recipient.
 */
const adminRecipient = () =>
  [TEAM_EMAIL, process.env.ADMIN_NOTIFY_EMAIL]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(", ");

export async function notifyOrderPlaced(order: EmailOrder) {
  try {
    const customer = orderPlacedEmail(order);
    const admin = orderPlacedAdminEmail(order);
    await Promise.all([
      sendMail({
        to: order.email,
        subject: customer.subject,
        html: customer.html,
        text: customer.text,
      }),
      sendMail({
        to: adminRecipient(),
        subject: admin.subject,
        html: admin.html,
        text: admin.text,
      }),
    ]);
  } catch (error) {
    console.error(
      `order email notification failed for ${order.orderNumber} (${formatUSD(order.total)})`,
      error
    );
  }
}

export async function notifyPaymentReceived(order: EmailOrder) {
  try {
    const customer = paymentReceivedEmail(order);
    const admin = paymentReceivedAdminEmail(order);
    await Promise.all([
      sendMail({
        to: order.email,
        subject: customer.subject,
        html: customer.html,
        text: customer.text,
      }),
      sendMail({
        to: adminRecipient(),
        subject: admin.subject,
        html: admin.html,
        text: admin.text,
      }),
    ]);
  } catch (error) {
    console.error(
      `payment email notification failed for ${order.orderNumber} (${formatUSD(order.total)})`,
      error
    );
  }
}

export async function notifyOrderStatus(order: EmailOrder) {
  if (order.status === "PENDING") return;
  try {
    const customer = orderStatusEmail(order);
    const admin = orderStatusAdminEmail(order);
    await Promise.all([
      sendMail({
        to: order.email,
        subject: customer.subject,
        html: customer.html,
        text: customer.text,
      }),
      sendMail({
        to: adminRecipient(),
        subject: admin.subject,
        html: admin.html,
        text: admin.text,
      }),
    ]);
  } catch (error) {
    console.error("order status email notification failed", error);
  }
}

export async function notifyBookingCreated(booking: EmailBooking) {
  try {
    const customer = booking.email ? bookingCreatedEmail(booking) : null;
    const admin = bookingCreatedAdminEmail(booking);
    await Promise.all([
      customer
        ? sendMail({
            to: booking.email!,
            subject: customer.subject,
            html: customer.html,
            text: customer.text,
          })
        : Promise.resolve(false),
      sendMail({
        to: adminRecipient(),
        subject: admin.subject,
        html: admin.html,
        text: admin.text,
      }),
    ]);
  } catch (error) {
    console.error("booking email notification failed", error);
  }
}

export async function notifyBookingStatus(booking: EmailBooking) {
  if (booking.status === "PENDING") return;
  try {
    const customer = booking.email ? bookingStatusEmail(booking) : null;
    const admin = bookingStatusAdminEmail(booking);
    await Promise.all([
      customer
        ? sendMail({
            to: booking.email!,
            subject: customer.subject,
            html: customer.html,
            text: customer.text,
          })
        : Promise.resolve(false),
      sendMail({
        to: adminRecipient(),
        subject: admin.subject,
        html: admin.html,
        text: admin.text,
      }),
    ]);
  } catch (error) {
    console.error("booking status email notification failed", error);
  }
}

/** New customer self-registration — team gets notified. */
export async function notifyUserRegistered(user: {
  name: string;
  email: string;
  phone?: string | null;
}) {
  try {
    const email = staffNoticeEmail(
      `New account — ${user.name}`,
      "New customer registered",
      [
        `Name: ${user.name}`,
        `Email: ${user.email}`,
        user.phone ? `Phone: ${user.phone}` : "",
      ]
    );
    await sendMail({
      to: adminRecipient(),
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch (error) {
    console.error("user registered email notification failed", error);
  }
}

/** Admin created a user from the console — team gets notified. */
export async function notifyUserCreatedByAdmin(user: {
  name: string;
  email: string;
  role: string;
}) {
  try {
    const email = staffNoticeEmail(
      `Account created by admin — ${user.email}`,
      "Admin created an account",
      [
        `Name: ${user.name}`,
        `Email: ${user.email}`,
        `Role: ${user.role}`,
      ]
    );
    await sendMail({
      to: adminRecipient(),
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch (error) {
    console.error("admin-created user email notification failed", error);
  }
}

/** Wallet gift — recipient gets a confirmation, team gets a copy. */
export async function notifyWalletGift(opts: {
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  amount: number;
  note?: string;
}) {
  try {
    const recipient = walletGiftReceivedEmail({
      toName: opts.toName,
      fromName: opts.fromName,
      amount: opts.amount,
      note: opts.note,
    });
    const admin = staffNoticeEmail(
      `Wallet gift — ${formatUSD(opts.amount)}`,
      "Wallet gift sent",
      [
        `From: ${opts.fromName} (${opts.fromEmail})`,
        `To: ${opts.toName} (${opts.toEmail})`,
        `Amount: ${formatUSD(opts.amount)}`,
        opts.note ? `Note: ${opts.note}` : "",
      ]
    );
    await Promise.all([
      sendMail({
        to: opts.toEmail,
        subject: recipient.subject,
        html: recipient.html,
        text: recipient.text,
      }),
      sendMail({
        to: adminRecipient(),
        subject: admin.subject,
        html: admin.html,
        text: admin.text,
      }),
    ]);
  } catch (error) {
    console.error("wallet gift email notification failed", error);
  }
}

/** Admin wallet top-up / adjustment — team gets notified. */
export async function notifyWalletAdjusted(opts: {
  userName: string;
  userEmail: string;
  amount: number;
  balance: number;
  note?: string;
}) {
  try {
    const email = staffNoticeEmail(
      `Wallet ${opts.amount >= 0 ? "top-up" : "adjustment"} — ${formatUSD(Math.abs(opts.amount))}`,
      "Wallet adjusted by admin",
      [
        `Customer: ${opts.userName} (${opts.userEmail})`,
        `Amount: ${opts.amount >= 0 ? "+" : "-"}${formatUSD(Math.abs(opts.amount))}`,
        `New balance: ${formatUSD(opts.balance)}`,
        opts.note ? `Note: ${opts.note}` : "",
      ]
    );
    await sendMail({
      to: adminRecipient(),
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch (error) {
    console.error("wallet adjustment email notification failed", error);
  }
}

/** New marketing lead captured — team gets notified. */
export async function notifyLeadCreated(lead: {
  name: string;
  phone?: string | null;
  email?: string | null;
  businessName?: string | null;
  interests?: string | null;
}) {
  try {
    const email = staffNoticeEmail(
      `New lead — ${lead.name}`,
      "New marketing lead",
      [
        `Name: ${lead.name}`,
        lead.phone ? `Phone: ${lead.phone}` : "",
        lead.email ? `Email: ${lead.email}` : "",
        lead.businessName ? `Business: ${lead.businessName}` : "",
        lead.interests ? `Interests: ${lead.interests}` : "",
      ]
    );
    await sendMail({
      to: adminRecipient(),
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch (error) {
    console.error("lead email notification failed", error);
  }
}
