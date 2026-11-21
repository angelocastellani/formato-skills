---
name: field-guide
description: "Make a field-guide film: printed figures numbered like a book (Plate one, Fig. 2) that draw themselves and then change, for nature, history, maps, how a thing works, a calm true explanation. Use for 'a field guide film', 'a plate film', 'like an old textbook', 'an atlas film', 'a botanical drawing film', or a subject you could draw as a diagram. Not for a number that runs away (runaway), odds in people (headcount), or a system shown only as readouts (readout)."
---

# Field Guide

A page from a beautiful old book, except the page is still being made. The weakness of this family of films is that the
page sits there. So a plate here is always being drawn: strokes laying down, hatching growing, ink spreading, labels ticking
on, the whole figure breathing under a hand-drawn boil. It costs nothing, because it is all SVG.

Read `../whatif/references/method.md` and `writing.md` first. Worked example: `examples/the-long-summer/`. Open its
`scenes.tsx`; copy how its figures draw and how one figure pulls back into the next, never its subject.

## The engine

1. **The hook is a question you can draw.** Something on screen is already being drawn at the first frame: start its strokes
   a little before zero. Never a blank page and a title.
2. **The hero.** One thing the whole film is about, drawn large and slowly, with its parts labelled as they are named.
3. **Plate one.** Say the number out loud, like a book. The number stamps across the figure on the word and the running head
   changes. Each plate is one step of the explanation.
4. **The figure changes.** It does not swap. It shrinks, turns, fills, gets a new line. A plate that replaces the last
   picture is a slideshow. Pull back so the old figure becomes a small part of the new one.
5. **The number runs.** Every number on a plate runs and lands on its word, against something drawn to the same maths.
6. **The button is one more plate, drawn with a straight face.** The dry last line gets the same solemn treatment as
   everything before it.

## Picture rules

- Pieces are in `src/kit/formats/field-guide.tsx`. Use them rather than plain shapes, because each reads how it is made from the
  look: `Stroke` draws a line on, `Mass` fills a shape the way the look fills (hatch, wash, block, dots, brush, gold leaf),
  `Leader` rules a label to a thing, `Label` ticks words on, `Ruler` lays ticks, `Runner` runs a number, `Globe` is a ruled
  Earth with the Sun's real declination, `Balance` weighs two things, `PlateHead` and `PlateStamp` carry the numbering,
  `Ink` boils whatever is inside it.
- Something is always laying down. Give a `Mass` the whole length of the line to fill, not half a second. A figure that is
  finished before its sentence is finished is a dead hold waiting to happen.
- Text sits outside `Ink`, so it never wobbles. Labels are 32 px or more: they have to read on a phone, and most films in this
  family fail that.
- One highlight colour, on the thing the line is about. Keep the figure above the caption and nothing important in the last
  220 px.
- A map is only ever real shapes. `src/kit/formats/field-guide-land.ts` holds Natural Earth's 1:110m land (public domain), simplified,
  so `Globe` draws real coasts. For another public-domain set, `node scripts/import-land.mjs <file.geojson>` replaces it. Never draw a
  coast by hand or trace one. Name places with `Label` at their real latitude and longitude; `the-long-summer` shows how.
- Woodblock and ink looks take a period craft, not a culture's costume. No caricature, no invented characters or fake script,
  no copy of a famous print.

## Looks

Set in `src/looks/field-guide.ts`. One `scenes.tsx` holds in all of them.

- `guide-engraving`: hatched copperplate on cream, serif, one ochre highlight. The default, and the most patient; nature, science.
- `guide-wash`: watercolour that bleeds as it fills, pencil lines, thin rule labels. Landscapes, weather, anything soft.
- `guide-woodblock`: indigo key lines, flat grainy blocks, paper label cards, vermilion. The sea, journeys, working life.
- `guide-ink-gold`: black brush on torn paper, gold leaf going on tile by tile. Repair, ritual, one precious thing.
- `guide-riso`: two inks, swelling halftone dots, a heavy slab headline with an offset shadow. The loudest plate; a dare, a warning.
- `guide-atlas`: black, cream and ochre with a ruled ground and mono labels. Maps, borders, routes, scale.
- `guide-swiss`: cream, black, one red, a huge grotesk numeral, thin circles and ticks. Astronomy, physics, anything with one clean ratio.
- `guide-dusk`: flat gradient sunset, cloud bars, an elegant serif. Light, sky, time passing, a quiet ending.
- `guide-flatbio`: flat purple and pink shapes, cross-sections, a round sans. Inside the body, cells, how anything small works.

## Numbers

`format/numbers/field-guide.json`. The films measured in this family ran 27 to 52 seconds with motion as low as 0.26 and three
quarters of the film quiet. Aim well above that; the numbers are a floor, not a goal. A boil alone can pass the meter, so check
the sheet too: something has to be getting drawn.

## Done means

Sound off, a stranger can say what the figure is by the time it is finished. Every plate is one step and each grows out of the
last. Nothing on the page is ever finished for long. Every fact is in `SOURCES.md`, and the figure says so when it is a sketch.
