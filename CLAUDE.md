# Working on mehedimaruf.com

Guidance for any agent editing this repository. This file is public: keep
personal and machine detail (usernames, local paths, private addresses, session
notes) out of it. That material belongs in `.blessedevil/`, which is ignored.

## What the site is for

A stranger should be able to say what this person does after reading the first
screen. An earlier version listed five fields with equal weight and a visitor
could not tell. Every content change is judged against that.

## Positioning — settled, do not dilute

- **Lead:** software developer and linguist. "Linguist by training, developer by
  passion. I work with language data and build open-source desktop and web tools
  as BlesseDevil."
- **Primary:** software (the BlesseDevil tools) and language data.
- **Background, one line only:** banking and esports operations. They stay in
  full on the CV and résumé. They do not go back into the hero, the eyebrow, the
  page title or the meta description.
- The home page "Featured" strip shows software first.

Do not change the lead without being asked. If new work seems to justify a new
lead, propose it and wait.

## Names — use exactly these forms

| Use | Form |
| --- | --- |
| Short name, the one people search for | `Mehedi Maruf` |
| Full name, for the CV and the H1 | `Mehedi Hasan Maruf` |
| Software brand and GitHub account | `BlesseDevil` |

`BlesseDevil` has one "d" before "Devil" and a capital B and D. `BlessedDevil`,
`Blessed Devil` and `blessedevil` in prose are wrong (lower case is fine in URLs
and package names). All three names live in `src/config.ts`; reference them from
there, never retype them.

## Search rules

These exist because the short name and the brand name both ranked badly.

- The home page title carries all three names. Keep it that way.
- `Mehedi Maruf` and `BlesseDevil` each appear in visible body text on the home
  page, not only in metadata.
- `BaseLayout.astro` emits `og:image`, the Twitter card tags and, on the home
  page, a `Person` JSON-LD block with `alternateName` and `sameAs`. Do not remove
  them. When a profile link is added to `profile.yaml`, it joins `sameAs` by
  itself.
- Every page needs its own `description`. Never let a page fall back to the site
  description if it has a subject of its own.
- The projects index is the landing page for the word "BlesseDevil". Keep the
  word in its title and eyebrow.

## Projects

- Every public BlesseDevil tool gets a page in `src/content/projects/`. When a
  new tool ships, add its page in the same piece of work.
- A software page states: what it does, who it is for, why it was built, and
  where to get it (`repo`, `demoUrl` or `releaseUrl`). Aim for 150 words or more.
  A two-line page is a stub; keep it `draft: true` until it is real.
- Describe only what the tool's own README or the author confirms. Do not invent
  features, numbers or platforms.
- Tools hosted on a subdomain link back to `https://mehedimaruf.com`, and their
  repos set the GitHub homepage field. Those changes are made in the tool's own
  repository, not here.
- Screenshots go in the project's folder and are set as `cover`.

## Content rules

- Content is edited in `src/content/` and `src/content/cv/*.yaml`.
  `CONTENT-GUIDE.md` documents every field; update it when a schema changes.
- `profile.yaml` feeds the home page and both CV pages. Check `/`, `/cv` and
  `/resume` after editing it.
- Nothing private is published: no phone number, date of birth, street address,
  referees or personal mailbox. Only the addresses in `src/config.ts` appear.
- Claims on the CV are the author's. Reword for clarity; do not upgrade a skill
  level, a title or a number.
- AI-assisted development is stated in the skills list on the CV, and only
  there. Do not add it to the hero, the About paragraph or the meta description.
- A project's `stack` lists what the project is made of; it is not a claim about
  personal coding skill. Skill levels in `skills.yaml` are the author's own
  wording and are changed only when he gives the new level.
- Plain language. Say what a thing does before saying how.

## Before calling a change done

```bash
npm run build
```

```bash
node scripts/privacy-scan.mjs
```

Then read the built `dist/index.html` head and confirm the title, description,
`og:image` and JSON-LD are present. Commits are signed; never push an unsigned
commit, and do not push or deploy without being asked.
