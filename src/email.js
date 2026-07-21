/**
 * Resend email. Two jobs: send the visitor their report link, and land the
 * lead in MP's inbox so she can answer it personally — replies to the
 * visitor email go straight to her real address, never a funnel.
 */
const FROM = 'Meschelle Peterson <reports@code63labs.com>';
const REPLY_TO = 'mrpoffice@gmail.com';

async function send(msg) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify(msg),
  });
  if (!res.ok) throw new Error(`resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function sendReportEmail({ to, report, reportUrl }) {
  return send({
    from: FROM, to: [to], reply_to: REPLY_TO,
    subject: `Your report: ${report.title}`,
    html: `
<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #141414; line-height: 1.6;">
  <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #D9401F; font-weight: bold;">Your report is ready</p>
  <h1 style="font-size: 26px; line-height: 1.2; margin: 10px 0;">${esc(report.title)}</h1>
  <p style="font-size: 16px;">${esc(report.diagnosis)}</p>
  <p style="margin: 26px 0;">
    <a href="${reportUrl}" style="background: #141414; color: #F4F1EC; text-decoration: none; padding: 13px 26px; border-radius: 999px; font-family: Arial, sans-serif; font-size: 15px;">Read the full report</a>
  </p>
  <p style="font-size: 15px;">It's short: what's going on, three moves in order, and what my team would set up for you if you'd rather it just get done.</p>
  <p style="font-size: 15px;"><strong>Hit reply and you're writing to me</strong> — a person, not a funnel. No sales calls, ever.</p>
  <p style="font-family: Georgia, serif; font-size: 19px; margin-top: 30px;">Meschelle Peterson</p>
  <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #3A3A3A;">code63labs</p>
</div>`,
  });
}

export async function notifyMP({ trouble, email, reportUrl }) {
  const to = process.env.MP_NOTIFY_EMAIL || REPLY_TO;
  return send({
    from: FROM, to: [to],
    subject: `New lead: ${trouble.slice(0, 60)}${trouble.length > 60 ? '…' : ''}`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 560px; color: #141414; line-height: 1.6;">
  <p><strong>A stranger typed their trouble:</strong></p>
  <blockquote style="border-left: 3px solid #D9401F; margin: 0; padding: 8px 16px; font-style: italic;">${esc(trouble)}</blockquote>
  <p><strong>Email:</strong> ${esc(email)}</p>
  <p><a href="${reportUrl}">The report the team sent them</a></p>
  <p>They were told replying to their report email reaches you directly.</p>
</div>`,
  });
}
