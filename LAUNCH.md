# Launch runbook

One pass, in order: sign and push a single commit, turn on Pages, point
Cloudflare at it, then switch the proxy on. `DEPLOY.md` is the reference for
how the pipeline works; this is the sequence for the first publish.

Nothing here needs a secret in a file. Where a passphrase is wanted, git asks
for it in your own terminal.

---

## 1. Publish one signed commit instead of eighteen unsigned ones

The local history is 18 unsigned commits. Rather than push all of them, the
current tree goes up as a **single signed commit**, and the old history stays
on this machine on a branch of its own.

Keep the existing history first — this is what makes the rest reversible:

```bash
git branch history-local
```

Build the launch commit from the current files:

```bash
git checkout --orphan launch && git add -A
```

Sign it. Git will prompt for your key passphrase in the terminal:

```bash
git -c commit.gpgsign=true commit -S -m "Launch mehedimaruf.com"
```

Check the signature took before going further — you want `gpg: Good signature`:

```bash
git log --show-signature -1
```

Make it the branch that deploys:

```bash
git branch -M launch main
```

`history-local` still holds the old commits if you ever want them. Nothing was
deleted.

> **Keep `history-local` local.** Earlier commits contain versions of the
> portrait JPEGs that carried an EXIF preview thumbnail — a wider, less-cropped
> copy of the photo, extractable by anyone who clones the repo. The current
> files are clean, but the old blobs are still in that branch. Never push it.

> Later commits: set `git config --local commit.gpgsign true` once, and every
> commit from then on is signed without the `-c` flag.

---

## 2. The repository

Create it **empty** — no README, no .gitignore, no licence. Anything GitHub
adds on creation becomes a commit you did not sign, and it will collide with
the push.

| Setting | Value |
| --- | --- |
| Owner | `BlesseDevil` |
| Name | `mehedimaruf.com` |
| Visibility | **Public** — Pages on a free plan only serves public repos |
| Initialise with | nothing |
| Default branch | `main` |

Then push:

```bash
git remote add origin https://github.com/BlesseDevil/mehedimaruf.com.git
git push -u origin main
```

### Settings worth setting once

- **Settings → Pages → Source: GitHub Actions.** Not "Deploy from a branch" —
  the build is three steps (Astro, Pagefind, pruning Pagefind's UI bundles) and
  a branch deploy would publish the source instead of the site.
- **Settings → Pages → Custom domain: `mehedimaruf.com`.** Do this *after* the
  DNS records in step 3 exist, or GitHub rejects it. `public/CNAME` already
  carries the domain into every build, but the field in this UI is what triggers
  the certificate.
- **Enforce HTTPS** — the checkbox stays greyed out until the certificate is
  issued. Come back for it.
- **Settings → Actions → General → Workflow permissions: read-only.** The
  deploy workflow requests `pages: write` and `id-token: write` for itself, so
  it does not need the repository default to be permissive.
- Branch protection is not worth it on a repo with one author, but if you want
  it, allow the `github-pages` environment to deploy from `main` or the
  deployment will queue forever waiting for approval.

The workflow is already in `.github/workflows/deploy.yml`. It runs on every
push to `main`, and **the privacy scan is a build step** — if it ever finds
something it should not, the deployment fails rather than publishing.

---

## 3. Cloudflare DNS

Four A records and four AAAA records for the apex, one CNAME for `www`. GitHub
serves Pages from these addresses:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `blessedevil.github.io` |

TTL: Auto.

### The proxy caveat — this is the one that wastes an afternoon

**Set every one of those records to "DNS only" (grey cloud) to begin with.**

GitHub gets its TLS certificate from Let's Encrypt over an HTTP-01 challenge:
Let's Encrypt asks for a file at `http://mehedimaruf.com/.well-known/...` and
GitHub has to be the server that answers. With Cloudflare's proxy on (orange
cloud), Cloudflare answers instead, GitHub never sees the challenge, and the
certificate is never issued. The symptom is a Pages settings page stuck on
*"Certificate not yet created"* and browsers refusing HTTPS — and it does not
resolve itself, because nothing is retrying against a server that can win.

So:

1. Grey cloud on every record.
2. Add the custom domain in Pages settings; wait for the DNS check to go green.
3. Wait for the certificate — usually minutes, up to about an hour.
4. Tick **Enforce HTTPS**.
5. *Only now*, if you want Cloudflare in front, switch the records to orange.

And when you do switch the proxy on, **set SSL/TLS → Overview → encryption mode
to Full (strict)**. Flexible means Cloudflare talks to GitHub over plain HTTP,
GitHub redirects to HTTPS, Cloudflare follows it back round, and the site dies
in a redirect loop. Full (strict) is correct and works, because GitHub's
certificate is real.

Two more Cloudflare settings that bite static sites:

- **Always Use HTTPS**: fine, leave on.
- **Auto Minify / Rocket Loader**: leave **off**. Rocket Loader defers scripts
  in a way that breaks the portal and the theme toggle.

---

## 4. Verify

```bash
curl -sI https://mehedimaruf.com | head -3
```

Then, by eye:

- The Actions run for the push is green, including its "Privacy scan" step.
- `https://mehedimaruf.com` loads with the hero photo, and the theme toggle
  sticks across a reload.
- `https://www.mehedimaruf.com` redirects to the apex.
- Ctrl+K opens search and actually returns results — that is Pagefind, which
  is built in CI rather than committed, so it is the best single check that
  the build ran properly.
- `https://mehedimaruf.com/sitemap-index.xml` resolves.

---

## 5. If it needs rolling back

The deploy is just the last push. To go back:

```bash
git revert HEAD && git push
```

To abandon the squashed history and return to where you were:

```bash
git checkout history-local && git branch -M main
```

---

## Still to do after launch

These are known gaps, not surprises:

- The contact form falls back to the email address until the Worker is
  deployed (`CONTACT.endpoint` is empty). See `contact-worker/README.md`.
- The op-ed under Writing is `draft: true` pending its real publication date,
  so the Writing card is absent from the portal until then.
- No CV PDFs in `public/cv/` yet — the page offers Print / Save as PDF instead.
  Anything dropped there must be a redacted variant.
- giscus comments render nothing until the repo IDs are filled in.
