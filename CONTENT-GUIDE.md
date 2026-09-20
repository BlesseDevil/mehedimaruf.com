# Content guide

How to update this site without touching any code. Written for you, months from
now, with no one else around to ask.

## 1. How this works in one minute

Everything that appears on the site — CV entries, projects, blog posts — is a
Markdown file under `src/content/`. One file is one thing: one job, one
project, one post. Add a file, commit it, and the site rebuilds itself. There
is no database and no admin panel to log into.

For a small change — fixing a typo, tweaking a sentence, flipping `draft` to
`false` — you do not need a computer set up for development. Open the file on
GitHub's website and click the pencil icon (Edit this file). Type your change,
scroll down, and commit it. That is enough for anything that does not need a
brand-new file.

For a new entry (a new job, a new project, a new post), it is easiest to copy
an existing file in the same folder, or the `_template.md` file described
below, rename it, and edit the copy. You can do this on GitHub too: open a
template file, use "Copy raw file", then use "Add file → Create new file" in
the target folder and paste it in.

Every folder under `src/content/` has a `_template.md` file with every field
explained inline. The leading underscore is what keeps it off the site (see
section 4) — it is there purely for you to copy from.

## 2. The everyday jobs

### Add a job to the CV

1. Go to `src/content/cv/experience/`.
2. Copy `_template.md`, rename the copy to something like
   `2026-new-role.md`. The filename itself does not matter to the site; the
   dates in the frontmatter do.
3. Fill in `role`, `org`, `start`, `end`. Set `resume: true` if this job
   should also show on the short résumé.
4. Write a bullet list of what you did in the body, same style as the other
   files in that folder.
5. Commit. It appears on `/cv` automatically, and on `/resume` too if you set
   `resume: true`.

### Add a project

1. Go to `src/content/projects/`.
2. Each project is its own folder (e.g. `src/content/projects/my-new-tool/`)
   containing an `index.md`. Copy an existing project folder, or create a new
   folder and copy `_template.md` into it as `index.md`.
3. Set `title`, `summary`, `band` (`software` or `irl`), `type`, and `date`.
4. If it has a public repository, add `repo`. If the code is private, set
   `sourcePrivate: true` instead and leave `repo` out.
5. Commit.

### Write a blog post

1. Go to `src/content/blog/`.
2. Create a new folder for it (e.g. `src/content/blog/my-post/`) with an
   `index.md` inside, copied from `_template.md`.
3. Set `title`, `description`, `date`, and `tags`.
4. Write the post in the body, in Markdown.
5. Commit.

### Add a post published somewhere else

Use the same blog folder, but instead of writing a body, fill in the
`external` block:

```yaml
external:
  url: https://www.observerbd.com/news.php?id=334286
  publication: The Daily Observer
```

Leave the body empty. The post then appears in the blog list with the
publication's name, and clicking it takes the reader straight to the
publication's own page — there is no local page for it.

### Add photos to the home page

Drop image files into `src/assets/portraits/`. Any file with extension
`.jpg`, `.jpeg`, `.png`, `.webp` or `.avif` in that folder joins the
rotation automatically — no code change and no list to edit. Photos are
shown in filename order, so name them so they sort the way you want (e.g.
`01-portrait.jpg`, `02-portrait.jpg`). With two or more photos there, the
home page crossfades between them; with none, it shows the emblem instead.

### Change the headline, motto or the four numbers on the home page

All of this lives in one file: `src/content/cv/profile.yaml`. It is not
Markdown — no frontmatter fences, just edit the values directly:

- `role` — the one-sentence line under your name.
- `motto` — an optional quote; delete the line (or leave it `""`) to hide it.
- `about` — the About paragraph.
- `proofPoints` — the four number-and-label pairs, e.g.:

```yaml
proofPoints:
  - value: "289k+"
    label: Bangla data items validated
  - value: "BDT 50M+"
    label: Event projects coordinated
  - value: "30k+"
    label: Community members managed
  - value: "60+"
    label: Team members led
```

Add, remove or reword these freely — they are yours to frame however you
want. `src/content/cv/skills.yaml` works the same way for the skills groups
shown on the CV and résumé.

### Hide something without deleting it (draft)

Set `draft: true` in the frontmatter of a project or blog post. It keeps
existing in the repository and still shows up while you preview the site
locally, but a published build skips it entirely. Flip it back to `false`
(or delete the line) when it is ready.

CV entries (experience, education, and so on) do not have a `draft` field —
see section 4 for how to keep one of those off the résumé instead.

## 3. Field reference per collection

"Required" means the build fails without it. Examples below are copied from
files already in the repository.

### CV collections — shared fields

