import { site, projects } from '~/utils/content'
import { displayName, listNode, resolve, root } from './fs'
import { WORDMARK_FULL } from './ascii'
import type { Block, Command, Ctx, Tone } from './types'

const err = (text: string): Block => ({ kind: 'error', text })
const txt = (text: string, tone?: Tone): Block => ({ kind: 'text', text, tone })

const help: Command = {
  name: 'help',
  usage: 'help [command]',
  description: 'list commands',
  run(args) {
    if (args[0]) {
      const c = commands.find(x => x.name === args[0])
      if (!c) return [err(`help: no help topic for '${args[0]}'`)]
      return [txt(c.usage, 'cyan'), txt(c.description)]
    }
    return [
      txt('tailz shell — real pages, real URLs, one fake shell.', 'dim'),
      {
        kind: 'rows',
        cols: 2,
        rows: commands.filter(c => !c.hidden).map(c => ({ cells: [c.usage, c.description] }))
      },
      txt('tab completes · ↑↓ history · / focuses the prompt · esc leaves it', 'dim')
    ]
  }
}

const ls: Command = {
  name: 'ls',
  usage: 'ls [path]',
  description: 'list what is here',
  run(args, ctx) {
    const target = args.find(a => !a.startsWith('-')) || '.'
    const { node, path } = resolve(ctx.cwd, target)
    if (!node) return [err(`ls: cannot access '${target}': No such file or directory`)]
    if (node.kind !== 'dir') {
      return [{ kind: 'rows', cols: 2, rows: [{ cells: [displayName(node), node.note], href: node.href || node.route }] }]
    }
    const rows = listNode(node).map(n => ({
      cells: [displayName(n), n.kind, n.note],
      href: n.kind === 'link' ? n.href : n.route
    }))
    return [txt(path, 'dim'), { kind: 'rows', cols: 3, rows }]
  }
}

const cd: Command = {
  name: 'cd',
  usage: 'cd <path>',
  description: 'go somewhere (.. ~ - work)',
  run(args, ctx) {
    const target = args[0] ?? '~'
    if (target === '-') {
      if (!ctx.prevCwd) return [err('cd: OLDPWD not set')]
      const { node } = resolve('~', ctx.prevCwd)
      if (node?.route) ctx.navigate(node.route)
      return []
    }
    const { node, segments } = resolve(ctx.cwd, target)
    if (!segments) return [err(`cd: ${target}: already at ~`)]
    if (!node) return [err(`cd: no such file or directory: ${target}`)]
    if (node.kind === 'link' && node.href) {
      ctx.open(node.href)
      return [txt(`opening ${node.href}`, 'dim')]
    }
    if (!node.route) return [err(`cd: not a directory: ${target}`)]
    ctx.navigate(node.route)
    return []
  }
}

const cat: Command = {
  name: 'cat',
  usage: 'cat <file>',
  description: 'print a file',
  run(args, ctx) {
    if (!args[0]) return [err('cat: missing file operand')]
    const out: Block[] = []
    for (const target of args) {
      const { node } = resolve(ctx.cwd, target)
      if (!node) {
        out.push(err(`cat: ${target}: No such file or directory`))
        continue
      }
      if (node.kind === 'dir') {
        const readme = node.children?.README
        if (readme?.content) {
          out.push(...readme.content())
        } else {
          out.push(err(`cat: ${target}: Is a directory`))
        }
        continue
      }
      if (node.kind === 'link') {
        out.push({ kind: 'link', label: node.name, href: node.href!, note: node.note })
        continue
      }
      out.push(...(node.content?.() || [txt(node.note)]))
    }
    return out
  }
}

const open: Command = {
  name: 'open',
  usage: 'open <link>',
  description: 'open a link in a new tab',
  run(args, ctx) {
    if (!args[0]) return [err('open: what? try open github · open discord · open luckperms/live')]
    const target = args[0]
    const aliases: Record<string, string> = {
      github: site.github,
      gh: site.github,
      email: `mailto:${site.email}`,
      mail: `mailto:${site.email}`
    }
    for (const c of site.communities) aliases[c.name.toLowerCase()] = c.href
    for (const h of site.homes) aliases[h.label] = h.href
    let href = aliases[target.toLowerCase()]
    if (!href) {
      const { node } = resolve(ctx.cwd, target)
      href = node?.href || (node?.kind === 'dir' && node.children?.live?.href) || node?.children?.github?.href || ''
      if (!href && node?.route) {
        ctx.navigate(node.route)
        return []
      }
    }
    if (!href) return [err(`open: cannot open '${target}'`)]
    ctx.open(href)
    return [txt(`→ ${href.replace(/^mailto:/, '')}`, 'dim')]
  }
}

const pwd: Command = {
  name: 'pwd',
  usage: 'pwd',
  description: 'where am I',
  run(_, ctx) {
    return [txt(ctx.cwd)]
  }
}

const whoami: Command = {
  name: 'whoami',
  usage: 'whoami',
  description: 'who is typing',
  run() {
    return [txt(site.handle, 'mag'), txt(site.tagline, 'dim')]
  }
}

