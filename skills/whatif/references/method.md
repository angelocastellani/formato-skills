# The method

Two moments and one approval.

## 1. The words

1. **Research.** Five minutes of real sources for every claim you will say. Note them in `SOURCES.md` in the film folder:
   the claim, the source, the link. If you cannot source it, cut it or say it as a guess, out loud ("best guess").
2. **Script.** Write it with `writing.md` and the format's engine. Show the person the script, or the top two premises.
   This is the only approval. A script they bring is kept word for word.

## 2. The film

Once the words are approved nothing waits for anyone.

1. `node bin/new.mjs <slug> --format <format> --look <look>`. Put the lines in `film.json`: an `id`, who says it, `say`,
   the one or two `key` words that carry the accent. `say_as` when a word must be spelled for the voice: `say` is what the
   caption shows ("3,250"), `say_as` is what is spoken ("three thousand two hundred and fifty"), and the caption keeps the
   written word however many words are said.

   `voice` maps each `who` to an ElevenLabs voice id, and `new.mjs` leaves it empty. `node bin/voice.mjs --list` prints the
   voices on the person's account, for free. Pick one for the format's tone, and tell the person which. The dry take needs none.
2. `node bin/voice.mjs <slug> --dry`. Free. Times the film with silence.
3. Write `scenes.tsx`. One beat per line or two, each on a word:
   ```tsx
   const { at, line, t, prog, ease, look } = useFilm();
   const opens = prog(at('opens'), at('opens') + 0.4, ease.back); // lands on the word it is about
   ```
   The three ways to find a moment:
   ```tsx
   at('hole')          // the first time it is said
   at('hole', 2)       // the second time
   at('one', 1, 'a3')  // the first time on or after line a3 (or after a time in seconds)
   ```
   `at` matches the written word or any word spoken for it, and throws if neither is said, so editing a line can stop a scene
   from rendering. That is the point: fix the cue. Everything is a pure function of the frame. Seeded `rng`, never `Math.random`, never `Date`. Colours and fonts come
   from `look`.
4. `node bin/render.mjs <slug> --still 2,8,15,22,30`. Look at it. Fix it. Stills are free and take seconds.
5. Add `cues` in `film.json` (sounds on words) and `bed`. `node bin/sound.mjs <slug>`. Keep cues in the order they happen: each
   word is looked for after the cue before it, so a repeated word lands on its next saying. A cue on a word you have since
   rewritten stops the mix with a clear error.
6. `node bin/render.mjs <slug>`, then `node bin/check.mjs <slug>`, then look at `out/<slug>/measure/sheet-1.png`.
7. Once the picture holds: say the voice's price, get a yes, `node bin/voice.mjs <slug> --yes`, `node bin/sound.mjs <slug>`,
   render and check again. Scenes hang on words, so they follow the new timing.
8. Review with `review.md`, with fresh eyes. Up to three rounds, then bring the person the film and any open points.

## What never changes

1. One question. A viewer can say what the film was about in one sentence.
2. A hook in the first two seconds, said and on screen. Never a logo, never a title card alone.
3. One hero: one object, place, person or number the whole film is about. A change happens to the thing on screen; it
   recolours, opens, breaks or grows. It is not swapped for another picture.
4. A number is never static. It counts, runs or fills, and lands on its word.
5. A word not yet said does not exist, except in reading styles where it waits dimmed. One or two key words per block.
6. Something changes at least every second and a half. A hold over a second before the last two seconds is a dead hold,
   and `bin/check.mjs` fails it unless the format allows it. It also compares each frame to the frame that opened the shot,
   with the caption blanked, because grain and drift can hide a frozen picture: 2.5 s of that is a warning, 5 s a failure.
   It is a smoke alarm, not a reviewer. A shot can move and still say nothing: you have to look.
7. Nothing important in the last 220 px: the platform's own text sits there.
8. The sound: a voice, a quiet bed under it unless the format says none, and short effects on words, never over them.
   Ends on the last word, with at most a second of tail.