Every entry in `experience`, `education`, `research`, `training`, `awards`,
`volunteer` and `community` has these two, in addition to its own fields
below:

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `resume` | Optional (default `false`) | `true` also shows this entry on `/resume`. `/cv` always shows every entry regardless. | `resume: true` |
| `order` | Optional | Forces sort position (lower first), overriding date order. Leave out to sort by date. | `order: 1` |

### experience

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `role` | Required | Job title. | `role: Transaction Service Officer` |
| `org` | Required | Employer. | `org: IFIC Bank PLC` |
| `orgUrl` | Optional | Link to the organisation's site. | `orgUrl: https://example.com` |
| `location` | Optional | Where you worked. | `location: Pabna Branch (induction at Head Office, Dhaka)` |
| `start` | Required | Start of the role, quoted. | `start: "2025-01"` |
| `end` | Required | End of the role, quoted, or `present`. | `end: "2025-09"` |
| `tags` | Optional (default empty) | Skill chips shown under the entry. | `tags: ["KYC / e-KYC", "AML-CFT", "BACH"]` |

### education

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `degree` | Required | Qualification name. | `degree: MA in Linguistics` |
| `institution` | Required | Awarding institution. | `institution: University of Dhaka` |
| `detail` | Optional | Grade or result — omit to not publish it. | `detail: CGPA 3.30 / 4.00` |
| `end` | Required | Year finished, quoted; also sorts the list. | `end: "2022"` |

### research

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `title` | Required | Title of the paper, dataset or study. | `title: Riverbank erosion study` |
| `role` | Optional | Your role on it. | `role: Co-author` |
| `venue` | Optional | Where it was published or submitted. | `venue: Some journal` |
| `year` | Required | Year, quoted; sorts the list. | `year: "2025"` |
| `url` | Optional | Link to the paper or project page. | `url: https://example.com` |

### training

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `title` | Required | Course or programme name. | `title: AML-CFT training` |
| `org` | Required | Who ran it. | `org: IFIC Bank PLC` |
| `date` | Required | When it took place, quoted. | `date: "2025-01"` |
| `detail` | Optional | Result or note. | `detail: Placed 2nd in the batch` |

### awards

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `title` | Required | Name of the award. | `title: Undergraduate scholarship` |
| `year` | Required | Year received, quoted; sorts the list. | `year: "2023"` |
| `detail` | Optional | Who gave it or what you achieved. | `detail: Awarded for academic merit` |
| `kind` | Optional (default `distinction`) | Groups the list into bands: `scholarship`, `competition` or `distinction`. | `kind: scholarship` |

### volunteer

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `role` | Required | Volunteer role. | `role: Coordinator` |
| `org` | Required | Organisation. | `org: Iccheghuri Foundation` |
| `start` | Required | Start, quoted. | `start: "2020"` |
| `end` | Required | End, quoted, or `present`. | `end: present` |

### community

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `title` | Required | A short description of the role or activity. | `title: AVBD HOK community` |
| `start` | Optional | Start, quoted — leave out if there's no clear date. | `start: "2020"` |
| `end` | Optional | End, quoted, or `present`. | `end: present` |

### projects

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `title` | Required | Project name. | `title: Billing and invoicing app` |
| `summary` | Required | One-sentence summary shown in listings. | `summary: A React/TypeScript billing application...` |
| `band` | Required | `software` (has code) or `irl` (real-world delivery work). | `band: software` |
| `type` | Required | One of `windows-app`, `web-tool`, `userscript`, `android`, `library`, `event`, `research`, `operations`. | `type: web-tool` |
| `date` | Required | Sort key and "Recently" strip. `YYYY-MM-DD`; use `-01-01` if only the year is known. | `date: 2025-01-01` |
| `updated` | Optional | Last-updated date, same format; used for sorting instead of `date` when present. | `updated: 2025-06-01` |
| `period` | Optional | A human-readable stretch of time, mainly for `irl` entries. | `period: "2022–2023"` |
| `repo` | Optional | Link to public source code. | `repo: https://github.com/example/example` |
| `releaseUrl` | Optional | Link to a release page. | `releaseUrl: https://example.com` |
| `installUrl` | Optional | Link to where it can be installed. | `installUrl: https://example.com` |
| `demoUrl` | Optional | Link to a live demo. | `demoUrl: https://example.com` |
| `sourcePrivate` | Optional (default `false`) | Shows a "source private" badge instead of a repo link. | `sourcePrivate: true` |
| `stack` | Optional (default empty) | Technologies used. | `stack: ["React", "TypeScript"]` |
| `cover` | Optional | Cover image, placed beside the file in the same folder. | `cover: ./cover.jpg` |
| `featured` | Optional (default `false`) | Shows the project more prominently. | `featured: true` |
| `draft` | Optional (default `false`) | Hides the entry from a published build. | `draft: true` |

