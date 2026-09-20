# Deploying this site

This is for you, the site's owner, working from a terminal and the Cloudflare
dashboard. It covers getting the site live for the first time, what happens on
every deployment after that, the subdomain aliases, analytics, comments, the
contact form, rolling back a bad change, and what to check after a deploy.

## 1. What is where

The site is a static build made with Astro, published on GitHub Pages, and
served from the custom domain `mehedimaruf.com`. DNS for that domain is
managed at Cloudflare. The domain itself is registered at Spaceship. Mail for
the domain already runs through Cloudflare Email Routing and SMTP2GO — this
document does not change that.

## 1b. Before the first push — do not skip

Two things happen once, before anything leaves this machine.

**Run the independent leak sweep.** Ask Claude to spawn a subagent with no
context from the session that built the site, and have it check the built
output for anything private: the phone number, date of birth, home address,
referees' details, memo numbers, the personal Gmail. The point is the
independence — the agent that wrote the code is the worst judge of whether the
code leaks, because it shares the assumption that produced the leak. The
automated scan runs on every build and in CI, but it matches shapes, not your
actual values.

```bash
node scripts/privacy-scan.mjs dist
```

**Sign the history.** The commits are deliberately unsigned so that building
the site did not mean a key prompt per commit. Sign them in one pass before
pushing:

```bash
git rebase --root --exec "git commit --amend --no-edit -S"
```

## 2. First deployment, in order

Follow these steps in order. The DNS step has a sequencing gotcha, marked
below, that catches people out.

### Create the repository

Create a public GitHub repository named `mehedimaruf.com`. It has to be
public: GitHub Pages on a free plan will not serve a private repository.

Which GitHub account holds this repository is not yet decided. This is safe
to leave open, because visitors never see the repository or the account —
they only ever see the custom domain. If you move the repository to a
different account later, the only extra step is re-setting the Pages custom
domain on the new account; DNS, the domain and the site's content are
unaffected.

### Push the code

```bash
git push -u origin main
```

### Turn on GitHub Pages

In the repository on GitHub: **Settings → Pages → Source**, and set it to
**GitHub Actions**. The workflow in `.github/workflows/deploy.yml` will then
handle every build and publish from here on.

### Point DNS at GitHub Pages

In the Cloudflare dashboard, on the `mehedimaruf.com` zone, add these
records:

- Four `A` records on the apex (`mehedimaruf.com`), one for each of:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- One `CNAME` record: `www` → `<account>.github.io` (using whichever GitHub
  account ends up holding the repository).

**Warning — set these records to DNS-only (grey cloud) at first, not
proxied.** GitHub has to issue a TLS certificate for the domain, and it does
this by validating the domain directly. It cannot do that through
Cloudflare's proxy. If the records are proxied (orange cloud) at this point,
certificate issuance will fail or stall.

Wait for GitHub to show "Your site is published" on the Pages settings page.
Once it does, the **Enforce HTTPS** checkbox becomes available — tick it.
Only after that, go back to Cloudflare and switch those same records to
proxied (orange cloud).

`public/CNAME` already contains `mehedimaruf.com`, so GitHub Pages picks up
the custom domain from the build itself — you do not need to set it manually
in the Pages settings.

## 3. Every deployment after that

Push to `main`:

```bash
git push
```

The Action in `.github/workflows/deploy.yml` builds the site, runs the
privacy scan against the built output, and publishes only if that scan
passes. If the scan finds something it treats as private (a phone number
shape, an unlisted email address, identity-document wording, and so on), the
deployment fails on purpose and nothing is published. Fix the flagged content
and push again.

## 4. The subdomain alias (projects, and others if wanted)

`projects.mehedimaruf.com` is set up to redirect to
`mehedimaruf.com/projects`. To set this up:

1. In Cloudflare DNS, add an `AAAA` record: name `projects`, value `100::`,
   proxied (orange cloud on). This is the usual placeholder record used when
   a hostname is handled entirely by a Cloudflare rule rather than pointing
   at a real server.
2. Go to **Rules → Redirect Rules** and create a rule: when the hostname
   equals `projects.mehedimaruf.com`, redirect (301) to
   `https://mehedimaruf.com/projects`, preserving the path.

The same pattern works for `cv.mehedimaruf.com` or `blog.mehedimaruf.com` if
you want either of those later: add the same kind of `AAAA` record for that
name, then a matching redirect rule.

## 5. Analytics

Site analytics run through Cloudflare Web Analytics, switched on in the
Cloudflare dashboard for the proxied zone (**Analytics & Logs → Web
Analytics**, or **Speed → Web Analytics** depending on the dashboard
version). This adds nothing visible to the page, and there is no analytics
token or script anywhere in this repository. The numbers live entirely in
the Cloudflare dashboard.

## 6. Comments

Comments use giscus, configured through the `GISCUS` block in
`src/config.ts`. Read the comment above that block in the file — it explains
that these are public identifiers, not secrets, and lists the same three
steps:

1. Make the GitHub repository public and enable Discussions in its settings.
2. Install the giscus app: <https://github.com/apps/giscus>.
3. Visit <https://giscus.app>, enter the repository, and copy the `repoId`
   and `categoryId` values it gives you into `GISCUS` in `src/config.ts`.

No comment box renders anywhere on the site until both `repoId` and
`categoryId` are filled in.

## 7. The contact form

The contact form is handled by a separate Cloudflare Worker. See
`contact-worker/README.md` for how to deploy it and point the site at it.

## 8. Rolling back

Every push to `main` republishes the whole site, so rolling back is a matter
of reverting the commit that caused the problem:

```bash
git revert <bad-commit-sha>
```

```bash
git push
```

That triggers a fresh deployment from the reverted state. If a deployment
fails or behaves unexpectedly, check the **Actions** tab on the GitHub
repository for the build and privacy-scan logs.

## 9. Health checks after a deploy

After any deployment, check:

- `https://mehedimaruf.com` loads over HTTPS with no certificate warning.
- `https://www.mehedimaruf.com` loads over HTTPS and reaches the same site.
- `https://projects.mehedimaruf.com` redirects to
  `https://mehedimaruf.com/projects`.
- `https://mehedimaruf.com/rss.xml` loads.
- `https://mehedimaruf.com/sitemap-index.xml` loads.
- A hard refresh of the site (bypassing the browser cache) shows the content
  from the latest push, not an older cached version.
