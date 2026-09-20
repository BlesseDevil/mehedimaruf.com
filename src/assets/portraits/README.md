# Hero photos

There are six in here already, cropped to 4:5 and re-encoded. **Their original
metadata is gone** — no camera, no timestamps, no GPS, and no
embedded EXIF preview thumbnail — replaced with an author and copyright line
pointing at this site. The thumbnail matters: it is a whole second JPEG living
inside the EXIF block, often framed WIDER than the crop you published, so
stripping the visible tags alone is not enough. Re-encode to a clean buffer
first, then write the credit onto that. Anything added later should be
put through the same treatment before it is committed, since these files ship
to a public repository exactly as they sit here.


Drop your photos in this folder and they join the crossfade on the home page,
in filename order. Nothing else to edit.

- **Name them so the order is obvious**: `01-desk.jpg`, `02-field.jpg`, and so on.
- **3 to 6 works best.** Each one shows for about five seconds.
- **Portrait orientation**, roughly 4:5. The frame is an arch, so leave a little
  headroom — the top corners are rounded away.
- **Any size is fine.** They are resized and converted to modern formats at build
  time, so a straight-from-the-camera file is fine; it will not be served at that
  size.
- `.jpg`, `.jpeg`, `.png`, `.webp` and `.avif` are all picked up.

Until there is at least one photo here, the frame shows the emblem instead, so
the page never has a broken image in it.

The first photo carries the alt text "Mehedi Hasan Maruf"; the rest are treated
as decorative, because a screen reader announcing five near-identical
descriptions of the same person is noise.
