import {
  bookingCreatedAdminEmail,
  bookingCreatedEmail,
  bookingStatusEmail,
  orderPlacedAdminEmail,
  orderPlacedEmail,
  orderStatusEmail,
  paymentReceivedAdminEmail,
  paymentReceivedEmail,
  type EmailBooking,
  type EmailOrder,
} from "@/lib/email-templates";
import { sendMail } from "@/lib/mailer";
import { SITE } from "@/lib/site";
import { formatUSD } from "@/lib/utils";

const adminRecipient = () => process.env.ADMIN_NOTIFY_EMAIL || SITE.email;

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
    const email = orderStatusEmail(order);
    await sendMail({
      to: order.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
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
  if (!booking.email || booking.status === "PENDING") return;
  try {
    const email = bookingStatusEmail(booking);
    await sendMail({
      to: booking.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch (error) {
    console.error("booking status email notification failed", error);
  }
}
