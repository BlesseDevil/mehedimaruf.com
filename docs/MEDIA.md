# Photography and video

This covers where photography and video for the site live, and how to add
more. It assumes the R2 setup described here already exists or is about to
be created — this is not a proposal, the decision to use R2 is already made.

## 1. Why R2, and not the repository

GitHub Pages, which serves this site, allows roughly 1GB of published content
and about 100GB of traffic a month on the free tier. A git repository also
gets slow to work with once it holds much more than about 1GB of binary
files, regardless of Pages limits. A photography or video collection would
hit both problems quickly.

Cloudflare R2 gives 10GB of storage free, with no charge for egress
(bandwidth out) when the bucket is served through a custom domain. That
makes it the right place for anything beyond a handful of small images.

Small UI images and the handful of hero portraits on the home page stay in
the repository — see `src/assets/portraits/README.md` for how those work. A
photography collection, or anything video-related, does not belong in the
repository at all; it belongs in R2.

## 2. Setting up the bucket

1. In the Cloudflare dashboard, go to **R2** and create a bucket.
2. Open the bucket, go to **Settings → Custom domains**, and connect
   `img.mehedimaruf.com`. This creates the DNS record for you and serves the
   bucket's contents through the Cloudflare cache under that hostname — you
   do not need to add the DNS record separately.
3. Still in the bucket's settings, add a cache rule that sets a long cache
   TTL for objects served from this hostname. Images do not change once
   uploaded under the naming convention below, so a long TTL costs nothing
   and saves repeated fetches from R2.
4. Serve everything through `img.mehedimaruf.com`, not through R2's own
   public bucket URL (the `r2.dev` address). Only the custom domain gets the
   free egress and the Cloudflare cache; the public bucket URL does not.

## 3. The upload routine

Resize and convert images before uploading. Never upload a file straight off
a camera or phone — those files are far larger than the site will ever
display, and uploading them wastes storage and upload time for no benefit.

Use a naming convention of `YYYY/slug-01.avif`, for example:

```
2026/dhaka-riverbank-01.avif
2026/dhaka-riverbank-02.avif
```

The year groups a shoot by when it happened; the slug identifies it; the
number orders images within it.

A worked example, uploading one file with Wrangler:

```bash
npx wrangler r2 object put mehedimaruf-media/2026/dhaka-riverbank-01.avif --file=./dhaka-riverbank-01.avif
```

Replace `mehedimaruf-media` with the actual bucket name, and the file paths
with the real ones. Repeat per file, or script the loop yourself once the
pattern is familiar.

Keep a plain-text list somewhere (a `.txt` or `.md` file kept outside the
repository, since it is not site content) of what has been uploaded and
under which key. R2 has no browsing UI as convenient as a file listing you
keep yourself, and this saves guessing at naming later.

## 4. Using an image on the site

`astro.config.mjs` already allows `img.mehedimaruf.com` as a remote image
domain:

```js
image: {
  domains: ["img.mehedimaruf.com"],
},
```

This means Astro's `<Image>` component can reference a URL on that domain
directly, and Astro will optimise it at build time the same way it does for
local images. A remote image needs explicit `width` and `height` attributes,
since Astro cannot inspect the file's own dimensions the way it can for a
file in the repository.

## 5. Video

R2 is object storage, not a video platform — it does not transcode, stream,
or serve adaptive bitrates. For video, weigh:

- **YouTube or Vimeo, unlisted.** Free, and both handle encoding and
  streaming for you. The trade-off is that playback carries that platform's
  own branding and player.
- **Cloudflare Stream.** Roughly $5 per 1,000 minutes of video stored, billed
  by Cloudflare. This is worth it only if branding-free playback matters
  enough to pay for.

Neither is clearly right for every case — it depends on how much the
platform branding on YouTube or Vimeo would bother you for a given video.

## 6. When 10GB is not enough

R2's paid tier costs roughly $0.015 per GB per month for storage, with
egress still free. If usage grows past the free 10GB, that is the cost to
expect. Backblaze B2 is the usual alternative if R2's pricing or terms stop
suiting you.

Two things are worth checking periodically as the collection grows:

- Total storage used in the bucket, against the free 10GB or whatever paid
  tier you are on.
- Whether anything is being served from outside `img.mehedimaruf.com` — for
  instance, a link handed out to R2's own public bucket URL. Anything served
  outside the custom domain loses the free egress and the cache.

## 7. A rule to keep

Anything uploaded to the bucket is public from the moment it exists at its
URL. There is no concept of an "unlisted" object on a public custom domain —
if someone has or guesses the URL, they can see it, whether or not it is
linked from anywhere on the site. Do not put anything in this bucket that
you would not want found. Nothing private goes in the bucket.
