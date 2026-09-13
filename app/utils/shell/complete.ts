import { site } from '~/utils/content'
import { commands, findCommand, tokenize } from './commands'
import { displayName, listNode, nodeAt, pathToSegments } from './fs'
import type { Completion } from './types'

const PATH_COMMANDS = new Set(['ls', 'cd', 'cat', 'open', 'dir', 'll', 'la', 'less', 'more'])

export function complete(input: string, cwd: string): Completion[] {
  const endsWithSpace = /\s$/.test(input)
  const tokens = tokenize(input)

  if (tokens.length === 0 || (tokens.length === 1 && !endsWithSpace)) {
    const prefix = (tokens[0] || '').toLowerCase()
    return commands
      .filter(c => !c.hidden && c.name.startsWith(prefix))
      .map(c => ({ value: c.name + ' ', label: c.name, note: c.description }))
  }

  const cmdName = tokens[0]!
  const cmd = findCommand(cmdName)
  if (!cmd) return []

  if (cmd.name === 'help') {
    const prefix = (endsWithSpace ? '' : tokens[tokens.length - 1] || '').toLowerCase()
    return commands
      .filter(c => !c.hidden && c.name.startsWith(prefix))
      .map(c => ({ value: `${cmdName} ${c.name}`, label: c.name, note: c.description }))
  }

  if (!PATH_COMMANDS.has(cmdName)) return []

  const partial = endsWithSpace ? '' : (tokens[tokens.length - 1] || '')
  const lead = endsWithSpace ? input : input.slice(0, input.length - partial.length)

  const slash = partial.lastIndexOf('/')
  const dirPart = slash >= 0 ? partial.slice(0, slash + 1) : ''
  const namePart = slash >= 0 ? partial.slice(slash + 1) : partial

  const segments = pathToSegments(cwd, dirPart || '.')
  const dir = segments ? nodeAt(segments) : null
  const out: Completion[] = []

  if (dir?.kind === 'dir') {
    for (const n of listNode(dir)) {
      if (!n.name.toLowerCase().startsWith(namePart.toLowerCase())) continue
      if (cmd.name === 'cd' && n.kind === 'file' && !n.route) continue
      const value = `${lead}${dirPart}${n.name}${n.kind === 'dir' ? '/' : ''}`
      out.push({ value, label: `${dirPart}${displayName(n)}`, note: n.note })
    }
  }

  if (cmd.name === 'open' && !dirPart) {
    const extra: Completion[] = [
      { value: `${lead}github`, label: 'github', note: site.github.replace('https://', '') },
      { value: `${lead}email`, label: 'email', note: site.email },
      ...site.communities.map(c => ({ value: `${lead}${c.name.toLowerCase()}`, label: c.name.toLowerCase(), note: c.href.replace('https://', '') }))
    ]
    for (const e of extra) {
      if (e.label.startsWith(namePart.toLowerCase()) && !out.some(o => o.label === e.label)) out.push(e)
    }
  }

  if (cmd.name === 'cd' && !dirPart && namePart === '') {
    out.unshift({ value: `${lead}..`, label: '..', note: 'up one' }, { value: `${lead}~`, label: '~', note: 'home' })
  }

  return out
}
