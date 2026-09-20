# Contact form Worker

The site is a static build with no server. This small Cloudflare Worker is the
one exception: it receives the contact form, checks it is not a bot, and hands
the message to SMTP2GO, which already sends mail for this domain.

Until it is deployed, the contact section simply shows the email address. That
is a working site — the form is a convenience, not a dependency.

## What you need

- The Cloudflare account that already holds `mehedimaruf.com`.
- An SMTP2GO API key with sending permission.
- Optionally, a Cloudflare Turnstile widget (free) for the anti-spam check.

## Deploy it

Run these in **your own terminal**, from this folder. Each `secret put` asks for
the value and stores it in Cloudflare. **Do not paste secrets into a chat, and
do not put them in any file in this repository.**

```bash
npx wrangler login
```

```bash
npx wrangler secret put SMTP2GO_API_KEY
```

```bash
npx wrangler deploy
```

That is enough to have it working on a `*.workers.dev` address.

## Point the form at it

Put the Worker's URL into `src/config.ts` in the site repo:

```ts
export const CONTACT = {
  endpoint: "https://mehedimaruf-contact.<your-subdomain>.workers.dev",
  turnstileSiteKey: "",
} as const;
```

Commit that, and the form appears on the site. The endpoint is public by design:
it is a URL browsers call.

## A tidier address (optional)

To post to `contact.mehedimaruf.com` instead:

1. In the Cloudflare dashboard, add a DNS record for `contact` — an `AAAA` to
   `100::` with the orange cloud on, which is the usual placeholder for a
   Worker route.
2. Uncomment the `[[routes]]` block in `wrangler.toml`.
3. `npx wrangler deploy` again, and update `endpoint` in `src/config.ts`.

## Turnstile (optional, recommended once spam starts)

1. Cloudflare dashboard → Turnstile → add a widget for `mehedimaruf.com`.
2. Copy the **site key** into `turnstileSiteKey` in `src/config.ts` (public).
3. Store the **secret key** in the Worker:

```bash
npx wrangler secret put TURNSTILE_SECRET
```

With no `TURNSTILE_SECRET` set, the Worker skips the check and relies on the
honeypot alone.

## Test it before trusting it

```bash
npx wrangler dev
```

Then set `endpoint` to `http://localhost:8787` in `src/config.ts`, run the site
with `npm run dev`, and send yourself a message. Remember to put the real
endpoint back before committing.

## How it decides

- **Honeypot** — a field humans never see. If it is filled, the Worker answers
  exactly as it would on success, so the bot learns nothing and stops retrying.
- **Turnstile** — when configured, the token is verified with Cloudflare.
- **Origin** — a cross-origin POST from anywhere other than the site is refused.
  A submission with no `Origin` header is allowed, because that is what a
  no-JavaScript form post looks like.
- **Errors** — the provider's own error text is never sent back to the browser,
  since it can contain key details. The visitor gets a plain message and the
  address to write to instead.

## If you ever rotate the SMTP2GO key

`npx wrangler secret put SMTP2GO_API_KEY` again with the new value and redeploy.
Nothing in this repository needs to change.
