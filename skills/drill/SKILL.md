---
name: drill
description: "Make a drill film: what to do if a danger happens to you, in numbered steps, each from official guidance, ending on one small thing to do tonight. Use for 'what to do if X', 'how to survive X', 'a safety film', a quake, a fire, a current, a storm, getting lost. Not for a danger explained without steps (readout, field-guide), a story about one character (little-life), or anything needing medical or legal advice beyond published public guidance."
---

# Drill

The one format with real stakes. Somebody may do what this film says. So it is written from the guidance outward: first the
official source, then the steps it allows, then the picture.

Read `../whatif/references/method.md` and `writing.md` first. Worked examples, one per look: `examples/rip-current/`
(`drill-quest`), `examples/smoke-alarm/` (`drill-scan`), `examples/grease-fire/` (`drill-rules`). Open their
`scenes.tsx`; copy the staging, never the subject.

## The rule above the rules

- **Every step comes from official guidance:** a national weather or emergency agency, the Red Cross, a national park or
  fire service. Put the source URL for each step in `SOURCES.md`, with the words it uses.
- **Never invent a step.** If no agency says it, it is not a step. A clever trick you read on a blog is not a step. Two
  agencies that disagree means you follow the stricter one or drop the step.
- **Never give medical or legal instructions beyond published public guidance.** No dosages, no diagnosis, no first aid that
  the source does not spell out, no advice on who is liable.
- **Guidance differs by country.** Say whose it is in `SOURCES.md`, and never put one country's emergency number on screen: "call for help" travels. A pan fire is the example: US agencies say lid on if it is small, the London Fire Brigade says do not tackle it. Before a film goes out elsewhere, check that country's service.
- **Say the guidance plainly.** You may shorten it and put it in second person. You may not make it sound surer than the
  source does, and you may not add "you will be fine".
- If you cannot source the subject this way, tell the person, and offer another format.

## The engine

1. **The danger, in one line.** Second person, already happening: "You are swimming hard, and the beach is moving away." No
   "what if", no "did you know". It is on screen and said inside two seconds.
2. **Three to six numbered steps.** Each is the order you do them in, each starts with its number on its word, and each is
   one instruction you could follow while frightened.
3. **Each step corrects a common mistake.** That is its reason for being there. "Do not grab the door. Feel it first." Say the
   mistake or show the mistake, in the same line or the next. A step with no mistake in it is a tip; cut it, or find the
   mistake.
4. **One surprising true thing, if there is one.** A number or a condition the viewer got wrong: rips form on calm days, a
   shut door kept a room at 100 degrees.
5. **One small thing to do tonight.** The last line. It takes under a minute and needs nothing bought: put a lid by the stove,
   close your bedroom door. Never a summary, never "stay safe". The film ends on its last word.

Keep the numbers said out loud, in the look's word ("Quest three", "Rule number three", "Three."), so a listener can follow.

## Picture rules

- **One hero all the way through:** one person in one situation. The picture shows the mistake, then the correction, on the
  same thing. It does not cut to a new illustration for each step.
- **The step stays up while it lasts,** with its number. A viewer who looks up mid-step must know where they are.
- **The instruction is drawn as the action, not only said.** Sideways is a path on a map. Low is a body under a smoke line.
- **The event rate is high.** Films in this family run 2 to 4.5 events a second. Readouts run, lists tick, chips land.
- Danger is never played for gore. Nobody is shown hurt. The worst on screen is a bar running out or a room turning amber.
- Check it against the source once more when the film is cut: does any picture imply a step the source does not give?

## Looks

Set in `src/looks/drill.ts`. Pieces in `src/kit/formats/drill.tsx`; the toy comes from `src/kit/formats/little-life.tsx`. These
three grammars differ too much to share a `scenes.tsx`, so each has its own example to start from.

- `drill-quest`: a 3D toy outdoors under a game HUD: a health bar that means something, "Quest 3" titles, toasts, punch
  captions. Use when the danger is outdoors and the steps are things your body does. Give the bar a real job: the thing the
  mistake uses up. Pieces: `HealthBar`, `QuestBanner`, `RaceBars`, `Toast`, `ToySea`.
- `drill-scan`: a dark room as a sensor draws it, in noisy dithered outlines, with a running clock, a body outline, amber
  only on what you must look at, mono captions, checklists. Tense. Use for danger at home at night, or anywhere dark. Pieces:
  `useScan`, `ScanBody`, `ScanHud`, `ScanCard`, `ScanChecklist`, `ScanReading`.
- `drill-rules`: a 1930s printed cartoon: cream and teal, one red, ink wobble, grain, a vignette, "Rule No. 1" cards that
  drop in. A period craft, never an existing character: no mouse, no cat, no famous model sheet. Personify the object
  instead, and let your own arm come in from off screen. Use for household dangers that can carry a light touch. Pieces:
  `PrintStage`, `useBeat`, `RuleCard`, `PrintBurst`.

## Numbers

`format/numbers/drill.json`: 30 to 62 seconds, motion 1.8 to 9, 1.8 to 5 events a second, no dead holds. The strongest films
measured in this family ran 35 to 54 seconds at 2 to 4.5 events a second, with no dead holds. The dark look runs the fastest because its noise moves
every frame; do not take that as permission to stop putting things on words.

## Done means

Every step has a named official source and URL in `SOURCES.md`, and nothing on screen goes further than that source. Each step
corrects a mistake a person would really make. Someone with the sound off could follow the steps in order. The last line is
one small thing they could do tonight, and it is the end of the film.
