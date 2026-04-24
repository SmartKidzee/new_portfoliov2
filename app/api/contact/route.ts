import { NextResponse } from "next/server";

import {
  assertWithinRateLimit,
  getClientIp,
  insertContactRecord,
  isHoneypotTriggered,
  parseContactSubmission,
  sendAutoReply,
  sendOwnerNotification,
  validateContactSubmission,
  verifyEmailDeliverability,
} from "@/lib/contact";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ key: process.env.WEB3FORMS_ACCESS_KEY || "" });
}

export async function POST(request: Request) {
  try {
    const ipAddress = getClientIp(request);
    assertWithinRateLimit(ipAddress);

    const payload = (await request.json()) as Record<string, unknown>;
    const submission = parseContactSubmission(payload);

    if (isHoneypotTriggered(submission)) {
      return NextResponse.json({ success: true, message: "Message sent successfully." });
    }

    validateContactSubmission(submission);
    await verifyEmailDeliverability(submission.email);

    await insertContactRecord(submission);
    await sendOwnerNotification(submission);
    await sendAutoReply(submission);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send your message right now.";
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes("too many contact attempts")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    if (
      normalizedMessage.includes("please enter")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (
      normalizedMessage.includes("missing ") ||
      normalizedMessage.includes("hunter") ||
      normalizedMessage.includes("web3forms") ||
      normalizedMessage.includes("smtp") ||
      normalizedMessage.includes("supabase")
    ) {
      return NextResponse.json(
        {
          error: "Contact service is temporarily unavailable. Please try again shortly.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Unable to send your message right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
