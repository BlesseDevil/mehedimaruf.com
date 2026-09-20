# Brand assets — what to use where

The source emblem is **346 × 340 px**, which is the hard ceiling on fidelity.
That is enough for a crisp 170px on a 2× screen, and everything the site needs
today sits well under that.

| File | Use it for | Notes |
| --- | --- | --- |
| `emblem.png` | Everything on the site: portal trigger, footer mark, portal cards | Full colour with the original gradients, transparent. Do not display above ~170px |
| `emblem-gold.png` | Dark backgrounds where the full-colour mark reads too busy | The gold/cream variant, 254px |
| `emblem-colour.svg` | Not used on the site yet | Traced, 4 flat colours. Holds up at 24px but loses the gradients and the feather detail |
| `emblem-line.svg` | Not used on the site yet | Single-colour outline, `currentColor`, so it can be themed. Only legible from ~96px up |
| `../../../public/favicon-32.png`, `icon-192`, `icon-512`, `apple-touch-icon` | Generated from `emblem.png` | Regenerate with the script in the session notes if the emblem changes |

**Why raster and not the traces:** the client compared them and the traced
versions lose too much detail, so the site uses the original raster while the
display sizes stay small. A vector redraw that keeps the feather work belongs to
the separate BlesseDevil branding project, not to this build.

**Colours** come from values sampled out of `emblem.png`, never from the brand
sheets in `.blessedevil/` — those sheets are AI-generated and their hex values
and specimen text are garbled.

See `TRACE-NOTES.md` for how the traces were produced and where they break down.
