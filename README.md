# mehedimaruf.com

The personal site of Mehedi Hasan Maruf: home page, résumé and CV, projects, and
writing. A static [Astro](https://astro.build) build, published to GitHub Pages.

## Run it

```bash
npm install
```

```bash
npm run dev
```

That serves the site at `http://localhost:4321`, and shows drafts so you can
review them before they go live.

```bash
npm run build
```

Builds into `dist/`: Astro first, then the Pagefind search index, then a step
that removes Pagefind's unused UI bundles.

```bash
npx astro check
```

Type-checks everything, including the frontmatter of every content file against
its schema.

## Where things live

| Path | What it is |
| --- | --- |
| `src/content/` | All the content. One Markdown file per thing — see `CONTENT-GUIDE.md` |
| `src/content/cv/profile.yaml` | Name, headline, motto, the four numbers on the home page |
| `src/components/` | The site's parts: the portal, the rails, the cursor ring, the CV page |
| `src/styles/tokens.css` | Both themes, every colour, defined once with `light-dark()` |
| `src/assets/portraits/` | Drop hero photos in; they join the crossfade automatically |
| `scripts/` | Privacy scan, Pagefind prune, share-image generator |
| `contact-worker/` | The Cloudflare Worker behind the contact form |
| `.local-tool/` | Local-only tools (the font lab); never shipped, not in git |

## The guides

- **`CONTENT-GUIDE.md`** — how to update the site without a developer.
- **`DEPLOY.md`** — first deployment, DNS, the subdomain alias, analytics, comments.
- **`docs/MEDIA.md`** — photography and video hosting on Cloudflare R2.
- **`contact-worker/README.md`** — deploying the contact form.
- **`src/assets/brand/README.md`** — which emblem file to use where.

## Before publishing anything

```bash
node scripts/privacy-scan.mjs dist
```

The site must never carry the phone number, date of birth, home address,
referees' contact details, memo numbers or the personal Gmail. The scan checks
the built output for the *shapes* of those things and fails if it finds any. It
also runs in CI, where it blocks the deployment rather than warning about it.

`.blessedevil/` holds the private source material — the CV master, brand files —
and is excluded from git. Keep it that way.

## Two themes

**Blessed** (light: champagne paper, maroon ink) and **Devil** (dark:
wine-black, gold links, crimson glow), named after the BlesseDevil emblem they
are drawn from. The site follows the operating system until a visitor clicks the
halo/horns toggle.
