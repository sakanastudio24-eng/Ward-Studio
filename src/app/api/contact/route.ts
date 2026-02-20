import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  DEFAULT_EMAIL_FROM,
  DEFAULT_SERVICE_EMAIL,
} from "../../../config/email";

interface ContactRequestBody {
  name?: string;
  company?: string;
  email?: string;
  budget?: string;
  timeline?: string;
  projectType?: string;
  goals?: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.CONTACT_OWNER_EMAIL || DEFAULT_SERVICE_EMAIL;
  const templateId = process.env.RESEND_CONTACT_TEMPLATE_ID;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || DEFAULT_EMAIL_FROM;

  if (!resendApiKey || !templateId) {
    return NextResponse.json(
      {
        error:
          "Server email config is missing. Set RESEND_API_KEY and RESEND_CONTACT_TEMPLATE_ID.",
      },
      { status: 500 }
    );
  }

  const payload = (await request.json().catch(() => null)) as ContactRequestBody | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const name = getString(payload.name);
  const company = getString(payload.company);
  const email = getString(payload.email);
  const budget = getString(payload.budget);
  const timeline = getString(payload.timeline);
  const projectType = getString(payload.projectType);
  const goals = getString(payload.goals);

  if (!name || !email || !goals) {
    return NextResponse.json(
      { error: "Name, email, and project goals are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const safeName = escapeHtml(name);
  const safeCompany = escapeHtml(company || "Not provided");
  const safeEmail = escapeHtml(email);
  const safeBudget = escapeHtml(budget ? `$${budget}` : "Not provided");
  const safeTimeline = escapeHtml(timeline || "Not provided");
  const safeProjectType = escapeHtml(projectType || "Not provided");
  const safeGoalsHtml = escapeHtml(goals).replaceAll("\n", "<br />");
  const submittedAt = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZoneName: "short",
  });

  const subject = `New portfolio inquiry from ${name}`;

  const resendResponse = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [ownerEmail],
      reply_to: email,
      subject,
      template: {
        id: templateId,
        variables: {
          CONTACT_NAME: safeName,
          CONTACT_COMPANY: safeCompany,
          CONTACT_EMAIL: safeEmail,
          CONTACT_BUDGET: safeBudget,
          CONTACT_TIMELINE: safeTimeline,
          CONTACT_PROJECT_TYPE: safeProjectType,
          CONTACT_GOALS_HTML: safeGoalsHtml,
          SUBMITTED_AT: submittedAt,
        },
      },
    }),
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    return NextResponse.json(
      { error: `Email provider rejected the request: ${details || resendResponse.statusText}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
