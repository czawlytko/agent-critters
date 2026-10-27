import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Critter } from '../types'

// Model each agent was spawned on, keyed by agentId: $.agent.list() doesn't carry it.
const models = atom({ plugin: 'agent-critters', key: 'models' } as const, {})
const running = atom({ plugin: 'agent-critters', key: 'running' } as const, [], {
  shape: 'running-1',
})

const ACTIVE = new Set(['pending', 'running', 'waiting'])

const CRITTER = [' ▐▛███▜▌ ', '▝▜█████▛▘', '  ▘▘ ▝▝  ']

// Extra agents of a model show as dots under its critter, 4 to a row, at most 3 rows.
const DOTS_PER_ROW = 4
const DOT_ROWS = 3

const dotRows = (extra: number) => {
  const max = DOTS_PER_ROW * DOT_ROWS
  const dots = Array<string>(Math.min(extra, max)).fill('●')
  if (extra > max) {
    dots[max - 1] = `+${extra - max + 1}`
  }
  const rows: string[] = []
  for (let i = 0; i < dots.length; i += DOTS_PER_ROW) {
    rows.push(dots.slice(i, i + DOTS_PER_ROW).join(' '))
  }
  return rows
}

const FAMILIES: { match: string; label: string; color: string }[] = [
  { match: 'opus', label: 'Opus', color: '#D97757' },
  { match: 'sonnet', label: 'Sonnet', color: '#2C84B9' },
  { match: 'haiku', label: 'Haiku', color: '#46AB9D' },
  { match: 'fable', label: 'Fable', color: '#F9C609' },
]

const family = (model: string) =>
  FAMILIES.find(f => model.toLowerCase().includes(f.match)) ?? {
    match: '',
    label: model || '?',
    color: '#82848B',
  }

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    let last = ''
    $.clock.every(1000, async () => {
      const known = await read($, models)
      const list = (await $.agent.list())
        .filter(a => ACTIVE.has(a.status))
        .map(a => ({ id: a.id, model: known[a.id] ?? '', description: a.description }))
      const key = JSON.stringify(list)
      if (key !== last) {
        last = key
        await update($, running, () => list)
      }
    })

    return next(e)
  })

  on('agent.spawn', async ($, e, next) => {
    const result = await next(e)
    if ('agentId' in result && result.agentId) {
      const id = result.agentId
      await update($, models, m => ({ ...m, [id]: result.model })).catch(() => {})
    }

    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, running)
    if (e.props.hasSurvey || list.length === 0) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    // Each critter takes 11 columns with its gap; keep ~34 for the text block.
    const slots = Math.max(1, Math.floor(((e.viewport?.columns ?? 120) - 34) / 11))

    // One critter per model; its other agents become dots beneath it.
    const groups = new Map<string, { color: string; label: string; n: number }>()
    for (const c of list) {
      const f = family(c.model)
      const g = groups.get(f.label) ?? { color: f.color, label: f.label, n: 0 }
      g.n += 1
      groups.set(f.label, g)
    }
    let shown = [...groups.values()].map(g => ({
      key: g.label,
      color: g.color,
      label: g.label,
      dots: dotRows(g.n - 1),
    }))
    const hidden = shown.length > slots ? shown.length - (slots - 1) : 0
    if (hidden > 0) {
      shown = shown.slice(0, slots - 1)
    }

    return (
      <Box flexDirection="row" width="100%" justifyContent="flex-end" alignItems="flex-start" gap={2}>
        <Box flexDirection="column" alignItems="flex-end">
          <Text bold>
            {list.length} background agent{list.length === 1 ? '' : 's'} running
          </Text>
          {list.slice(0, 3).map(c => (
            <Text dimColor wrap="truncate-end">{c.description}</Text>
          ))}
          {list.length > 3 && <Text dimColor>+{list.length - 3} more</Text>}
        </Box>
        {shown.map(c => (
          <Box key={c.key} flexDirection="column" alignItems="center">
            {CRITTER.map(line => (
              <Text color={c.color}>{line}</Text>
            ))}
            <Text color={c.color} bold>
              {c.label}
            </Text>
            {c.dots.map(row => (
              <Text color={c.color}>{row}</Text>
            ))}
          </Box>
        ))}
        {hidden > 0 && (
          <Box flexDirection="column" justifyContent="center">
            <Text color="#82848B" bold>
              +{hidden}
            </Text>
          </Box>
        )}
      </Box>
    )
  })
}
