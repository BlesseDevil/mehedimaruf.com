# Blessed Devil emblem — SVG trace notes

## Sources (read-only, untouched)

1. `.blessedevil\Gemini_Generated_Image_aodivpaodivpaodi.png` (2816x1536) — used only the
   black line-art panel in the top-left.
2. `.blessedevil\blessedevil-primary-icon-tight.png` (346x340, RGBA, transparent bg) — the
   full-colour gradient-shaded icon.

## What I ran

All scratch work happened outside the repo, in the session scratchpad
(`…/scratchpad` and `…/scratchpad/trace-tool`), never in this project's `node_modules` or
`package.json`.

1. **Locate the artwork precisely.** Rather than trust the suggested crop box by eye, I
   thresholded source 1 to ink (`gray < 120`) and ran connected-component labelling
   (`scipy.ndimage.label`) restricted to a generous region around the given box. The line-art
   body is one 42,255px component; the halo is two ~1,000–1,500px components (it's drawn as a
   double ellipse, i.e. a torus/ring, not a single stroke). Every other component in the region
   (leader lines to the callout labels, grid fragments, the "TECHNICAL VERSION SYMBOL" caption)
   was under 500px and got excluded automatically. That gave an exact bounding box
   (`x 348–1085, y 360–1009` in the original 2816x1536 canvas), which I padded by 15px and used
   as the crop — no manual guessing of coordinates.
2. **Remove two callout leader-lines that touch the artwork.** Two 1px-thick horizontal leader
   lines (pointing at labels off to the sides) happened to touch the wingtip and the wing rib,
   so they merged into the main connected component and survived step 1. I found their exact
   pixel rows by scanning for long (>40px) horizontal runs with a vertical thickness of ~1px
   (the real linework strokes are 3–4px thick, so this cleanly told them apart) and blanked only
   those specific rows/columns — not a blanket crop — so no real linework was touched. One of
   the two produced a ~1px gap in the outer circle stroke; it is invisible at any of the tested
   render sizes.
3. **Trace the line art with `potrace` (pure-JS, via a throwaway npm project in the
   scratchpad — never installed into this repo).** I initially upscaled the crop 3x with
   Lanczos before tracing, per the suggested method, but that produced enormous, jaggy output
   (~200KB after svgo) because `potrace`'s curve-optimiser (`optTolerance`) doesn't scale with
   image size in this library, so upscaling just forces it to fit far more nodes for the same
   visual tolerance. Tracing the cleaned crop at its native resolution (768x680) instead, with
   `turdSize: 4, optTolerance: 0.4, optCurve: true, color: 'currentColor'`, gave a clean
   ~20KB raw / 12.1KB svgo'd result. I used the native-resolution trace.
4. **Quantise source 2 to 4 flat colours.** The "full-colour" source is gradient/gel-shaded,
   not flat, so a naive nearest-hex classification misfires badly (dark warm-tinted charcoal
   pixels read as saturated red by hue alone). I classified every opaque pixel in HSV with a
   decision tree tuned against sampled pixel values from each region: value+saturation gate for
   charcoal (dark AND desaturated, catches both the flat charcoal fill and its warm-tinted
   anti-aliased edges), then hue-gated crimson (red hue, sat ≥0.30), then gold-hue pixels split
   into cream (very light, low-sat highlights) vs gold (the rest). Each of the four resulting
   masks got a light morphological open→close pass plus removal of components under 12px to
   kill single-pixel gradient-banding speckle before tracing. Each cleaned mask was traced
   separately with `potrace` (`color: <exact hex>`, `blackOnWhite: false` since white=shape in
   my masks — this was the one real bug I hit: the first pass silently traced the *background*
   of every mask because potrace defaults to treating black as foreground), and the four
   resulting single paths were concatenated into one SVG in z-order cream → gold → charcoal →
   crimson.
5. **Optimised both with `npx svgo --precision=2 --multipass`** (svgo was already present in
   `node_modules`; no install needed). `potrace` and its throwaway project were only ever
   installed under the scratchpad and are not referenced anywhere in this repo's
   `package.json`/`package-lock.json` (verified unchanged — md5 before/after this session
   matches).

## Choices worth flagging

