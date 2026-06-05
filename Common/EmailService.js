const nodemailer = require("nodemailer");

const isDummyConfig =
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASS ||
  process.env.EMAIL_PASS === "your_gmail_app_password_here";

const transporter = isDummyConfig
  ? null
  : nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      family: 4,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

// ─── Password Reset Link Email ─────────────────────────────────────────────────
exports.sendPasswordResetEmail = async (toEmail, userName, resetUrl) => {
  if (isDummyConfig) {
    console.log("\n─── [DEV] Password Reset Email ─────────────────────────");
    console.log(`  To:   ${toEmail}`);
    console.log(`  Name: ${userName}`);
    console.log(`  Link: ${resetUrl}`);
    console.log("────────────────────────────────────────────────────────\n");
    return;
  }

  const mailOptions = {
    from: `"QREventix" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset Your QREventix Password",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
        <div style="background:#4f46e5;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:2px;">QREventix</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;letter-spacing:3px;">EVENT PLATFORM</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="color:#1e293b;margin:0 0 12px;">Hi ${userName},</h2>
          <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
            We received a request to reset the password for your QREventix account.
            Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}"
               style="background:#4f46e5;color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;display:inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;line-height:1.6;">
            If you didn't request a password reset, you can safely ignore this email — your password won't change.<br><br>
            Or copy this link into your browser:<br>
            <span style="color:#4f46e5;word-break:break-all;">${resetUrl}</span>
          </p>
        </div>
        <div style="background:#e2e8f0;padding:16px 32px;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 QREventix. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ─── Contact Form: Admin Notification ─────────────────────────────────────────
exports.sendContactNotification = async (adminEmail, { name, email, message, createdAt }) => {
  if (isDummyConfig) {
    console.log("\n─── [DEV] Contact Notification → Admin ─────────────────");
    console.log(`  From: ${name} <${email}>`);
    console.log(`  Msg:  ${message}`);
    console.log("────────────────────────────────────────────────────────\n");
    return;
  }

  await transporter.sendMail({
    from: `"QREventix" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Contact Enquiry from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
        <div style="background:#4f46e5;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">New Contact Enquiry</h1>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">QREventix Admin Notification</p>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:90px;">Name</td><td style="padding:8px 0;color:#1e293b;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#4f46e5;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Date</td><td style="padding:8px 0;color:#1e293b;">${createdAt || new Date().toISOString()}</td></tr>
          </table>
          <div style="margin-top:20px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
            <p style="color:#64748b;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Message</p>
            <p style="color:#1e293b;line-height:1.6;margin:0;">${message}</p>
          </div>
          <div style="margin-top:20px;text-align:center;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/submissions"
               style="background:#4f46e5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;display:inline-block;">
              View in Admin Panel
            </a>
          </div>
        </div>
        <div style="background:#e2e8f0;padding:14px 32px;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 QREventix. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// ─── Contact Form: User Confirmation ──────────────────────────────────────────
exports.sendContactConfirmation = async (userEmail, userName) => {
  if (isDummyConfig) {
    console.log("\n─── [DEV] Contact Confirmation → User ──────────────────");
    console.log(`  To:   ${userName} <${userEmail}>`);
    console.log("────────────────────────────────────────────────────────\n");
    return;
  }

  await transporter.sendMail({
    from: `"QREventix Support" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "We've received your message — QREventix",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
        <div style="background:#4f46e5;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:2px;">QREventix</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;letter-spacing:3px;">SUPPORT TEAM</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="color:#1e293b;margin:0 0 12px;">Hi ${userName},</h2>
          <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
            Thank you for reaching out! We've received your message and our support team will get back to you within <strong>24 hours</strong>.
          </p>
          <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
            In the meantime, you might find answers to common questions in our
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/help" style="color:#4f46e5;">Help Center</a>.
          </p>
          <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6;">
            If you have an urgent issue, please visit our
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/report-issue" style="color:#4f46e5;">Report Issue</a> page.
          </p>
        </div>
        <div style="background:#e2e8f0;padding:16px 32px;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 QREventix. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// ─── Report Issue: Admin Notification ─────────────────────────────────────────
exports.sendReportIssueNotification = async (adminEmail, { issueType, description, createdAt }) => {
  if (isDummyConfig) {
    console.log("\n─── [DEV] Report Issue Notification → Admin ────────────");
    console.log(`  Type: ${issueType}`);
    console.log(`  Desc: ${description}`);
    console.log("────────────────────────────────────────────────────────\n");
    return;
  }

  await transporter.sendMail({
    from: `"QREventix" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Issue Report: ${issueType}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
        <div style="background:#dc2626;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">New Issue Report</h1>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">QREventix Admin Notification</p>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:90px;">Type</td><td style="padding:8px 0;color:#1e293b;font-weight:600;">${issueType}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Date</td><td style="padding:8px 0;color:#1e293b;">${createdAt || new Date().toISOString()}</td></tr>
          </table>
          <div style="margin-top:20px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
            <p style="color:#64748b;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Description</p>
            <p style="color:#1e293b;line-height:1.6;margin:0;">${description}</p>
          </div>
          <div style="margin-top:20px;text-align:center;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/submissions"
               style="background:#dc2626;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;display:inline-block;">
              View in Admin Panel
            </a>
          </div>
        </div>
        <div style="background:#e2e8f0;padding:14px 32px;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 QREventix. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// ─── Password Reset Confirmation ──────────────────────────────────────────────
exports.sendPasswordResetConfirm = async (toEmail, userName) => {
  if (isDummyConfig) {
    console.log("\n─── [DEV] Password Reset Confirmation ──────────────────");
    console.log(`  To:   ${toEmail}`);
    console.log(`  Name: ${userName}`);
    console.log("────────────────────────────────────────────────────────\n");
    return;
  }

  await transporter.sendMail({
    from: `"QREventix Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your QREventix Password Has Been Reset",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
        <div style="background:#4f46e5;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:2px;">QREventix</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;letter-spacing:3px;">SECURITY NOTICE</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="color:#1e293b;margin:0 0 12px;">Hi ${userName},</h2>
          <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
            Your QREventix password was successfully reset just now. All previous sessions have been signed out for your security.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
            <p style="color:#166534;font-size:14px;margin:0;font-weight:600;">✓ Password changed successfully</p>
          </div>
          <p style="color:#475569;line-height:1.6;margin:0 0 12px;font-size:14px;">
            If you did <strong>not</strong> make this change, your account may be compromised. Please contact support immediately or reset your password again.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.WEB_URL || "http://localhost:5173"}/login"
               style="background:#4f46e5;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:700;font-size:14px;display:inline-block;">
              Go to Login
            </a>
          </div>
        </div>
        <div style="background:#e2e8f0;padding:16px 32px;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 QREventix. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// ─── OTP Email (email-verify & password-reset) ─────────────────────────────────
exports.sendOtpEmail = async (toEmail, code, type) => {
  const isVerify = type === "email-verify";
  const subject = isVerify
    ? "Your QREventix Email Verification Code"
    : "Your QREventix Password Reset Code";

  const headline = isVerify ? "Verify your email" : "Reset your password";
  const bodyText = isVerify
    ? "Use the code below to verify your email address. It expires in <strong>10 minutes</strong>."
    : "Use the code below to reset your password. It expires in <strong>10 minutes</strong>.";

  if (isDummyConfig) {
    console.log(`\n─── [DEV] OTP Email (${type}) ───────────────────────────`);
    console.log(`  To:   ${toEmail}`);
    console.log(`  Code: ${code}`);
    console.log("────────────────────────────────────────────────────────\n");
    return;
  }

  const mailOptions = {
    from: `"QREventix" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
        <div style="background:#4f46e5;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:2px;">QREventix</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;letter-spacing:3px;">EVENT PLATFORM</p>
        </div>
        <div style="padding:40px 32px;text-align:center;">
          <h2 style="color:#1e293b;margin:0 0 12px;">${headline}</h2>
          <p style="color:#475569;line-height:1.6;margin:0 0 32px;">${bodyText}</p>
          <div style="display:inline-block;background:#eef2ff;border:2px dashed #6366f1;border-radius:16px;padding:24px 40px;">
            <p style="margin:0 0 4px;font-size:12px;color:#6366f1;font-weight:600;letter-spacing:2px;">YOUR CODE</p>
            <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:12px;color:#3730a3;">${code}</p>
          </div>
          <p style="color:#94a3b8;font-size:13px;margin:32px 0 0;line-height:1.6;">
            This code expires in 10 minutes.<br>
            If you didn't request this, please ignore this email.
          </p>
        </div>
        <div style="background:#e2e8f0;padding:16px 32px;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 QREventix. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
