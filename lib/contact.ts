import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const HUNTER_VERIFY_URL = "https://api.hunter.io/v2/email-verifier";
const WEB3FORMS_SUBMIT_URL = "https://api.web3forms.com/submit";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const MESSAGE_MAX_LENGTH = 4000;
const BRAND_NAME = "shreyas.cloud";
const BRAND_DOMAIN = "shreyas.cloud";
const BRAND_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://shreyas.cloud";

type ContactSubmission = {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type HunterVerificationResponse = {
  data?: {
    status?: string;
    score?: number;
    disposable?: boolean;
    block?: boolean;
    gibberish?: boolean;
    smtp_check?: boolean;
    accept_all?: boolean;
    regexp?: boolean;
  };
  errors?: Array<{ details?: string }>;
};

type ContactRecord = {
  name: string;
  email: string;
  message: string;
  created_at?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __contactRateLimitStore: Map<string, RateLimitBucket> | undefined;
}

const rateLimitStore = globalThis.__contactRateLimitStore ?? new Map<string, RateLimitBucket>();

if (!globalThis.__contactRateLimitStore) {
  globalThis.__contactRateLimitStore = rateLimitStore;
}

function getEnv(name: string) {
  return process.env[name]?.trim();
}

function getRequiredEnv(name: string) {
  const value = getEnv(name);

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizePlainText(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function normalizeName(value: string) {
  return sanitizePlainText(value).replace(/\s+/g, " ").slice(0, 120);
}

function normalizeEmail(value: string) {
  return sanitizePlainText(value).toLowerCase().slice(0, 254);
}

function normalizeMessage(value: string) {
  return sanitizePlainText(value).slice(0, MESSAGE_MAX_LENGTH);
}

function isEmailFormatValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanupRateLimitStore(now: number) {
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    if (first?.trim()) {
      return first.trim();
    }
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function parseContactSubmission(input: Record<string, unknown>): ContactSubmission {
  return {
    name: normalizeName(String(input.name ?? "")),
    email: normalizeEmail(String(input.email ?? "")),
    message: normalizeMessage(String(input.message ?? "")),
    honeypot: sanitizePlainText(String(input._gotcha ?? input.website ?? input.honeypot ?? "")),
  };
}

export function validateContactSubmission(submission: ContactSubmission) {
  if (!submission.name || submission.name.length < 2) {
    throw new Error("Please enter your name.");
  }

  if (!submission.email || !isEmailFormatValid(submission.email)) {
    throw new Error("Please enter a valid email address");
  }

  if (!submission.message || submission.message.length < 12) {
    throw new Error("Please enter a message with a bit more detail.");
  }
}

export function assertWithinRateLimit(ipAddress: string) {
  const now = Date.now();

  cleanupRateLimitStore(now);

  const key = ipAddress || "unknown";
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw new Error("Too many contact attempts. Please try again in a few minutes.");
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
}

export function isHoneypotTriggered(submission: ContactSubmission) {
  return Boolean(submission.honeypot);
}

async function fetchHunterVerification(email: string) {
  const apiKey = getRequiredEnv("HUNTER_API_KEY");
  const url = new URL(HUNTER_VERIFY_URL);
  url.searchParams.set("email", email);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-KEY": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as HunterVerificationResponse;

  if (!response.ok) {
    const providerMessage = payload.errors?.[0]?.details || "Hunter email verification failed.";
    throw new Error(providerMessage);
  }

  return { response, payload };
}

export async function verifyEmailDeliverability(email: string) {
  const { response, payload } = await fetchHunterVerification(email);

  if (response.status === 202) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const retry = await fetchHunterVerification(email);
    const retryData = retry.payload.data;

    if (!retryData) {
      throw new Error("Please enter a valid email address");
    }

    return evaluateHunterVerification(retryData);
  }

  const data = payload.data;

  if (!data) {
    throw new Error("Please enter a valid email address");
  }

  return evaluateHunterVerification(data);
}

function evaluateHunterVerification(data: NonNullable<HunterVerificationResponse["data"]>) {
  const status = String(data.status ?? "").toLowerCase();
  const score = typeof data.score === "number" ? data.score : 0;
  const isAccepted =
    status === "valid" &&
    data.regexp !== false &&
    data.gibberish !== true &&
    data.disposable !== true &&
    data.block !== true &&
    data.smtp_check !== false &&
    score >= 70;

  if (!isAccepted) {
    throw new Error("Please enter a valid email address");
  }

  return {
    status,
    score,
  };
}

function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function insertContactRecord(record: ContactRecord) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("contacts").insert({
    name: record.name,
    email: record.email,
    message: record.message,
    created_at: record.created_at ?? new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
}

export async function sendOwnerNotification(record: ContactRecord) {
  const transporter = getSmtpTransport();
  const fromEmail = getRequiredEnv("CONTACT_FROM_EMAIL");
  const ownerEmail = getEnv("CONTACT_OWNER_EMAIL") || fromEmail;

  await transporter.sendMail({
    from: `"${BRAND_NAME} Contact" <${fromEmail}>`,
    to: ownerEmail,
    replyTo: record.email,
    subject: `New portfolio contact from ${record.name}`,
    html: `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(record.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(record.email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(record.message).replace(/\\n/g, "<br>")}</p>
    `.trim(),
    text: `Name: ${record.name}\nEmail: ${record.email}\nMessage:\n${record.message}`,
  });
}

function getSmtpTransport() {
  const port = Number(getRequiredEnv("SMTP_PORT"));

  return nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASS"),
    },
  });
}

function buildAutoReplyHtml(name: string) {
  const escapedName = escapeHtml(name);
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  
  <!-- Import fonts matching the portfolio -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  
  <!-- Fallback font implementation for older clients -->
  <!--[if mso]>
    <style>table, td, p, div, a, li, span {font-family: Arial, sans-serif !important;} h1, h2 {font-family: 'Times New Roman', serif !important;}</style>
  <![endif]-->
  
  <style>
    /* Email client safe resets */
    body, table, td, p, a, li { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    h1, h2, .font-serif { font-family: 'Playfair Display', Georgia, serif; }
    
    /* Native Dark Mode overrides */
    @media (prefers-color-scheme: dark) {
      .bg-main { background-color: #030509 !important; }
      .bg-card { background-color: #0B0F19 !important; border-color: rgba(137,170,204,0.15) !important; }
      .bg-footer { background-color: #05070D !important; border-top-color: rgba(137,170,204,0.1) !important; }
      
      .text-primary { color: #f7fbfc !important; }
      .text-secondary { color: #89AACC !important; }
      .text-muted { color: #64748B !important; }
      .border-subtle { border-color: rgba(137,170,204,0.2) !important; }
      
      /* Subtle glow on logo in dark mode */
      .glow-image { box-shadow: 0 0 20px rgba(14, 165, 233, 0.15) !important; }
    }

    a { transition: all 0.3s ease; }
    a:hover { opacity: 0.8; }
    
    /* Premium Gradient Button */
    .btn-gradient {
      background: linear-gradient(135deg, #0EA5E9 0%, #4F46E5 100%);
      background-color: #0EA5E9; /* Fallback */
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 100px;
      padding: 14px 32px;
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 0.02em;
      display: inline-block;
      box-shadow: 0 4px 14px rgba(14, 165, 233, 0.25);
    }
    .btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4); }

    /* Progressive Enhancement Animations */
    .animated { opacity: 1; transform: none; }
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(15px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
      .animated { animation: fadeInUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; }
      .delay-1 { animation-delay: 0.1s; }
      .delay-2 { animation-delay: 0.2s; }
      .delay-3 { animation-delay: 0.3s; }
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;background-color:#F8FAFC;" class="bg-main">
  <!-- Preheader text shown in inbox preview -->
  <div style="display:none;font-size:0px;line-height:0px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;font-family:sans-serif;">
    Hey ${escapedName}, thanks for reaching out! Your message just landed in my inbox...
  </div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background-color:#F8FAFC;" class="bg-main">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <!--[if mso]>
        <table align="center" width="600" style="width:600px;"><tr><td>
        <![endif]-->
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;background-color:#ffffff;box-shadow:0 4px 24px rgba(0,0,0,0.04);" class="bg-card">
          
          <!-- Premium Gradient Top Border -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #0EA5E9 0%, #4F46E5 100%); background-color: #0EA5E9; line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header Area -->
          <tr>
            <td style="padding:48px 40px 24px;text-align:center;">
               <a href="${BRAND_BASE_URL}" aria-label="Visit shreyas.cloud" style="text-decoration:none;">
                 <img src="${BRAND_BASE_URL}/logo.png" alt="shreyas.cloud" width="64" height="64" style="display:block;margin:0 auto;border-radius:50%;border:1px solid #E2E8F0;background:#ffffff;" class="border-subtle animated glow-image" />
               </a>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding:10px 48px 48px;">
              <h1 style="margin:0 0 24px;font-size:32px;line-height:1.2;font-weight:400;color:#0F172A;text-align:center;font-style:italic;" class="text-primary font-serif animated delay-1">
                Hey ${escapedName},
              </h1>
              
              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#475569;" class="text-muted animated delay-2">
                Thanks for reaching out! Just a quick automated note to let you know your message safely landed in my inbox.
              </p>
              
              <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#475569;" class="text-muted animated delay-2">
                Whether you're a recruiter with an exciting opportunity, another builder looking to collaborate, or just dropping by to say hi—I appreciate you taking the time to connect. I read every message personally and will get back to you as soon as I can.
              </p>
              
              <div style="text-align:center;margin:36px 0;" class="animated delay-3">
                <a href="${BRAND_BASE_URL}" class="btn-gradient">
                  Explore my latest work
                </a>
              </div>
              
              <p style="margin:0;font-size:16px;line-height:1.7;color:#475569;" class="text-muted animated delay-3">
                Talk soon,<br/>
                <strong style="font-weight:600;color:#0F172A;font-size:17px;" class="text-primary font-serif">Shreyas</strong>
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 48px;">
              <hr style="border:none; border-top:1px solid #E2E8F0; margin:0;" class="border-subtle" />
            </td>
          </tr>

          <!-- Enterprise Legal Footer -->
          <tr>
            <td style="padding:32px 48px;background-color:#F8FAFC;text-align:center;" class="bg-footer">
              
              <p style="margin:0 0 16px;font-size:12px;line-height:1.6;color:#64748B;" class="text-muted">
                You are receiving this automated email because you recently submitted a contact form inquiry on <strong>shreyas.cloud</strong>.
              </p>
              
              <p style="margin:0 0 16px;font-size:12px;line-height:1.6;color:#64748B;" class="text-muted">
                <a href="${BRAND_BASE_URL}" style="color:#64748B;text-decoration:underline;" class="text-muted">Portfolio</a> &nbsp;&nbsp;|&nbsp;&nbsp; 
                <a href="https://github.com/SmartKidzee" style="color:#64748B;text-decoration:underline;" class="text-muted">GitHub</a> &nbsp;&nbsp;|&nbsp;&nbsp; 
                <a href="https://linkedin.com/in/smartshreyas" style="color:#64748B;text-decoration:underline;" class="text-muted">LinkedIn</a>
              </p>
              
              <p style="margin:0;font-size:12px;line-height:1.6;color:#94A3B8;" class="text-muted">
                &copy; ${currentYear} Shreyas. All rights reserved.<br>
                Bengaluru, India
              </p>
              
            </td>
          </tr>
          
        </table>
        
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildAutoReplyText(name: string) {
  const currentYear = new Date().getFullYear();
  return[
    `Hey ${name},`,
    "",
    "Thanks for reaching out! Just a quick automated note to let you know your message safely landed in my inbox.",
    "",
    "Whether you're a recruiter with an exciting opportunity, another builder looking to collaborate, or just dropping by to say hi—I appreciate you taking the time to connect. I read every message personally and will get back to you as soon as I can.",
    "",
    `Explore my latest work at: ${BRAND_BASE_URL}`,
    "",
    "Talk soon,",
    "Shreyas",
    "",
    "--------------------------------------------------",
    `You are receiving this automated email because you submitted a contact form on shreyas.cloud.`,
    `© ${currentYear} Shreyas. All rights reserved. | Bengaluru, India`
  ].join("\n");
}

export async function sendAutoReply(record: ContactRecord) {
  const transporter = getSmtpTransport();
  const fromEmail = getRequiredEnv("CONTACT_FROM_EMAIL");
  const replyTo = getEnv("CONTACT_REPLY_TO_EMAIL") || fromEmail;

  await transporter.sendMail({
    from: `"Shreyas | shreyas.cloud" <${fromEmail}>`,
    to: record.email,
    replyTo,
    subject: "✨ Your message reached Shreyas",
    html: buildAutoReplyHtml(record.name),
    text: buildAutoReplyText(record.name),
  });
}