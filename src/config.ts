/**
 * Site-wide configuration. Content lives in src/content — this file is only
 * metadata, addresses and switches.
 */

export const SITE = {
  url: "https://mehedimaruf.com",
  name: "Mehedi Hasan Maruf",
  /** The header's version, where the full name would crowd the bar. */
  shortName: "Mehedi Maruf",
  /** Falls back to this when a page sets no title of its own. */
  title: "Mehedi Hasan Maruf",
  description:
    "Banking operations, project management, and research and language data. " +
    "I also build small tools for Windows and the web.",
  locale: "en",
  ogImage: "/og-image.png",
} as const;

/**
 * Published addresses. The domain is a catch-all, so each one is a filter
 * rather than a separate mailbox. Never publish the personal Gmail.
 */
export const EMAILS = {
  /** Résumé, CV and the PDFs — recruiter mail lands here. */
  cv: "cv@mehedimaruf.com",
  /** Everywhere else, and the contact form's recipient. */
  contact: "contact@mehedimaruf.com",
  /** Projects area — tool and bug mail. */
  dev: "dev@mehedimaruf.com",
} as const;

/** The builder identity. Used to sign the projects area. */
export const PSEUDONYM = {
  name: "BlesseDevil",
  github: "https://github.com/BlesseDevil",
} as const;

/**
 * The contact form posts to a small Cloudflare Worker, which checks the
 * Turnstile token and sends the message on through SMTP2GO. See
 * contact-worker/README.md for how to deploy it.
 *
 * Both values below are PUBLIC by design — the endpoint is a URL people's
 * browsers call, and a Turnstile *site* key is meant to sit in the HTML. The
 * secret key and the SMTP2GO credentials live only in the Worker's secrets,
 * set with `wrangler secret put`, and never in this repository.
 *
 * Leave `endpoint` empty and the contact section falls back to a plain email
 * link, which works perfectly well — the form is a convenience, not a
 * dependency.
 */
export const CONTACT = {
  endpoint: "", // e.g. "https://contact.mehedimaruf.com"
  turnstileSiteKey: "",
} as const;

/**
 * giscus comments. These are public identifiers, not secrets — they end up in
 * the page's HTML by design.
 *
 * To switch comments on, once the GitHub repo exists:
 *   1. Make the repo public and enable Discussions in its settings.
 *   2. Install the giscus app: https://github.com/apps/giscus
 *   3. Visit https://giscus.app, enter the repo, and copy the two IDs here.
 * Until `repoId` and `categoryId` are filled in, no comment box renders at all.
 */
export const GISCUS = {
  repo: "", // e.g. "BlesseDevil/mehedimaruf.com"
  repoId: "",
  category: "Comments",
  categoryId: "",
} as const;

/** Theme names as the visitor sees them. */
export const THEMES = {
  light: { key: "blessed", label: "Blessed" },
  dark: { key: "devil", label: "Devil" },
} as const;