const github: Command = {
  name: 'github',
  usage: 'github',
  description: 'live profile stats',
  async run(_, ctx) {
    const gh = await ctx.github()
    if (!gh) return [err('github: telemetry offline'), { kind: 'link', label: 'profile', href: site.github, note: site.github.replace('https://', '') }]
    const total = gh.weeks.flat().reduce((n, d) => n + d.count, 0)
    return [
      { kind: 'link', label: gh.login, href: gh.htmlUrl, note: gh.name || '' },
      {
        kind: 'rows',
        cols: 2,
        rows: [
          { cells: ['repos', String(gh.publicRepos)] },
          { cells: ['followers', String(gh.followers)] },
          { cells: ['since', gh.createdAt?.slice(0, 4) || '—'] },
          ...(total ? [{ cells: ['contributions', `${total} in the last year`] }] : []),
          { cells: ['pinned', gh.pinned.map(p => p.name).join(', ')] }
        ]
      }
    ]
  }
}

const neofetch: Command = {
  name: 'neofetch',
  usage: 'neofetch',
  description: 'system info',
  async run(_, ctx) {
    const gh = await ctx.github()
    return [
      { kind: 'ascii', text: WORDMARK_FULL },
      {
        kind: 'rows',
        cols: 2,
        rows: [
          { cells: ['user', `${site.prompt}`] },
          { cells: ['os', 'tailz.dev · console-core' ] },
          { cells: ['host', 'Cloudflare Pages · SYD'] },
          { cells: ['shell', 'tailz-sh (nuxt 4)'] },
          { cells: ['uptime', `since ${gh?.createdAt?.slice(0, 4) || '2015'}`] },
          { cells: ['packages', `${projects.length} projects · ${projects.filter(p => p.role === 'author').length} authored`] },
          { cells: ['theme', 'synthwave [magenta/cyan]'] },
          { cells: ['terminal', typeof navigator === 'undefined' ? 'browser' : (navigator.userAgent.match(/(Firefox|Safari|Chrome|Edg)\/[\d.]+/)?.[0] || 'browser')] }
        ]
      },
      txt('████ ████ ████ ████', 'mag')
    ]
  }
}

const echo: Command = {
  name: 'echo',
  usage: 'echo <text>',
  description: 'say it back',
  run(args) {
    return [txt(args.join(' '))]
  }
}

const history: Command = {
  name: 'history',
  usage: 'history',
  description: 'what you typed',
  run(_, ctx) {
    if (!ctx.history.length) return [txt('(empty)', 'dim')]
    return [{ kind: 'rows', cols: 2, rows: ctx.history.map((h, i) => ({ cells: [String(i + 1).padStart(3, ' '), h] })) }]
  }
}

const clear: Command = {
  name: 'clear',
  usage: 'clear',
  description: 'wipe the log',
  run(_, ctx) {
    ctx.clear()
    return []
  }
}

const exit: Command = {
  name: 'exit',
  usage: 'exit',
  description: 'there is no escape',
  run() {
    return [txt('logout', 'dim'), txt('…just kidding. this is a website. try cd ~', 'dim')]
  }
}

const sudo: Command = {
  name: 'sudo',
  usage: 'sudo',
  description: '',
  hidden: true,
  run() {
    return [err(`turbo is not in the sudoers file. This incident will be reported.`)]
  }
}

const rm: Command = {
  name: 'rm',
  usage: 'rm',
  description: '',
  hidden: true,
  run(args) {
    if (args.includes('-rf') && (args.includes('/') || args.includes('~'))) return [err('rm: nice try. the site stays.')]
    return [err('rm: read-only file system')]
  }
}

const vim: Command = {
  name: 'vim',
  usage: 'vim',
  description: '',
  hidden: true,
  run() {
    return [txt('E37: No write since last change. (:q! to exit — you’re welcome)', 'dim')]
  }
}

export const commands: Command[] = [help, ls, cd, cat, open, pwd, whoami, github, neofetch, echo, history, clear, exit, sudo, rm, vim]

const aliases: Record<string, string> = {
  gh: 'github',
  dir: 'ls',
  ll: 'ls',
  la: 'ls',
  '?': 'help',
  man: 'help',
  less: 'cat',
  more: 'cat',
  cls: 'clear',
  quit: 'exit',
  logout: 'exit',
  nvim: 'vim',
  vi: 'vim',
  emacs: 'vim',
  nano: 'vim'
}

export function findCommand(name: string): Command | undefined {
  const real = aliases[name] || name
  return commands.find(c => c.name === real)
}

export function tokenize(input: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(input))) out.push(m[1] ?? m[2] ?? m[3] ?? '')
  return out
}

export async function execute(input: string, ctx: Ctx): Promise<Block[]> {
  const [name, ...args] = tokenize(input)
  if (!name) return []
  const cmd = findCommand(name)
  if (!cmd) {
    const { node } = resolve(ctx.cwd, name)
    if (node?.route) {
      ctx.navigate(node.route)
      return []
    }
    return [err(`tailz-sh: command not found: ${name}`), txt('type help for the list', 'dim')]
  }
  try {
    return await cmd.run(args, ctx)
  } catch (e) {
    return [err(`${cmd.name}: ${(e as Error).message || 'failed'}`)]
  }
}

export { root }
