# Formato skills

Free sample format skills from [Formato](https://useformato.com), a store of creative workflow packs for coding agents. Each skill teaches Claude Code, Cursor or Codex how to write and structure a faceless short film in a given format. The films are drawn in code, not generated.

This repository has four of Formato's nine faceless formats, released as free samples, plus the shared front-door skill they depend on.

| Skill | What it makes | Example on Formato |
| --- | --- | --- |
| [Runaway](skills/runaway) | One small thing doubles at every step until it breaks the world, then a small human joke | [Pass the Note](https://useformato.com/runaway?film=wi-pass-the-note) |
| [Drill](skills/drill) | What to do if a danger happens to you, in numbered steps from official guidance | [Grease Fire](https://useformato.com/drill?film=wi-grease-fire) |
| [Field Guide](skills/field-guide) | Numbered printed plates that draw themselves, in a signature look | [The Long Summer](https://useformato.com/field-guide?film=wi-the-long-summer) |
| [Specimen](skills/specimen) | One object on a stage: how it's made, what's inside, what breaks it | [Glass Tear](https://useformato.com/specimen?film=wi-glass-tear) |

The [whatif](skills/whatif) skill is the front door: it helps pick a format and holds the method, writing and review notes the four formats share. The format skills tell the agent to read it first.

## Install

Clone the repo, then copy the skill folders into the place your agent loads skills from. The worked examples in `examples/` stay with the repo; open the repo (or copy `examples/` next to the skills) if you want the agent to read them.

### Claude Code

```sh
git clone https://github.com/angelocastellani/formato-skills.git
mkdir -p ~/.claude/skills
cp -R formato-skills/skills/* ~/.claude/skills/
```

Or, inside a project:

```sh
mkdir -p .claude/skills
cp -R /path/to/formato-skills/skills/* .claude/skills/
```

Then ask for a film, or invoke `/runaway`, `/drill`, `/field-guide`, `/specimen` or `/whatif`.

### Cursor

Copy `skills/*` into `~/.agents/skills/` (or the project's `.agents/skills/`). Invoke with `/runaway`, `/drill`, `/field-guide`, `/specimen` or `/whatif`.

### Codex

Same folders as Cursor: copy `skills/*` into `~/.agents/skills/`. Invoke with `$runaway`, `$drill`, `$field-guide`, `$specimen` or `$whatif`.

You can also install from GitHub with [Vercel Labs' skills CLI](https://github.com/vercel-labs/skills):

```sh
npx skills add angelocastellani/formato-skills
```

## What's in here

- `skills/` — each format's `SKILL.md` and any reference docs it points at, copied unchanged from the pack
- `examples/` — the worked examples those skills name (`film.json`, `scenes.tsx`, `SOURCES.md`)

These are the format skills: the writing engine, picture rules and examples. They do not include the Remotion renderer, the voice and sound pipeline, or the other packs.

## The rest of the store

[Motion Ads](https://useformato.com/motion-ads), [Reelforge](https://useformato.com/reelforge), [Skits](https://useformato.com/skits) and the other five faceless formats (New Law, Headcount, Strata, Readout, Little Life) are sold on [useformato.com](https://useformato.com). Each pack is $49 once, or $99 for every pack on the store; 14-day refund. Browse the [full catalog](https://useformato.com/packs).

To render a finished film you still need Node 20 or newer, ffmpeg, Remotion (free for individuals and companies of up to three people; larger companies need a [Remotion company licence](https://www.remotion.pro)), and an ElevenLabs key for the voice.

## License

MIT. See [LICENSE](LICENSE).
