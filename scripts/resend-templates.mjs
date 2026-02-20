#!/usr/bin/env node

const API_BASE = "https://api.resend.com";
const TEMPLATE_NAME = process.env.RESEND_TEMPLATE_NAME || "wardstudio-contact-inquiry";

const TEMPLATE_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ward Studio Inquiry</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f6f8;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="width:100%;max-width:680px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:#0f1012;padding:24px 28px;border-bottom:4px solid #f97316;">
                <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a6adbb;margin-bottom:8px;">Ward Studio</div>
                <h1 style="margin:0;font-size:28px;line-height:1.2;color:#ffffff;">New Project Inquiry</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;">
                <p style="margin:0 0 18px 0;font-size:13px;color:#6b7280;">Submitted: {{{SUBMITTED_AT}}}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:14px;color:#6b7280;width:180px;">Name</td>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:15px;color:#111827;">{{{CONTACT_NAME}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:14px;color:#6b7280;">Company</td>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:15px;color:#111827;">{{{CONTACT_COMPANY}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:14px;color:#6b7280;">Email</td>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:15px;color:#111827;">{{{CONTACT_EMAIL}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:14px;color:#6b7280;">Budget</td>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:15px;color:#111827;">{{{CONTACT_BUDGET}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:14px;color:#6b7280;">Timeline</td>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:15px;color:#111827;">{{{CONTACT_TIMELINE}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:14px;color:#6b7280;">Project Type</td>
                    <td style="padding:10px 0;border-top:1px solid #eef0f3;font-size:15px;color:#111827;">{{{CONTACT_PROJECT_TYPE}}}</td>
                  </tr>
                </table>
                <div style="margin-top:22px;">
                  <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">Project Goals</div>
                  <div style="background:#f8fafc;border:1px solid #eef0f3;border-left:3px solid #f97316;border-radius:8px;padding:14px 12px;font-size:15px;line-height:1.5;color:#111827;">
                    {{{CONTACT_GOALS_HTML}}}
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const TEMPLATE_VARIABLES = [
  { key: "CONTACT_NAME", type: "string", fallback_value: "New Lead" },
  { key: "CONTACT_COMPANY", type: "string", fallback_value: "Not provided" },
  { key: "CONTACT_EMAIL", type: "string", fallback_value: "lead@example.com" },
  { key: "CONTACT_BUDGET", type: "string", fallback_value: "Not provided" },
  { key: "CONTACT_TIMELINE", type: "string", fallback_value: "Not provided" },
  { key: "CONTACT_PROJECT_TYPE", type: "string", fallback_value: "Not provided" },
  { key: "CONTACT_GOALS_HTML", type: "string", fallback_value: "No project goals provided." },
  { key: "SUBMITTED_AT", type: "string", fallback_value: "Unknown" },
];

function parseArgs(argv) {
  const result = { _: [] };
  for (const token of argv) {
    if (token.startsWith("--")) {
      const raw = token.slice(2);
      const [key, value] = raw.includes("=") ? raw.split("=", 2) : [raw, "true"];
      result[key] = value;
      continue;
    }
    result._.push(token);
  }
  return result;
}

async function resendRequest(path, options = {}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText;
    throw new Error(`Resend API ${response.status}: ${message}`);
  }

  return payload;
}

function requireTemplateId(args) {
  const templateId = args.id || args._[1] || process.env.RESEND_CONTACT_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("Template id is required. Provide --id=... or set RESEND_CONTACT_TEMPLATE_ID.");
  }
  return templateId;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (!command) {
    throw new Error("Usage: node scripts/resend-templates.mjs <create|get|update|publish|duplicate|delete|list> [--id=...]");
  }

  if (command === "create") {
    const payload = await resendRequest("/templates", {
      method: "POST",
      body: {
        name: TEMPLATE_NAME,
        html: TEMPLATE_HTML,
        variables: TEMPLATE_VARIABLES,
      },
    });
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (command === "get") {
    const templateId = requireTemplateId(args);
    const payload = await resendRequest(`/templates/${encodeURIComponent(templateId)}`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (command === "update") {
    const templateId = requireTemplateId(args);
    const payload = await resendRequest(`/templates/${encodeURIComponent(templateId)}`, {
      method: "PATCH",
      body: {
        name: TEMPLATE_NAME,
        html: TEMPLATE_HTML,
        variables: TEMPLATE_VARIABLES,
      },
    });
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (command === "publish") {
    const templateId = requireTemplateId(args);
    const payload = await resendRequest(`/templates/${encodeURIComponent(templateId)}/publish`, {
      method: "POST",
    });
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (command === "duplicate") {
    const templateId = requireTemplateId(args);
    const payload = await resendRequest(`/templates/${encodeURIComponent(templateId)}/duplicate`, {
      method: "POST",
    });
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (command === "delete") {
    const templateId = requireTemplateId(args);
    const payload = await resendRequest(`/templates/${encodeURIComponent(templateId)}`, {
      method: "DELETE",
    });
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (command === "list") {
    const limit = args.limit || "10";
    const after = args.after ? `&after=${encodeURIComponent(args.after)}` : "";
    const payload = await resendRequest(`/templates?limit=${encodeURIComponent(limit)}${after}`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  throw new Error(`Unknown command "${command}".`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
