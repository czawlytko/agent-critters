# agent-critters

A Claude Code mod that makes background agents obvious. While any background
agent is running, a band above the prompt shows a little Claude critter for each
model in use, colored by model, with one dot under it for every additional agent
on that model. The band disappears when nothing is running.

```
          6 background agents running    ▐▛███▜▌    ▐▛███▜▌    ▐▛███▜▌
                       Search auth code ▝▜█████▛▘  ▝▜█████▛▘  ▝▜█████▛▘
                    Draft migration plan  ▘▘ ▝▝      ▘▘ ▝▝      ▘▘ ▝▝
                                +3 more   Haiku     Sonnet      Opus
                                          ● ●         ●
```

| Model  | Color   |
| ------ | ------- |
| Opus   | orange  |
| Sonnet | blue    |
| Haiku  | green   |
| Fable  | yellow  |
| other  | gray    |

Dots wrap four to a row, up to three rows, then collapse into a `+N` count. On
very narrow terminals, models that don't fit collapse into a gray `+N`.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install agent-critters --marketplace czawlytko/agent-critters
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in
every session).

From a shell:

```
claude plugin install agent-critters --marketplace czawlytko/agent-critters
```

In the desktop app: click **+** next to the prompt box, then **Plugins**,
**Add marketplace** with `czawlytko/agent-critters`, then **Add plugin**.

## Notes

- The model is recorded when an agent starts, so agents that were already
  running when the mod loaded show as a gray `?` critter.
- Only agents are shown, not background shell commands.

## License

MIT
