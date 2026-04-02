const nodemailer = require('nodemailer');
const db = require('../config/db');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Force IPv4 to avoid ENETUNREACH on IPv6-only resolution in restricted networks
  family: 4,
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ [EmailQueue] SMTP connection error:', error.message);
  } else {
    console.log('✅ [EmailQueue] SMTP server is ready to take messages');
  }
});

/**
 * Generates the styled HTML string for the scan report.
 */
const getScanReportHTML = (summary, zombies = []) => {
  const {
    accountName = 'Your Account',
    region = 'us-east-1',
    zombies_found = 0,
    estimated_monthly_savings_usd = 0,
    breakdown = {},
    scannedAt = new Date().toISOString(),
  } = summary;

  const savingsFormatted = `$${Number(estimated_monthly_savings_usd).toFixed(2)}`;
  const annualSavings = `$${(Number(estimated_monthly_savings_usd) * 12).toLocaleString()}`;
  const scanDate = new Date(scannedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const breakdownRows = Object.entries(breakdown)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `
            <tr>
                <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151;">
                    ${type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </td>
                <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#dc2626;text-align:center;">
                    ${count}
                </td>
            </tr>
        `).join('');

  const zombieTableRows = zombies.slice(0, 10).map(z => `
        <tr>
            <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;font-family:monospace;font-size:12px;color:#111827;">${z.external_id}</td>
            <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#6b7280;">${(z.resource_type || '').replace(/_/g, ' ').toUpperCase()}</td>
            <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#dc2626;font-weight:700;">$${Number(z.estimated_monthly_cost || 0).toFixed(2)}/mo</td>
        </tr>
    `).join('');

  const moreNote = zombies.length > 10
    ? `<p style="margin:8px 0 0;font-size:12px;color:#6b7280;text-align:center;">...and ${zombies.length - 10} more. View all in your dashboard.</p>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 40px;text-align:center;">
      <p style="margin:0 0 6px;font-size:13px;color:#00d65b;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">⚡ GreenOps Reaper</p>
      <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;">Automated Scan Report</h1>
      <p style="margin:8px 0 0;font-size:13px;color:#94a3b8;">${accountName} · ${region} · ${scanDate}</p>
    </td>
  </tr>

  <!-- Stats Row -->
  <tr>
    <td style="padding:32px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" style="padding-right:8px;">
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.06em;text-transform:uppercase;">Zombies Found</p>
              <p style="margin:0;font-size:36px;font-weight:800;color:#dc2626;">${zombies_found}</p>
            </div>
          </td>
          <td width="50%" style="padding-left:8px;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.06em;text-transform:uppercase;">Monthly Waste</p>
              <p style="margin:0;font-size:36px;font-weight:800;color:#00d65b;">${savingsFormatted}</p>
            </div>
          </td>
        </tr>
      </table>
      <p style="text-align:center;margin:12px 0 0;font-size:13px;color:#ef4444;font-weight:600;">
        💸 Projected annual waste: <strong>${annualSavings}</strong>
      </p>
    </td>
  </tr>

  ${breakdownRows ? `
  <!-- Breakdown -->
  <tr>
    <td style="padding:28px 40px 0;">
      <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.05em;">By Resource Type</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <tr style="background:#f9fafb;">
          <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.05em;">Resource Type</th>
          <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#6b7280;text-align:center;text-transform:uppercase;letter-spacing:0.05em;">Count</th>
        </tr>
        ${breakdownRows}
      </table>
    </td>
  </tr>` : ''}

  ${zombieTableRows ? `
  <!-- Top Resources -->
  <tr>
    <td style="padding:24px 40px 0;">
      <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.05em;">Top Zombie Resources</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <tr style="background:#f9fafb;">
          <th style="padding:10px 14px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;">Resource ID</th>
          <th style="padding:10px 14px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;">Type</th>
          <th style="padding:10px 14px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;">Cost/mo</th>
        </tr>
        ${zombieTableRows}
      </table>
      ${moreNote}
    </td>
  </tr>` : ''}

  <!-- CTA -->
  <tr>
    <td style="padding:32px 40px;text-align:center;">
      <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard"
         style="background:#00d65b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;">
        ⚡ View Dashboard &amp; Reap Resources
      </a>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        This is an automated report from GreenOps Reaper. Manage your automation settings in your dashboard.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
};

/**
 * Sends a styled HTML scan report email.
 * @param {string} to - recipient email
 * @param {object} summary - { accountName, region, zombies_found, estimated_monthly_savings_usd, breakdown, scannedAt }
 * @param {Array}  zombies - array of zombie_resource rows
 */
const sendScanReport = async (to, summary, zombies = []) => {
  const html = getScanReportHTML(summary, zombies);
  const savingsFormatted = `$${Number(summary.estimated_monthly_savings_usd || 0).toFixed(2)}`;
  const subject = `⚡ Scan Report: ${summary.zombies_found || 0} zombie${summary.zombies_found !== 1 ? 's' : ''} found in ${summary.accountName || 'Your Account'} — ${savingsFormatted}/mo wasted`;

  await queueEmail(to, subject, html);
};

/**
 * Inserts an email into the DB queue.
 */
const queueEmail = async (to_email, subject, html_content) => {
  try {
    await db.query(
      'INSERT INTO email_queue (to_email, subject, html_content) VALUES ($1, $2, $3)',
      [to_email, subject, html_content]
    );
    console.log(`[EmailQueue] Queued email to ${to_email}`);
  } catch (err) {
    console.error('[EmailQueue] Failed to queue email:', err);
  }
};

/**
 * Processes pending emails from the DB queue.
 */
const processEmailQueue = async () => {
  try {
    // Grab up to 10 pending emails
    const pending = await db.query(
      "SELECT id, to_email, subject, html_content, attempts FROM email_queue WHERE status = 'pending' LIMIT 10"
    );

    if (pending.rows.length === 0) return;

    console.log(`[EmailQueue] Processing ${pending.rows.length} pending email(s)...`);

    for (const job of pending.rows) {
      try {
        // Mark as processing
        await db.query("UPDATE email_queue SET status = 'processing', attempts = attempts + 1 WHERE id = $1", [job.id]);

        // Send email
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"GreenOps Reaper" <noreply@greenops.io>',
          to: job.to_email,
          subject: job.subject,
          html: job.html_content,
        });

        // Mark successful
        await db.query("UPDATE email_queue SET status = 'sent', sent_at = NOW() WHERE id = $1", [job.id]);
        console.log(`[EmailQueue] Sent and cleared job ${job.id} to ${job.to_email}`);
      } catch (sendErr) {
        console.error(`[EmailQueue] Job ${job.id} failed:`, sendErr);
        // Mark failed or pending if retries remain
        const newStatus = job.attempts >= 2 ? 'failed' : 'pending';
        await db.query("UPDATE email_queue SET status = $1 WHERE id = $2", [newStatus, job.id]);
      }
    }
  } catch (err) {
    console.error('[EmailQueue] Worker error:', err);
  }
};

module.exports = { sendScanReport, queueEmail, processEmailQueue, getScanReportHTML };
