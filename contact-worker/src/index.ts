/**
 * Contact form handler for mehedimaruf.com.
 *
 * Receives the form, checks it is not a bot, and hands the message to SMTP2GO,
 * which already sends mail for this domain. The site itself stays a static
 * GitHub Pages build — this is the only moving part.
 *
 * Secrets (set with `wrangler secret put`, never written to a file):
 *   SMTP2GO_API_KEY    the sending key
 *   TURNSTILE_SECRET   optional; when absent, Turnstile is skipped
 *
 * Plain variables live in wrangler.toml: TO_ADDRESS, FROM_ADDRESS, ALLOWED_ORIGINS.
 */

export interface Env {
  SMTP2GO_API_KEY: string;
  TURNSTILE_SECRET?: string;
  TO_ADDRESS: string;
  FROM_ADDRESS: string;
  /** Comma-separated list. Anything else is refused. */
  ALLOWED_ORIGINS: string;
}

const MAX = { name: 120, email: 200, message: 4000 } as const;

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((value) => value.trim());
  const ok = origin !== null && allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0]!,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });

/** No-JavaScript submissions land on a real page rather than raw JSON. */
const page = (title: string, message: string, status: number, headers: Record<string, string>) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#1a0b10;
color:#f2e6d8;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:2rem}
a{color:#d8b478}h1{font-weight:600}</style></head><body><div>
<h1>${title}</h1><p>${message}</p><p><a href="https://mehedimaruf.com">Back to the site</a></p>
</div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", ...headers } },
  );

async function verifyTurnstile(token: string, secret: string, ip: string | null) {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const result = (await response.json()) as { success: boolean };
  return result.success === true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env);
    const wantsJson = (request.headers.get("Accept") ?? "").includes("application/json");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405, cors);
    }

    // A cross-origin POST from somewhere else is refused outright. A form
    // submission with no Origin header (the no-JavaScript path) is allowed.
    const allowed = env.ALLOWED_ORIGINS.split(",").map((value) => value.trim());
    if (origin !== null && !allowed.includes(origin)) {
      return json({ error: "Not allowed from this origin." }, 403, cors);
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return json({ error: "Could not read the form." }, 400, cors);
    }

    const read = (field: string, limit: number) =>
      String(form.get(field) ?? "").trim().slice(0, limit);

    const name = read("name", MAX.name);
    const email = read("email", MAX.email);
    const message = read("message", MAX.message);
    const honeypot = read("company", 50);

    // Caught in the honeypot: answer exactly as if it worked, so the bot has
    // nothing to learn and stops retrying.
    if (honeypot.length > 0) {
      return wantsJson
        ? json({ ok: true }, 200, cors)
        : page("Thank you", "Your message has been sent.", 200, cors);
    }

    if (!name || !email || !message) {
      return json({ error: "Please fill in every field." }, 400, cors);
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "That email address does not look right." }, 400, cors);
    }

    if (env.TURNSTILE_SECRET) {
      const token = String(form.get("cf-turnstile-response") ?? "");
      const ip = request.headers.get("CF-Connecting-IP");
      if (!token || !(await verifyTurnstile(token, env.TURNSTILE_SECRET, ip))) {
        return json({ error: "The anti-spam check did not pass. Please try again." }, 400, cors);
      }
    }

    const sent = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: env.SMTP2GO_API_KEY,
        // The sender must be an address SMTP2GO has verified for this domain;
        // the visitor's address goes in reply-to so a reply just works.
        sender: env.FROM_ADDRESS,
        to: [env.TO_ADDRESS],
        subject: `Website message from ${name}`,
        text_body: `From: ${name} <${email}>\n\n${message}\n`,
        custom_headers: [{ header: "Reply-To", value: `${name} <${email}>` }],
      }),
    });

    if (!sent.ok) {
      // Never surface the provider's response: it can contain key details.
      console.error("smtp2go failed", sent.status);
      return wantsJson
        ? json({ error: "Could not send just now. Please email instead." }, 502, cors)
        : page("Something went wrong", "Please email contact@mehedimaruf.com instead.", 502, cors);
    }

    return wantsJson
      ? json({ ok: true }, 200, cors)
      : page("Thank you", "Your message has been sent.", 200, cors);
  },
};
