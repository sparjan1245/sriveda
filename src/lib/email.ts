import nodemailer from "nodemailer";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { TEMPLE } from "@/lib/constants";
import { formatDate, formatCurrency, amountToWords } from "@/lib/utils";
import BookingReceiptDoc from "@/components/pdf/BookingReceiptDoc";
import DonationReceiptDoc from "@/components/pdf/DonationReceiptDoc";

// ── Config ────────────────────────────────────────────────────────────────────

async function getEmailConfig() {
  const s = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (!s?.gmailEnabled || !s.gmailUser || !s.gmailAppPassword) return null;
  const user = decrypt(s.gmailUser);
  const pass = decrypt(s.gmailAppPassword);
  if (!user || !pass) return null;
  const adminEmails = s.adminEmails
    ? s.adminEmails.split(",").map((e) => e.trim()).filter(Boolean)
    : [TEMPLE.emails[0]];
  return { user, pass, adminEmails };
}

function createTransport(user: string, pass: string) {
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

// ── PDF helpers ───────────────────────────────────────────────────────────────


// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildBookingPdf(b: any, appUrl: string): Promise<Buffer> {
  const receiptNo   = b.receiptNumber || `VGCC/BKG/${b.id.slice(-6).toUpperCase()}`;
  const devoteeName = b.user?.name || b.guestName || "Devotee";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((await (renderToBuffer as any)(
    React.createElement(BookingReceiptDoc, {
      logoUrl:         `${appUrl}/logo.png`,
      receiptNo,
      createdAt:       formatDate(b.createdAt),
      status:          b.status,
      devoteeName,
      devoteeEmail:    b.user?.email || b.guestEmail || undefined,
      devoteePhone:    b.user?.phone || b.guestPhone || undefined,
      gotra:           b.gotra       || undefined,
      nakshatra:       b.nakshatra   || undefined,
      sankalpam:       b.sankalpam   || undefined,
      serviceName:     b.service.name,
      serviceDate:     formatDate(b.date),
      occasion:        b.occasion    || undefined,
      paymentMode:     b.paymentMode,
      notes:           b.notes       || undefined,
      amountFormatted: formatCurrency(b.amount),
      amountInWords:   amountToWords(b.amount),
      templeAddress:   TEMPLE.address,
      templePhone:     TEMPLE.phones[0],
      templeEmail:     TEMPLE.emails[0],
    })
  )) as Buffer);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildDonationPdf(d: any, appUrl: string): Promise<Buffer> {
  const receiptNo = d.receiptNumber || `VGCC/DON/${d.id.slice(-6).toUpperCase()}`;
  const donorName = d.user?.name || d.guestName || "Devotee";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((await (renderToBuffer as any)(
    React.createElement(DonationReceiptDoc, {
      logoUrl:         `${appUrl}/logo.png`,
      receiptNo,
      createdAt:       formatDate(d.createdAt),
      donorName,
      donorEmail:      d.user?.email || d.guestEmail || undefined,
      donorPhone:      d.user?.phone || d.guestPhone || undefined,
      address:         d.address     || undefined,
      cause:           d.cause,
      paymentMode:     d.paymentMode,
      checkRef:        d.checkRef    || undefined,
      message:         d.message     || undefined,
      amountFormatted: formatCurrency(d.amount),
      amountInWords:   amountToWords(d.amount),
      taxId:           TEMPLE.taxId,
      templeAddress:   TEMPLE.address,
      templePhone:     TEMPLE.phones[0],
      templeEmail:     TEMPLE.emails[0],
    })
  )) as Buffer);
}

// ── HTML templates ────────────────────────────────────────────────────────────

const YEAR = new Date().getFullYear();

const baseStyles = `
  body{font-family:Georgia,serif;color:#222;background:#fff;margin:0;padding:0}
  .wrap{max-width:580px;margin:0 auto;padding:32px 24px}
  .header{background:#7B1B1B;color:#fff;padding:24px;text-align:center;border-radius:8px 8px 0 0}
  .header h1{margin:0 0 4px;font-size:19px;letter-spacing:0.04em}
  .header p{margin:0;font-size:11px;opacity:0.75}
  .body{background:#FFFDF5;border:1px solid #dfc96e;border-top:none;padding:24px;border-radius:0 0 8px 8px}
  .box{background:#fff;border:1px solid #e8d88a;border-radius:6px;padding:16px 20px;margin:16px 0}
  .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f3e8b0;font-size:13.5px}
  .row:last-child{border-bottom:none;font-weight:bold;font-size:15px}
  .btn{display:inline-block;margin:18px 0 6px;padding:11px 26px;background:#C67C2C;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-family:Georgia,serif}
  .divider{height:2px;background:linear-gradient(90deg,#C67C2C,#dfc96e,#C67C2C);margin:14px 0;border:none}
  .footer{text-align:center;font-size:11px;color:#999;margin-top:20px}
`;

function bookingConfirmHtml(opts: {
  devoteeName: string; serviceName: string; serviceDate: string;
  amount: string; receiptNo: string; receiptLink: string; occasion?: string;
}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}
  .welcome{background:linear-gradient(135deg,#7B1B1B,#4A0A12);color:#fff;padding:20px 24px;border-radius:8px;margin-bottom:18px;text-align:center}
  .welcome h2{margin:0 0 6px;font-size:20px;letter-spacing:0.03em}
  .welcome p{margin:0;font-size:13px;opacity:0.85}
  .blessing{background:#FFFDF0;border-left:4px solid #D4A017;padding:12px 16px;margin:16px 0;font-style:italic;font-size:13px;color:#5a3e00;border-radius:0 6px 6px 0}
  </style></head><body>
<div class="wrap">
  <div class="header"><h1>🛕 ${TEMPLE.name}</h1><p>${TEMPLE.address}</p></div>
  <div class="body">
    <div class="welcome">
      <h2>🙏 Welcome to Sri Veda Gayatri Temple</h2>
      <p>Your service booking is confirmed — we are honoured to serve you</p>
    </div>

    <p>Dear <strong>${opts.devoteeName}</strong>,</p>
    <p>Namaste! Your service booking at <strong>${TEMPLE.name}</strong> has been <strong>confirmed</strong>. Our priests are ready to perform this sacred ceremony with full devotion and Vedic tradition.</p>

    <div class="blessing">
      "May the divine blessings of Sri Veda Gayatri fill your life and family with joy, health, and spiritual prosperity." 🌸
    </div>

    <hr class="divider">
    <p style="font-size:13px;font-weight:bold;color:#7B1B1B">Booking Confirmation</p>
    <div class="box">
      <div class="row"><span style="color:#777">Service</span><span>${opts.serviceName}</span></div>
      <div class="row"><span style="color:#777">Date</span><span>${opts.serviceDate}</span></div>
      ${opts.occasion ? `<div class="row"><span style="color:#777">Occasion</span><span>${opts.occasion}</span></div>` : ""}
      <div class="row"><span style="color:#777">Receipt #</span><span style="font-family:monospace;color:#C67C2C">${opts.receiptNo}</span></div>
      <div class="row"><span>Total Paid</span><span style="color:#C67C2C">${opts.amount}</span></div>
    </div>

    <p style="font-size:13px">Your <strong>receipt PDF is attached</strong> to this email. You can also download it anytime:</p>
    <div style="text-align:center"><a href="${opts.receiptLink}" class="btn">📄 Download Receipt PDF</a></div>
    <hr class="divider">
    <p style="font-size:13px;color:#555">We look forward to welcoming you. Please arrive a few minutes early so our priests can begin the ceremony on time.</p>
    <p style="font-size:12px;color:#666">Questions? <a href="mailto:${TEMPLE.emails[0]}" style="color:#C67C2C">${TEMPLE.emails[0]}</a> · <a href="tel:${TEMPLE.phones[0]}" style="color:#C67C2C">${TEMPLE.phones[0]}</a></p>
    <p style="font-size:12px;color:#C67C2C;text-align:center;margin-top:8px">🙏 Jai Sri Veda Gayatri 🙏</p>
  </div>
  <div class="footer">&copy; ${YEAR} ${TEMPLE.name} · <a href="https://www.srivedagayatritemple.org" style="color:#C67C2C">www.srivedagayatritemple.org</a></div>
</div></body></html>`;
}

function donationConfirmHtml(opts: {
  donorName: string; cause: string; amount: string;
  receiptNo: string; receiptLink: string; message?: string;
}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}
  .welcome{background:linear-gradient(135deg,#7B1B1B,#4A0A12);color:#fff;padding:20px 24px;border-radius:8px;margin-bottom:18px;text-align:center}
  .welcome h2{margin:0 0 6px;font-size:20px;letter-spacing:0.03em}
  .welcome p{margin:0;font-size:13px;opacity:0.85}
  .blessing{background:#FFFDF0;border-left:4px solid #D4A017;padding:12px 16px;margin:16px 0;font-style:italic;font-size:13px;color:#5a3e00;border-radius:0 6px 6px 0}
  </style></head><body>
<div class="wrap">
  <div class="header"><h1>🛕 ${TEMPLE.name}</h1><p>${TEMPLE.address}</p></div>
  <div class="body">
    <div class="welcome">
      <h2>🙏 Welcome to Sri Veda Gayatri Temple</h2>
      <p>Your generous offering has been received with gratitude</p>
    </div>

    <p>Dear <strong>${opts.donorName}</strong>,</p>
    <p>Namaste! We are deeply grateful for your generous donation to <strong>${TEMPLE.name}</strong>. Your contribution is a sacred act of Seva (selfless service) and helps us continue our mission of preserving Vedic traditions and serving our community.</p>

    <div class="blessing">
      "Dana (giving) is one of the highest forms of Dharma. May your generosity bring you and your family abundant blessings, peace, and prosperity." 🌸
    </div>

    <hr class="divider">
    <p style="font-size:13px;font-weight:bold;color:#7B1B1B">Donation Receipt</p>
    <div class="box">
      <div class="row"><span style="color:#777">Purpose</span><span>${opts.cause}</span></div>
      ${opts.message ? `<div class="row"><span style="color:#777">Dedication</span><span>${opts.message}</span></div>` : ""}
      <div class="row"><span style="color:#777">Receipt #</span><span style="font-family:monospace;color:#C67C2C">${opts.receiptNo}</span></div>
      <div class="row"><span>Amount Donated</span><span style="color:#C67C2C">${opts.amount}</span></div>
    </div>

    <p style="font-size:13px">Your <strong>official tax receipt PDF is attached</strong> to this email. It is valid for tax deduction purposes under IRS 501(c)(3) — Tax ID: <strong>${TEMPLE.taxId}</strong>.</p>
    <p style="font-size:13px">You can also download your receipt anytime using the button below:</p>
    <div style="text-align:center"><a href="${opts.receiptLink}" class="btn">📄 Download Receipt PDF</a></div>
    <hr class="divider">
    <p style="font-size:13px;color:#555">We warmly invite you to join us for our upcoming pujas and events. Your continued support makes all of this possible.</p>
    <p style="font-size:12px;color:#666">Questions? Contact us at <a href="mailto:${TEMPLE.emails[0]}" style="color:#C67C2C">${TEMPLE.emails[0]}</a> · <a href="tel:${TEMPLE.phones[0]}" style="color:#C67C2C">${TEMPLE.phones[0]}</a></p>
    <p style="font-size:12px;color:#C67C2C;text-align:center;margin-top:8px">🙏 Jai Sri Veda Gayatri 🙏</p>
  </div>
  <div class="footer">&copy; ${YEAR} ${TEMPLE.name} · Tax ID: ${TEMPLE.taxId} · <a href="https://www.srivedagayatritemple.org" style="color:#C67C2C">www.srivedagayatritemple.org</a></div>
</div></body></html>`;
}

function adminBookingHtml(opts: {
  devoteeName: string; devoteeEmail: string; devoteePhone: string;
  serviceName: string; serviceDate: string; amount: string;
  receiptNo: string; occasion?: string; notes?: string;
  paymentGateway?: string; paymentMode?: string; isWalkin?: boolean;
}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;color:#222;margin:0;padding:0}
  .wrap{max-width:560px;margin:0 auto;padding:24px 18px}
  .header{background:#7B1B1B;color:#fff;padding:16px 20px;border-radius:6px 6px 0 0}
  .header h2{margin:0;font-size:16px}
  .body{background:#f9f9f9;border:1px solid #ddd;border-top:none;padding:18px;border-radius:0 0 6px 6px}
  .row{display:flex;padding:6px 0;border-bottom:1px solid #eee;font-size:13px}
  .row:last-child{border:none} .label{width:130px;color:#777;flex-shrink:0} .value{font-weight:600}
  .badge{display:inline-block;background:#FFF3CD;color:#856404;border:1px solid #FFDA6A;border-radius:4px;font-size:11px;padding:2px 8px;margin-left:8px}
  </style></head><body>
<div class="wrap">
  <div class="header"><h2>📋 ${opts.isWalkin ? "Walk-in " : ""}Booking ${opts.isWalkin ? "Created" : "Received"}${opts.isWalkin ? ' <span class="badge">Walk-in</span>' : ""}</h2></div>
  <div class="body">
    <div class="row"><span class="label">Devotee</span><span class="value">${opts.devoteeName}</span></div>
    <div class="row"><span class="label">Email</span><span class="value">${opts.devoteeEmail}</span></div>
    <div class="row"><span class="label">Phone</span><span class="value">${opts.devoteePhone}</span></div>
    <div class="row"><span class="label">Service</span><span class="value">${opts.serviceName}</span></div>
    <div class="row"><span class="label">Date</span><span class="value">${opts.serviceDate}</span></div>
    ${opts.occasion ? `<div class="row"><span class="label">Occasion</span><span class="value">${opts.occasion}</span></div>` : ""}
    ${opts.notes ? `<div class="row"><span class="label">Notes</span><span class="value">${opts.notes}</span></div>` : ""}
    <div class="row"><span class="label">Amount</span><span class="value" style="color:#C67C2C">${opts.amount}</span></div>
    <div class="row"><span class="label">Receipt #</span><span class="value" style="font-family:monospace">${opts.receiptNo}</span></div>
    ${opts.paymentMode ? `<div class="row"><span class="label">Payment</span><span class="value">${opts.paymentMode}${opts.paymentGateway ? ` (${opts.paymentGateway})` : ""}</span></div>` : ""}
  </div>
</div></body></html>`;
}

function adminDonationHtml(opts: {
  donorName: string; donorEmail: string; donorPhone: string;
  cause: string; amount: string; receiptNo: string;
  paymentMode?: string; checkRef?: string; message?: string; isWalkin?: boolean;
}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;color:#222;margin:0;padding:0}
  .wrap{max-width:560px;margin:0 auto;padding:24px 18px}
  .header{background:#7B1B1B;color:#fff;padding:16px 20px;border-radius:6px 6px 0 0}
  .header h2{margin:0;font-size:16px}
  .body{background:#f9f9f9;border:1px solid #ddd;border-top:none;padding:18px;border-radius:0 0 6px 6px}
  .row{display:flex;padding:6px 0;border-bottom:1px solid #eee;font-size:13px}
  .row:last-child{border:none} .label{width:130px;color:#777;flex-shrink:0} .value{font-weight:600}
  </style></head><body>
<div class="wrap">
  <div class="header"><h2>💚 ${opts.isWalkin ? "Walk-in " : ""}Donation ${opts.isWalkin ? "Recorded" : "Received"}</h2></div>
  <div class="body">
    <div class="row"><span class="label">Donor</span><span class="value">${opts.donorName}</span></div>
    <div class="row"><span class="label">Email</span><span class="value">${opts.donorEmail}</span></div>
    <div class="row"><span class="label">Phone</span><span class="value">${opts.donorPhone}</span></div>
    <div class="row"><span class="label">Purpose</span><span class="value">${opts.cause}</span></div>
    ${opts.message ? `<div class="row"><span class="label">Dedication</span><span class="value">${opts.message}</span></div>` : ""}
    <div class="row"><span class="label">Amount</span><span class="value" style="color:#C67C2C">${opts.amount}</span></div>
    <div class="row"><span class="label">Receipt #</span><span class="value" style="font-family:monospace">${opts.receiptNo}</span></div>
    ${opts.paymentMode ? `<div class="row"><span class="label">Payment</span><span class="value">${opts.paymentMode}${opts.checkRef ? ` — ${opts.checkRef}` : ""}</span></div>` : ""}
  </div>
</div></body></html>`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendBookingEmails(
  bookingId: string,
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000"
): Promise<void> {
  const cfg = await getEmailConfig();
  if (!cfg) { console.log("Email: Gmail not configured, skipping."); return; }

  const bookingRaw = await db.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, user: true },
  });
  if (!bookingRaw) return;
  // guestToken / paymentGateway exist in schema; Prisma client needs regeneration to reflect them
  const booking = bookingRaw as typeof bookingRaw & { guestToken?: string | null; paymentGateway?: string | null };

  const transport   = createTransport(cfg.user, cfg.pass);
  const receiptNo   = booking.receiptNumber || `VGCC/BKG/${bookingId.slice(-6).toUpperCase()}`;
  const devoteeName = booking.user?.name  || booking.guestName  || "Devotee";
  const devoteeEmail = booking.user?.email || booking.guestEmail;
  const devoteePhone = booking.user?.phone || booking.guestPhone || "N/A";

  const receiptLink = booking.guestToken
    ? `${appUrl}/api/receipts/booking/${bookingId}?token=${booking.guestToken}`
    : booking.userId
      ? `${appUrl}/dashboard/bookings`
      : `${appUrl}/api/receipts/booking/${bookingId}`;

  let pdfBuffer: Buffer;
  try { pdfBuffer = await buildBookingPdf(booking, appUrl); }
  catch (err) { console.error("Email: Booking PDF failed:", err); return; }

  const attach = [{
    filename:    `booking-receipt-${receiptNo}.pdf`,
    content:     pdfBuffer,
    contentType: "application/pdf",
  }];

  if (devoteeEmail) {
    transport.sendMail({
      from: `"${TEMPLE.name}" <${cfg.user}>`,
      to:   devoteeEmail,
      subject: `✅ Booking Confirmed – ${booking.service.name} | ${TEMPLE.name}`,
      html: bookingConfirmHtml({
        devoteeName, serviceName: booking.service.name,
        serviceDate: formatDate(booking.date), amount: formatCurrency(booking.amount),
        receiptNo, receiptLink, occasion: booking.occasion || undefined,
      }),
      attachments: attach,
    }).catch((e) => console.error("Email: devotee booking send failed:", e));
  }

  transport.sendMail({
    from: `"${TEMPLE.name}" <${cfg.user}>`,
    to:   cfg.adminEmails.join(", "),
    subject: `${booking.isAdminEntry ? "[Walk-in] " : ""}New Booking: ${booking.service.name} – ${devoteeName}`,
    html: adminBookingHtml({
      devoteeName, devoteeEmail: devoteeEmail || "N/A", devoteePhone,
      serviceName: booking.service.name, serviceDate: formatDate(booking.date),
      amount: formatCurrency(booking.amount), receiptNo,
      occasion: booking.occasion || undefined, notes: booking.notes || undefined,
      paymentGateway: booking.paymentGateway || undefined,
      paymentMode: booking.paymentMode,
      isWalkin: booking.isAdminEntry,
    }),
    attachments: attach,
  }).catch((e) => console.error("Email: admin booking send failed:", e));
}

export async function sendDonationEmails(
  donationId: string,
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000"
): Promise<void> {
  const cfg = await getEmailConfig();
  if (!cfg) { console.log("Email: Gmail not configured, skipping."); return; }

  const donationRaw = await db.donation.findUnique({
    where: { id: donationId },
    include: { user: true },
  });
  if (!donationRaw) return;
  // guestToken exists in schema; Prisma client needs regeneration to reflect it
  const donation = donationRaw as typeof donationRaw & { guestToken?: string | null };

  const transport  = createTransport(cfg.user, cfg.pass);
  const receiptNo  = donation.receiptNumber || `VGCC/DON/${donationId.slice(-6).toUpperCase()}`;
  const donorName  = donation.user?.name  || donation.guestName  || "Devotee";
  const donorEmail = donation.user?.email || donation.guestEmail;
  const donorPhone = donation.user?.phone || donation.guestPhone || "N/A";

  const receiptLink = donation.guestToken
    ? `${appUrl}/api/receipts/donation/${donationId}?token=${donation.guestToken}`
    : donation.userId
      ? `${appUrl}/dashboard/donations`
      : `${appUrl}/api/receipts/donation/${donationId}`;

  let pdfBuffer: Buffer;
  try { pdfBuffer = await buildDonationPdf(donation, appUrl); }
  catch (err) { console.error("Email: Donation PDF failed:", err); return; }

  const attach = [{
    filename:    `donation-receipt-${receiptNo}.pdf`,
    content:     pdfBuffer,
    contentType: "application/pdf",
  }];

  if (donorEmail) {
    transport.sendMail({
      from: `"${TEMPLE.name}" <${cfg.user}>`,
      to:   donorEmail,
      subject: `✅ Donation Received – ${donation.cause} | ${TEMPLE.name}`,
      html: donationConfirmHtml({
        donorName, cause: donation.cause, amount: formatCurrency(donation.amount),
        receiptNo, receiptLink, message: donation.message || undefined,
      }),
      attachments: attach,
    }).catch((e) => console.error("Email: donor send failed:", e));
  }

  transport.sendMail({
    from: `"${TEMPLE.name}" <${cfg.user}>`,
    to:   cfg.adminEmails.join(", "),
    subject: `${donation.isAdminEntry ? "[Walk-in] " : ""}Donation: ${donation.cause} – ${donorName} (${formatCurrency(donation.amount)})`,
    html: adminDonationHtml({
      donorName, donorEmail: donorEmail || "N/A", donorPhone,
      cause: donation.cause, amount: formatCurrency(donation.amount),
      receiptNo, paymentMode: donation.paymentMode,
      checkRef: donation.checkRef || undefined,
      message: donation.message || undefined,
      isWalkin: donation.isAdminEntry,
    }),
    attachments: attach,
  }).catch((e) => console.error("Email: admin donation send failed:", e));
}

export async function sendContactNotification(opts: {
  name: string; email: string; phone?: string | null; message: string;
}): Promise<void> {
  const cfg = await getEmailConfig();
  if (!cfg) { console.log("Email: Gmail not configured, skipping contact notification."); return; }

  const transport = createTransport(cfg.user, cfg.pass);

  // Notify admin
  transport.sendMail({
    from:    `"${TEMPLE.name}" <${cfg.user}>`,
    to:      cfg.adminEmails.join(", "),
    replyTo: opts.email,
    subject: `📬 New Contact Message from ${opts.name}`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,sans-serif;color:#222;margin:0;padding:0}
      .wrap{max-width:560px;margin:0 auto;padding:24px 18px}
      .header{background:#7B1B1B;color:#fff;padding:16px 20px;border-radius:6px 6px 0 0}
      .header h2{margin:0;font-size:16px}
      .body{background:#f9f9f9;border:1px solid #ddd;border-top:none;padding:18px;border-radius:0 0 6px 6px}
      .row{display:flex;padding:6px 0;border-bottom:1px solid #eee;font-size:13px}
      .row:last-child{border:none} .label{width:110px;color:#777;flex-shrink:0} .value{font-weight:600}
      .msg{background:#fff;border:1px solid #e0e0e0;border-radius:4px;padding:12px;margin-top:12px;font-size:13px;line-height:1.6;white-space:pre-wrap}
    </style></head><body>
    <div class="wrap">
      <div class="header"><h2>📬 New Contact Message</h2></div>
      <div class="body">
        <div class="row"><span class="label">From</span><span class="value">${opts.name}</span></div>
        <div class="row"><span class="label">Email</span><span class="value"><a href="mailto:${opts.email}" style="color:#C67C2C">${opts.email}</a></span></div>
        ${opts.phone ? `<div class="row"><span class="label">Phone</span><span class="value">${opts.phone}</span></div>` : ""}
        <div class="msg">${opts.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
      </div>
    </div></body></html>`,
  }).catch((e) => console.error("Email: contact admin notify failed:", e));

  // Auto-reply to sender
  transport.sendMail({
    from:    `"${TEMPLE.name}" <${cfg.user}>`,
    to:      opts.email,
    subject: `We received your message — ${TEMPLE.name}`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}</style></head><body>
    <div class="wrap">
      <div class="header"><h1>🛕 ${TEMPLE.name}</h1><p>${TEMPLE.address}</p></div>
      <div class="body">
        <p>Dear <strong>${opts.name}</strong>,</p>
        <p>Namaste! Thank you for reaching out to <strong>${TEMPLE.name}</strong>. We have received your message and our team will get back to you within 1–2 business days.</p>
        <hr class="divider">
        <p style="font-size:13px;color:#555">If your matter is urgent, please call us directly:</p>
        <p style="font-size:13px"><a href="tel:${TEMPLE.phones[0]}" style="color:#C67C2C">${TEMPLE.phones[0]}</a> · <a href="mailto:${TEMPLE.emails[0]}" style="color:#C67C2C">${TEMPLE.emails[0]}</a></p>
        <p style="font-size:12px;color:#C67C2C;text-align:center;margin-top:16px">🙏 Jai Sri Veda Gayatri 🙏</p>
      </div>
      <div class="footer">&copy; ${YEAR} ${TEMPLE.name}</div>
    </div></body></html>`,
  }).catch((e) => console.error("Email: contact auto-reply failed:", e));
}

export async function sendPasswordResetEmail(opts: {
  email: string; name?: string | null; resetUrl: string;
}): Promise<void> {
  const cfg = await getEmailConfig();
  if (!cfg) { console.log(`[Password Reset] ${opts.email}: ${opts.resetUrl}`); return; }

  const transport = createTransport(cfg.user, cfg.pass);
  const name = opts.name || opts.email;

  transport.sendMail({
    from:    `"${TEMPLE.name}" <${cfg.user}>`,
    to:      opts.email,
    subject: `🔑 Reset Your Password — ${TEMPLE.name}`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles}
      .reset-btn{display:inline-block;margin:20px 0 8px;padding:13px 32px;background:#7B1B1B;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-family:Georgia,serif;letter-spacing:0.02em}
      .notice{background:#FFF3CD;border:1px solid #FFDA6A;border-radius:6px;padding:10px 14px;font-size:12px;color:#856404;margin-top:14px}
    </style></head><body>
    <div class="wrap">
      <div class="header"><h1>🛕 ${TEMPLE.name}</h1><p>${TEMPLE.address}</p></div>
      <div class="body">
        <p>Dear <strong>${name}</strong>,</p>
        <p>We received a request to reset the password for your account at <strong>${TEMPLE.name}</strong>.</p>
        <p style="font-size:13px">Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align:center">
          <a href="${opts.resetUrl}" class="reset-btn">🔑 Reset My Password</a>
        </div>
        <div class="notice">If you did not request a password reset, you can safely ignore this email. Your account is secure.</div>
        <hr class="divider">
        <p style="font-size:12px;color:#666">If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${opts.resetUrl}" style="color:#C67C2C;word-break:break-all">${opts.resetUrl}</a>
        </p>
      </div>
      <div class="footer">&copy; ${YEAR} ${TEMPLE.name}</div>
    </div></body></html>`,
  }).catch((e) => console.error("Email: password reset send failed:", e));
}
