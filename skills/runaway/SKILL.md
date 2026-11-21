---
name: runaway
description: "Make a runaway film: one small thing doubles at every step until it outgrows the room, the city, the planet, and then we go back for a tiny human joke. A number you read, a sentence you read, and short lines from a cast of voices. Use for 'a what-if that doubles', 'what if X doubled every day', 'how big would it get', or any subject that compounds or runs away. Not for odds and percentages (headcount), a social rule spreading through a day (new-law), or one thing you can hold explained calmly (specimen)."
---

# Runaway

Nobody can feel an exponential. So this film does not explain one. It stands a person next to it, moves the camera back every time they
look away, and lets you read the number going past. By the end the thing is past the Moon, and the person is still embarrassed about
the same small thing as in the first second. That gap is the film.

Read `../whatif/references/method.md` and `writing.md` first. Worked example: `examples/pass-the-note/`. Open its `scenes.tsx`; copy its
ladder, its shots and its ending, never its subject. Then `references/premises.md` before you write a word.

## The film has three layers of words, and they do three jobs

| Layer | What it is | Its job |
|---|---|---|
| **The readout** | Top left and always there: the topic, the big step ("Fold 14"), the value, what it compares to, one red tag with the rule | The truth. It never jokes and it never stops |
| **The sentence** | Italic serif under the readout. It is read and never said | The narrator: what just happened, in eight words, drily |
| **The lines** | Spoken by whoever is standing there, about 0.9 words a second across the film | The comedy. Each person only knows their own small piece |

If a spoken line explains the maths, move it to the sentence. If the sentence makes a sound, move it to a person. Nobody in the film
ever says the number's name for what is happening. Nobody says "exponential".

## The engine

1. **The small want.** Before the premise, a person who wants one small human thing. Not "a thing doubles": someone is trying to pass a
   note, keep a job, get out of a dinner. The first thing heard is them, mid-scene, unaware. On screen, in the first two seconds, the
   what-if in big italics.
2. **The rule, once.** The red tag and one sentence. Then never again. It is on screen for the rest of the film, so nobody has to say it.
3. **The reason to go on.** The person causes the next step, or refuses to stop it, and they have a reason that makes sense from where
   they are standing. This is what makes it a chain and not a list: "So he folds it again." If the doubling just happens to them, the
   film is a slideshow. Give them a moment where they could stop, and show them not stopping.
4. **The ladder.** Each rung is a shot and a new person: someone who has only just met the problem and thinks it is their own small
   problem. A teacher. A caretaker. A reporter. A pilot. They speak one line, from inside their job, without panic. Deadpan beats
   screaming every time.
   ```
   hand > desk > room > the floor above > the roof > the street > the skyline > the airliners > space > the planet > the Moon
   ```
   Every rung names a landmark the number has just passed. Each one is sourced. See `references/premises.md` for how to build this table.
5. **Room, huge, room, huge.** Alternate. After a huge shot, cut straight back to someone indoors looking at it, or at the person who
   did it. The huge shot has no line, or one from a stranger. The room shot is where the jokes are.
6. **The honest fact on the way past.** One sentence that is simply true and quietly worse than the picture: "The real world record is
   twelve folds." "Half of that was the last fold." This is the only teaching in the film. Use it, once or twice.
7. **The return.** At the very top, when the thing has beaten the whole sky, hard cut to the first person in the first room. Same
   clothes, same lighting, same small want. The readout has not gone anywhere and still says the huge number.
8. **The button.** The first person says a line about the small want, as though the last sixty seconds did not happen. Three to seven
   words. It does not mention the thing. Write this line first, before anything else: if it is not funny on its own after a summary of
   the premise, change the premise.

Pacing: 12 to 20 lines, 60 to 100 spoken words, in 50 to 120 seconds. Most of the time nobody is talking, and that is correct: you are
reading. Give a line a `gap` in `film.json` so a shot has room to be read, and hang the shot on the next line's first word.

## Picture rules

- **The hero changes on screen.** Every shot begins on the last step, and at least one doubling lands in it, with a thump and a jolt of
  camera, as you watch. The number and the picture move together. `useLadder` does this: `stepF` overshoots as each step lands, and sizing
  anything by it makes it thump. Never type a height in by hand.
- **Same maths in every shot.** `metres(step)` (or your own unit) is one function at the top of `scenes.tsx`. If the readout says 839 m, the
  thing is 839 m in a set where a building is the height of a building. Cheat its width so we can see it, and say so in `SOURCES.md`.
- **Hard cuts with a whoosh.** About 18 a minute. Cut on a word, never on a timer. A long line can carry a cutaway in the middle of it.
- **Nothing is ever still.** Reading needs still *type*, not a still picture. Every shot: a camera that travels, a planet that turns, paper
  falling, somebody fidgeting. `bin/check.mjs` fails a hold of a second or more here, and that is the bar on purpose. Films of this
  family often sit on long holds; ours do not.
- **The readout never overlaps the hero.** In tall shots put the hero in the right third of the frame and let it run off the top: it is a
  vertical format and this is a vertical subject. `ReadLine` is 680 wide for this reason. A dark `Scrim` under the type keeps it legible over
  any sky, and you check it at phone size.
- **Model figures, not a game.** `BoxPerson` is a painted, egg-headed, dot-eyed figure, closer to a model-railway passenger than to anything you can
  play. Never add cube heads, block hands, studs, pixel skins, square-tile faces or a block-built world. Vary their wardrobe, hair and height. Children are
  `scale={0.8}` with `kid: true`.
- **Mouths on words.** `useMouth()` opens a mouth only while that person's line is being said.
- **Sets a number outgrows** are in `src/kit/formats/runaway.tsx`: `Town` and `townPlan` for seeded streets and skylines, `Globe`, `MoonBall`,
  `Sky`, `Drift`, `Column`. Rooms belong to the film and live in `scenes.tsx`.

## Voices

Cast every line. `film.voice` maps `who` to a voice id, and `Spoken` shows the speaker's name above the words so it works with the sound off.
Three or four voices cover a cast of eight: a child, a woman, a man, an older man, each playing several people. A bed underneath, kept
quiet, and short sounds on cuts and folds: `whoosh` on the cut, `tick` on a passing step, `stamp` on the one that lands, a `riser` into the
top, an `impact` when it passes the last landmark.

## Looks

Set in `src/looks/runaway.ts`.

- `runaway-model`: painted model-railway figures in model sets, a serif readout in white, an italic sentence, one red tag.

## Numbers

`format/numbers/runaway.json`. Measured on ten films of this family: 50 to 119 seconds, motion about 1.8, 16 to 23 cuts a minute, half the
frames quiet, and 5 to 28 holds of a second or more. Keep the length and the cut rate. Beat the rest: the worked example runs motion
above 2.5 with about 15% quiet frames and no dead holds.

## Done means

Every number on screen is what your function says, and every landmark it passes is sourced. A stranger can say what doubled. Someone chose
to keep going. The last line is about the first want, and it does not mention the thing.

The Earth in this format is a carved toy with made-up land, so never name a place on it. When the film needs real geography, use `field-guide`.
