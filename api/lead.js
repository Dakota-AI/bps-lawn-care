const MAX_FIELD_LENGTH = 1000;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clean(value, maxLength = MAX_FIELD_LENGTH) {
  return String(value || '').trim().slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildHtml(payload) {
  const rows = [
    ['Name', payload.fullName],
    ['Email', payload.emailAddress],
    ['Phone', payload.phoneNumber || 'Not provided'],
    ['Service address', payload.serviceAddress],
    ['Project notes', payload.projectNotes || 'None'],
    ['Submitted at', payload.submittedAt],
  ];

  const tableRows = rows
    .map(([label, value]) => {
      return `<tr><th align="left" style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(value)}</td></tr>`;
    })
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#102015;">
      <h2>New BP's Lawn Care quote request</h2>
      <p>A new website lead came in. Reply to the customer as soon as possible.</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:680px;">${tableRows}</table>
    </div>
  `;
}

function buildText(payload) {
  return [
    "New BP's Lawn Care quote request",
    '',
    `Name: ${payload.fullName}`,
    `Email: ${payload.emailAddress}`,
    `Phone: ${payload.phoneNumber || 'Not provided'}`,
    `Service address: ${payload.serviceAddress}`,
    `Project notes: ${payload.projectNotes || 'None'}`,
    `Submitted at: ${payload.submittedAt}`,
  ].join('\n');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const leadEmailTo = process.env.LEAD_EMAIL_TO || process.env.BRODY_EMAIL;
  const leadEmailFrom = process.env.LEAD_EMAIL_FROM || "BP's Lawn Care <onboarding@resend.dev>";

  if (!resendApiKey || !leadEmailTo) {
    return res.status(500).json({ error: 'Lead email is not configured' });
  }

  const body = req.body || {};
  const payload = {
    business: clean(body.business, 120),
    fullName: clean(body.fullName, 120),
    emailAddress: clean(body.emailAddress, 180),
    serviceAddress: clean(body.serviceAddress, 240),
    phoneNumber: clean(body.phoneNumber, 80),
    projectNotes: clean(body.projectNotes, 1000),
    companyWebsite: clean(body.companyWebsite, 240),
    submittedAt: clean(body.submittedAt, 80) || new Date().toISOString(),
  };

  if (payload.companyWebsite) {
    return res.status(200).json({ ok: true });
  }

  if (!payload.fullName || !isValidEmail(payload.emailAddress) || !payload.serviceAddress) {
    return res.status(400).json({ error: 'Missing required lead fields' });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: leadEmailFrom,
      to: [leadEmailTo],
      reply_to: payload.emailAddress,
      subject: `New BP's Lawn Care quote request from ${payload.fullName}`,
      html: buildHtml(payload),
      text: buildText(payload),
    }),
  });

  if (!response.ok) {
    return res.status(502).json({ error: 'Email provider failed' });
  }

  return res.status(200).json({ ok: true });
};
