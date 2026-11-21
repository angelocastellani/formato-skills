---
name: specimen
description: "Make a specimen film: one thing you could hold, on a stage, and everything that happens to it, for how a thing is made, what is inside it, what breaks it. Use for 'a film about X' where X is an object or a material, 'what is inside', 'how is it made', 'what would it take to break'. Not for a place over time (strata), a process with many parts (readout) or odds and crowds (headcount)."
---

# Specimen

One object, and nothing is ever swapped for it. It is opened, heated, broken and dropped on the word that says so, and the viewer
never leaves it. What makes it look expensive is what a product photographer would spend money on: light from behind, real
reflections, a material that reacts. What makes it work is that the object is always doing something.

Read `../whatif/references/method.md` and `writing.md` first. Worked example: `examples/glass-tear/`. Open its `scenes.tsx`; copy its
stage, its beats and its camera, never its subject.

## The engine

1. **The dare.** The object, whole, in the first frame, with the thing that should destroy it already in shot. One flat sentence.
2. **It does not care, or it does.** The dare runs on the word, on screen, and the number says what happened.
3. **Back to where it came from.** How it is made, happening to this same object: reheat it, pour it, plunge it. Do not cut to a factory.
4. **Open it.** One sentence for the mechanism, and the section opens on it: what is inside, and what it is doing right now.
5. **The household number.** The honest size of the thing, made physical beside the hero, landing on its words.
6. **The way in.** The one weakness, named after we believe there is none.
7. **It happens.** The film's biggest change, in slow motion, with the number running. Everything the object was goes somewhere we can see.
8. **One real date, then the button.** Bring the object back, whole, for a last dry line about it.

Each sentence is caused by the last. If two could swap, it is a list.

## Picture rules

- **One hero, modelled with care.** A real profile swept along a curve (`sweptGeometry`), a real faceted cut, a real section. A
  primitive is not a hero. Model the props too: a brass hammer with a ferrule beats a box on a stick.
- **Light glass and metal from behind.** `StudioEnv` puts softboxes in a black room for reflections; rear strips draw an outline, a long
  low box is what water and polish mirror. `BackWall` is opaque because transmissive materials only refract what is opaque: without it,
  clear glass reads as a black hole.
- **Check your winding.** If a glass or chrome object looks black with upside-down reflections, its triangles face inward.
- **It is never still.** Quiet is allowed; dead is not. The films measured in this family sat dead still for much of their length, and
  that is the one thing not to copy. Keep composure and keep something moving: the camera (`orbit`, slow, it never stops), a surface
  (`RippleWater`), dust in the light (`Motes`), a section that flows (`SectionFace`).
- **A change happens to the object, on the word.** A label is not a change. Hot means it glows (`HotBody`), cold means it stops.
- **One bright thing.** When something gives off light, the room goes down to meet it: `heat` warms the world, `Glow` is the bloom.
- **Labels stay on what they name.** `projector` gives you the screen point every frame; `Leader` draws from it. At most one or two on
  screen. Nothing important in the last 220 px.
- **Particles are the object.** When it breaks, every grain was somewhere in it (`Crowd` with a shard geometry; set the birth of each
  grain from the crack's position so the count and the picture agree).

## Looks

Set in `src/looks/specimen.ts`. The same `scenes.tsx` holds in all five, because the stage, the light and the number device live in
`HERO` in `src/kit/formats/specimen.tsx`. Pick by the subject's mood.

- `specimen-gold`: black and gold product studio, a plinth, a huge serif numeral. For precious things and things that deserve respect. The default.
- `specimen-cutaway`: the object opened on black, with leader labels and word pills. Sets `opensEarly`, so it opens as soon as the inside
  matters and stays open. For anything whose inside is the point.
- `specimen-macro`: a macro lens on a rippling surface, REC chrome and a frame counter that runs down to the next hit (`impacts`). For liquids,
  textures and things that happen very fast.
- `specimen-planet`: one vast body filling the frame, a serif caption and a mono stat block, with `StageTracker` for named stages. For something
  huge, or something small made to feel huge.
- `specimen-dark`: a dim room and one small lamp, thin contour rings, a thin number. Very quiet, and the camera sits back. For light, the
  senses, and anything that wants a hush.

What a film must pass per look: a `readout` (value, unit, label, hot) to `HeroNumber`, `impacts` for `specimen-macro`, `stages` for looks that
set `tracker`. Place props by `s.stage`: the floor is `y = 0` everywhere, but `macro` frames tightly, so shrink what stands beside the hero.

## Numbers

`format/numbers/specimen.json`: 26 to 56 seconds, motion 1.8 to 7, 0.7 to 3 events a second, no dead holds. The films measured in this
family ran 33 to 50 seconds at motion 0.7 to 3.2, some with quiet over 85%. Our floor is above most of them on purpose, and the worked
example runs at 4.6.

## Done means

A stranger with the sound off can say what the object is and what happened to it. The hero never left the frame except to change.
Every number on screen is true, ran, and landed on its word. The last frame is the object.
