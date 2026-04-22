#!/usr/bin/env node

const API_BASE = "https://api.resend.com";
const TEMPLATE_NAME = process.env.RESEND_TEMPLATE_NAME || "wardstudio-contact-inquiry";
const TEMPLATE_ALIAS = process.env.RESEND_CONTACT_TEMPLATE_ALIAS || "wardstudio-contact-inquiry";
const TEMPLATE_FROM = process.env.CONTACT_FROM_EMAIL || "Ward Studio <noreply@zward.studio>";
const TEMPLATE_SUBJECT = "New portfolio inquiry from {{{CONTACT_NAME}}}";

const TEMPLATE_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
    <title>New portfolio inquiry</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f6;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
      New project inquiry from {{{CONTACT_NAME}}} with budget {{{CONTACT_BUDGET}}}.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#f6f6f6;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 16px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #e7e7e7;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 16px 32px;background:#ffffff;">
                <p style="margin:0 0 8px 0;font-size:12px;line-height:1.4;letter-spacing:0.12em;text-transform:uppercase;color:#6b6b6b;">Ward Studio</p>
                <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:700;color:#111111;">New portfolio inquiry</h1>
                <p style="margin:12px 0 0 0;font-size:15px;line-height:1.7;color:#4f4f4f;">A new inquiry was submitted through the contact form.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0 32px;background:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:12px 0;width:180px;border-top:1px solid #ececec;font-size:13px;line-height:1.5;font-weight:700;color:#111111;vertical-align:top;">Name</td>
                    <td style="padding:12px 0;border-top:1px solid #ececec;font-size:14px;line-height:1.6;color:#333333;vertical-align:top;">{{{CONTACT_NAME}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;width:180px;border-top:1px solid #ececec;font-size:13px;line-height:1.5;font-weight:700;color:#111111;vertical-align:top;">Company</td>
                    <td style="padding:12px 0;border-top:1px solid #ececec;font-size:14px;line-height:1.6;color:#333333;vertical-align:top;">{{{CONTACT_COMPANY}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;width:180px;border-top:1px solid #ececec;font-size:13px;line-height:1.5;font-weight:700;color:#111111;vertical-align:top;">Email</td>
                    <td style="padding:12px 0;border-top:1px solid #ececec;font-size:14px;line-height:1.6;color:#333333;vertical-align:top;">{{{CONTACT_EMAIL}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;width:180px;border-top:1px solid #ececec;font-size:13px;line-height:1.5;font-weight:700;color:#111111;vertical-align:top;">Budget</td>
                    <td style="padding:12px 0;border-top:1px solid #ececec;font-size:14px;line-height:1.6;color:#333333;vertical-align:top;">{{{CONTACT_BUDGET}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;width:180px;border-top:1px solid #ececec;font-size:13px;line-height:1.5;font-weight:700;color:#111111;vertical-align:top;">Timeline</td>
                    <td style="padding:12px 0;border-top:1px solid #ececec;font-size:14px;line-height:1.6;color:#333333;vertical-align:top;">{{{CONTACT_TIMELINE}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;width:180px;border-top:1px solid #ececec;font-size:13px;line-height:1.5;font-weight:700;color:#111111;vertical-align:top;">Project type</td>
                    <td style="padding:12px 0;border-top:1px solid #ececec;font-size:14px;line-height:1.6;color:#333333;vertical-align:top;">{{{CONTACT_PROJECT_TYPE}}}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;width:180px;border-top:1px solid #ececec;font-size:13px;line-height:1.5;font-weight:700;color:#111111;vertical-align:top;">Submitted</td>
                    <td style="padding:12px 0;border-top:1px solid #ececec;font-size:14px;line-height:1.6;color:#333333;vertical-align:top;">{{{SUBMITTED_AT}}}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;background:#ffffff;">
                <p style="margin:0 0 10px 0;font-size:13px;line-height:1.5;font-weight:700;color:#111111;">Project goals</p>
                <div style="margin:0;padding:16px;border:1px solid #ececec;border-radius:10px;background:#fafafa;font-size:14px;line-height:1.8;color:#333333;">
                  {{{CONTACT_GOALS_HTML}}}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px 32px;background:#ffffff;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#7a7a7a;">Reply directly to this email to continue the conversation with the sender.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const TEMPLATE_TEXT = `New portfolio inquiry

Name: {{{CONTACT_NAME}}}
Company: {{{CONTACT_COMPANY}}}
Email: {{{CONTACT_EMAIL}}}
Budget: {{{CONTACT_BUDGET}}}
Timeline: {{{CONTACT_TIMELINE}}}
Project type: {{{CONTACT_PROJECT_TYPE}}}
Submitted: {{{SUBMITTED_AT}}}

Project goals:
{{{CONTACT_GOALS_HTML}}}`;

const TEMPLATE_VARIABLES = [
  { key: "CONTACT_NAME", type: "string", fallback_value: "New lead" },
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

function templatePayload() {
  return {
    name: TEMPLATE_NAME,
    alias: TEMPLATE_ALIAS,
    from: TEMPLATE_FROM,
    subject: TEMPLATE_SUBJECT,
    html: TEMPLATE_HTML,
    text: TEMPLATE_TEXT,
    variables: TEMPLATE_VARIABLES,
  };
}

function requireTemplateId(args) {
  const templateId = args.id || args._[1] || process.env.RESEND_CONTACT_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("Template id is required. Provide --id=... or set RESEND_CONTACT_TEMPLATE_ID.");
  }
  return templateId;
}

function getTemplateId(payload) {
  return payload?.id || payload?.data?.id || payload?.template?.id || "";
}

async function publishTemplate(templateId) {
  return resendRequest(`/templates/${encodeURIComponent(templateId)}/publish`, {
    method: "POST",
  });
}

function shouldPublish(args) {
  return args.publish === "true" || args.publish === true;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (!command) {
    throw new Error(
      "Usage: node scripts/resend-templates.mjs <create|get|update|publish|duplicate|delete|list> [--id=...] [--publish]",
    );
  }

  if (command === "create") {
    const payload = await resendRequest("/templates", {
      method: "POST",
      body: templatePayload(),
    });

    const templateId = getTemplateId(payload);
    const result = { create: payload, publish: null };
    if (shouldPublish(args)) {
      if (!templateId) {
        throw new Error("Template was created, but no template id was returned for publish.");
      }
      result.publish = await publishTemplate(templateId);
    }

    console.log(JSON.stringify(result, null, 2));
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
      body: templatePayload(),
    });

    const result = { update: payload, publish: null };
    if (shouldPublish(args)) {
      result.publish = await publishTemplate(templateId);
    }

    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === "publish") {
    const templateId = requireTemplateId(args);
    const payload = await publishTemplate(templateId);
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