- **Palette mapping is a judgement call, not a measurement.** The source only has 4 *intended*
  regions but a continuous gradient inside each; deciding where "gold" ends and "cream" begins
  (or where dark-warm-charcoal ends and crimson begins) was done by hue/sat/value thresholds
  tuned against ~40 sampled pixels, not a formal clustering. It reproduces the source's regions
  faithfully to the eye but the boundary is approximate.
- **The two SVGs are independent traces of two different source drawings**, not one recoloured
  as the other — the full-colour source has a rounder, more filled-in silhouette than the
  line-art source's spikier feather serrations, so don't expect the two to overlay pixel-for-pixel.

## File sizes / complexity

| File | Size (svgo'd) | `<path>` count | Approx. path commands (nodes) | viewBox |
|---|---|---|---|---|
| `emblem-line.svg` | 12,437 B | 1 | 117 | `0 0 768 680` |
| `emblem-colour.svg` | 13,100 B | 4 (one per colour layer) | 181 total | `0 0 346 340` |

Both are well under the 60KB ceiling and close to the 20KB target.

Verified: `emblem-line.svg`'s only fill is `currentColor` (no hardcoded colour anywhere in the
file); `emblem-colour.svg` uses exactly `#d8b478`, `#a81830`, `#2a2a2a`, `#f0e4c0` and nothing
else; neither file contains an `<image>` element — both are real vector traces.

## Verification method

Built a throwaway HTML page (scratchpad) that inlines both SVGs and renders each at 24/48/96px
on `#1A0B10` (color `#D8B478` for the line version) and on `#FBF5EC` (color `#7A0F24`). The
sandboxed browser tool here can only screenshot pages served from inside the project directory,
so I temporarily copied the page into `./tmp-verify/` inside the repo, served it with a local
`python -m http.server`, screenshotted it, then deleted the directory and killed the server —
the repo has nothing left over from this. I also independently rendered each SVG with `sharp`
(already in `node_modules`) at the exact target pixel sizes and upscaled with nearest-neighbour
for pixel-accurate close inspection, which is more trustworthy than a browser screenshot scaled
by the OS.

## Verdict — legibility at small sizes (the honest part)

- **`emblem-colour.svg` reads clearly even at 24px.** The four flat colour regions carry the
  silhouette on their own — even with zero internal linework visible at that size, the
  gold/cream wing vs. crimson/charcoal wing split and the halo are all still legible. This is
  the version I'd ship for anything small: favicons, nav bars, avatars.
- **`emblem-line.svg` does not survive 24px.** It's a single-colour *outline* trace of a
  drawing that has a lot of parallel internal linework — multiple concentric wing-feather
  strokes, the serrated flame/feather teeth, the double-line halo, the bat-wing ribs. All of
  that fine detail is exactly what a stroke-only monochrome mark can't afford at 24px: at that
  size the strokes are sub-pixel apart and anti-aliasing merges them into a scribbly blob with
  no readable silhouette. At 48px it's improved but still busy and not confidently
  identifiable at a glance; it only reads well from 96px up. On the light background
  (`#7A0F24` on `#FBF5EC`) it's worse again, since the lower-contrast thin strokes lose more
  to anti-aliasing than the dark-bg version does.
- **Additional caveat on `emblem-colour.svg`:** the cream fill (`#F0E4C0`) is very low-contrast
  against the light test background (`#FBF5EC`) — it nearly disappears there, leaving the wing
  visible only because the surrounding gold still contrasts against the background. This is a
  property of the two colours chosen, not a tracing defect, but worth knowing if the cream
  regions ever need to read on their own against a pale surface.

**Recommendation:** use `emblem-colour.svg` wherever the mark needs to work small (≤48px —
favicon, browser tab, nav icon, avatar). Reserve `emblem-line.svg` for contexts at 96px and up
(footer mark, print, large hero placement) where its fine linework can actually resolve. I
would not ship `emblem-line.svg` as a small icon as-is; if a small single-colour mark is
required, it needs a hand-simplified glyph (drop the parallel feather lines down to one wing
outline, thicken the remaining strokes) rather than a more aggressive trace of the same
source — no amount of `potrace` tuning fixes a source drawing that's too fine-grained for the
target size.
