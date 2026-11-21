---
name: whatif
description: "The front door for faceless short films written and drawn in code: pick the format and look for a subject, write the script, build it on silence, voice it, check it. Use for 'make a what-if about X', 'a video about X', 'a faceless reel', 'which format should I use', or notes on a cut when the format is unclear. Each format has its own skill: runaway, new-law, headcount, specimen, strata, field-guide, readout, drill, little-life."
---

# What If

One method, nine formats. A film is 25 to 120 seconds of one question answered in code: no presenter, no generated
footage, every frame a function of the spoken words.

Read `references/method.md` and `references/writing.md`, then the format's skill. Run commands from this folder.

## Pick the format

Ask what the subject's real shape is, not what looks nice. If the person named a format or a look, use it.

| The subject is | Format |
|---|---|
| Anything that compounds, doubles or runs away | `runaway` |
| A social rule, a daily annoyance, a thing that should not be everywhere | `new-law` |
| Odds, percentages, how people behave in numbers | `headcount` |
| One thing you could hold: how it is made, what is inside, what breaks it | `specimen` |
| A place, and what happens to it over time or underground | `strata` |
| Nature, history, maps, a calm true explanation, or a concept you can diagram | `field-guide` |
| A system, a physics idea, your body as a machine | `readout` |
| A danger, and what to actually do | `drill` |
| A daily-life fact that wants a character to happen to | `little-life` |

Each format lists its looks. `src/looks/<format>.ts` has them all. Pick one by the subject's mood; never mix two in a
film. If two formats fit, write one premise for each and let the person pick.

This folder may not have every format. The ones it has are the format skills in `runtime.json`; use only those. If the
subject's best format is not here, say which one it is and offer the closest format you have.

## Then

Follow the format's skill. It tells you where it differs from `references/method.md`.