### blog

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `title` | Required | Post title. | `title: China bans Cryptocurrency for 3rd time...` |
| `description` | Required | One-sentence summary shown in listings. | `description: An opinion editorial on cryptocurrency regulation...` |
| `date` | Required | Sort key. `YYYY-MM-DD`; use `-01-01` if only the year is known. | `date: 2022-01-01` |
| `updated` | Optional | Last-updated date, same format. | `updated: 2022-02-01` |
| `tags` | Optional (default empty) | Topic labels. | `tags: ["Policy", "Cryptocurrency"]` |
| `lang` | Optional (default `en`) | `en` or `bn` — `bn` switches the page to the Bangla font. | `lang: bn` |
| `cover` | Optional | Cover image, placed beside the file in the same folder. | `cover: ./cover.jpg` |
| `featured` | Optional (default `false`) | Shows the post more prominently. | `featured: true` |
| `draft` | Optional (default `false`) | Hides the entry from a published build. | `draft: true` |
| `external` | Optional | Marks a post published elsewhere: `url` and `publication`. Omit entirely for an ordinary post written for this site. | see block below |

```yaml
external:
  url: https://www.observerbd.com/news.php?id=334286
  publication: The Daily Observer
```

## 4. The rules that bite

- **Dates are written by hand, and are what the site sorts by.** File
  creation or edit timestamps are never used — a fresh copy of the
  repository would otherwise reorder the whole site. If the order looks
  wrong, check the `date` (or `start`/`end`/`year`) field, not when you
  actually saved the file.
- **CV periods are `"YYYY"`, `"YYYY-MM"`, or `present` — and quoted.**
  Quoting matters: an unquoted `2025-01` can be read as something other than
  the text you meant. Project and blog dates are the opposite: unquoted, full
  `YYYY-MM-DD`, e.g. `2025-01-01`.
- **A leading underscore keeps a file out of the site.** That is why
  `_template.md` is invisible everywhere — the loader pattern is
  `[^_]*.md`, meaning "any filename that does not start with underscore".
  Never rename a real entry to start with `_`, and never remove the
  underscore from a template file (copy it instead).
- **Drafts show while running locally and never in the published site.**
  `npm run dev` shows every draft so you can review it; `npm run build`
  (and the live site) silently skips anything with `draft: true`.
- **A section with nothing in it disappears from the page and the
  navigation by itself.** If you have no `research` entries, the CV simply
  has no "Research" heading or nav link — you do not need to hide it
  manually.
- **The résumé shows only `resume: true` entries; the full CV shows
  everything.** The two pages are rendered from the same files — there is
  no separate résumé content to keep in sync. To add an entry to the résumé,
  set `resume: true` on it; to keep it off the résumé but still on the CV,
  leave `resume` unset or `false`.

## 5. What must never go on the site

Do not put any of the following into a content file, an image, or a PDF that
ends up in this repository:

- Phone number
- Date of birth
- Home address
- Referees' names and contact details
- Government memo or reference numbers
- The personal Gmail address

The `.blessedevil/` folder is where that kind of private material (the CV
master, brand source files, personal notes) actually lives, and it is
deliberately excluded from git in `.gitignore`. Keep it that way — never
remove that line, and never copy files out of `.blessedevil/` into anything
that gets committed.

If you drop a CV PDF into `public/cv/` (as `Mehedi-Hasan-Maruf-CV.pdf` or
`Mehedi-Hasan-Maruf-Resume.pdf` — the site links to it automatically once the
file exists), it must be a redacted version with none of the details above in
it. The site does not redact PDFs for you.

Before publishing, run:

```
node scripts/privacy-scan.mjs dist
```

after `npm run build`. It scans the built site for phone-number shapes,
personal Gmail addresses, identity-document wording, referee-contact blocks
and government memo numbers, and exits with an error listing the file and
line if it finds any. A clean run prints `privacy-scan: clean — N files, N
rules.`

## 6. Checking your work

- `npm run dev` — starts a local preview at `http://localhost:4321`. This
  also shows drafts, so it is the way to review something before it goes
  live.
- `npm run build` — builds the site the same way the real deployment does.
  If this fails, nothing gets published, which is exactly what you want if a
  file has a mistake in it.
- **A schema error names the file.** If a required field is missing, or a
  field has the wrong type (a date where text was expected, a plain
  `2025-01` instead of `"2025-01"`, an unquoted period value, an unknown
  `type` or `band` value), the build stops with an error message that
  includes the offending file's path, for example something like
  `experience/2026-new-role.md` alongside a description of which field is
  wrong. Open that file, fix the field the message points to, save, and run
  `npm run build` again.
- Run `node scripts/privacy-scan.mjs dist` (after a build) before treating
  any change as ready to publish — see section 5.
