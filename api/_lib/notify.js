// Emails Josh when a website form comes in. Shared by every /api/submit-* handler.
//
// Vercel ignores files under api/_lib, so this is a plain module, not a function.
// It needs three environment variables on the Vercel project:
//   RESEND_API_KEY   a Resend key allowed to send from itsjoshmoore.com
//   LEAD_NOTIFY_TO   where the alert goes (Josh's inbox)
//   LEAD_NOTIFY_FROM a sender on a verified Resend domain, e.g.
//                    "Josh Moore Website <j.moore@itsjoshmoore.com>"
// With any of them missing it logs and returns false; a form submission never
// fails because the alert could not be sent.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * @param {{ subject: string, text: string, replyTo?: string }} message
 * @returns {Promise<boolean>} true when Resend accepted the email
 */
export async function notifyJosh({ subject, text, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_TO;
  const from = process.env.LEAD_NOTIFY_FROM;
  if (!key || !to || !from) {
    console.warn("notifyJosh: RESEND_API_KEY, LEAD_NOTIFY_TO or LEAD_NOTIFY_FROM is not set; alert skipped");
    return false;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        ...(replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo) ? { reply_to: replyTo } : {}),
        subject,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("notifyJosh: Resend returned", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("notifyJosh failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

/** Strip control characters and cap length. For anything a visitor typed. */
export function clean(value, max = 500) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max);
}

/** True when a visitor filled the hidden honeypot or submitted implausibly fast. */
export function looksLikeBot(body) {
  if (body && typeof body === "object") {
    if (typeof body.company_website === "string" && body.company_website.trim() !== "") return true;
    const started = Number(body.started_at);
    if (Number.isFinite(started) && started > 0 && Date.now() - started < 3000) return true;
  }
  return false;
}
