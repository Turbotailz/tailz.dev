import { site, projects, uses } from '~/utils/content'
import type { Block } from './types'

export type FsNode = {
  name: string
  kind: 'dir' | 'file' | 'link'
  note: string
  route?: string
  href?: string
  children?: Record<string, FsNode>
  content?: () => Block[]
}

function file(name: string, note: string, route: string | undefined, content: () => Block[]): FsNode {
  return { name, kind: 'file', note, route, content }
}

function link(name: string, href: string, note: string): FsNode {
  return { name, kind: 'link', note, href }
}

function projectDir(p: (typeof projects)[number]): FsNode {
  const children: Record<string, FsNode> = {
    README: file('README', p.oneLiner, `/projects/${p.slug}`, () => [
      { kind: 'text', text: `${p.name}`, tone: 'mag' },
      { kind: 'text', text: p.oneLiner },
      { kind: 'text', text: `role: ${p.role}${p.community ? ` · community: ${p.community}` : ''}`, tone: 'dim' },
      ...p.bullets.map(b => ({ kind: 'text' as const, text: `  • ${b}` })),
      { kind: 'link', label: 'github', href: p.github, note: p.github.replace('https://', '') },
      ...(p.upstream ? [{ kind: 'link' as const, label: 'upstream', href: p.upstream, note: p.upstream.replace('https://', '') }] : []),
      ...(p.live ? [{ kind: 'link' as const, label: 'live', href: p.live, note: p.live.replace('https://', '') }] : [])
    ]),
    github: link('github', p.github, 'source')
  }
  if (p.upstream) children.upstream = link('upstream', p.upstream, 'upstream repo')
  if (p.live) children.live = link('live', p.live, 'deployed')
  if (p.communityUrl) children.discord = link('discord', p.communityUrl, p.community || 'community')
  return {
    name: p.slug,
    kind: 'dir',
    note: `${p.role} · ${p.oneLiner}`,
    route: `/projects/${p.slug}`,
    children
  }
}

const projectChildren: Record<string, FsNode> = {}
for (const p of projects) projectChildren[p.slug] = projectDir(p)

const homeChildren: Record<string, FsNode> = {}
for (const h of site.homes) homeChildren[h.label] = link(h.label, h.href, h.note)

export const root: FsNode = {
  name: '~',
  kind: 'dir',
  note: 'home',
  route: '/',
  children: {
    README: file('README', 'start here', '/', () => [
      { kind: 'text', text: `${site.handle} — ${site.tagline}`, tone: 'mag' },
      { kind: 'text', text: site.offer },
      { kind: 'text', text: 'try: ls projects · cat whoami · cd github · open discord', tone: 'dim' }
    ]),
    projects: {
      name: 'projects',
      kind: 'dir',
      note: 'open source work',
      route: '/projects',
      children: projectChildren
    },
    uses: file('uses', 'the stack I build with', '/uses', () =>
      uses.flatMap(g => [
        { kind: 'text' as const, text: `[${g.group}]`, tone: 'cyan' as const },
        { kind: 'rows' as const, cols: 2 as const, rows: g.items.map(i => ({ cells: [i.name, i.note], href: i.href })) }
      ])
    ),
    github: {
      name: 'github',
      kind: 'dir',
      note: 'profile, pins, contributions',
      route: '/github',
      children: {
        profile: link('profile', site.github, site.github.replace('https://', ''))
      }
    },
    whoami: file('whoami', 'who is behind this', '/whoami', () => [
      { kind: 'text', text: site.whoami },
      { kind: 'text', text: site.offer },
      { kind: 'link', label: 'email', href: `mailto:${site.email}`, note: site.email }
    ]),
    homes: {
      name: 'homes',
      kind: 'dir',
      note: 'other places I live',
      route: '/whoami',
      children: homeChildren
    },
    email: link('email', `mailto:${site.email}`, site.email),
    discord: link('discord', site.communities[0]?.href || site.github, `@${site.discordHandle} · ${site.communities[0]?.name || ''}`)
  }
}

export function routeToPath(routePath: string): string {
  const clean = routePath.replace(/\/+$/, '')
  return clean === '' ? '~' : `~${clean}`
}

export function pathToSegments(cwd: string, input: string): string[] | null {
  let base: string[]
  let rest = input.trim()
  if (rest === '' || rest === '~' || rest === '/') return []
  if (rest.startsWith('~/') || rest.startsWith('/')) {
    base = []
    rest = rest.replace(/^~?\//, '')
  } else {
    base = cwd.replace(/^~\/?/, '').split('/').filter(Boolean)
  }
  for (const seg of rest.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') {
      if (base.length === 0) return null
      base.pop()
      continue
    }
    base.push(seg)
  }
  return base
}

export function nodeAt(segments: string[]): FsNode | null {
  let node: FsNode = root
  for (const seg of segments) {
    const next = node.children?.[seg]
    if (!next) return null
    node = next
  }
  return node
}

export function resolve(cwd: string, input: string): { node: FsNode | null, segments: string[] | null, path: string } {
  const segments = pathToSegments(cwd, input)
  if (!segments) return { node: null, segments: null, path: input }
  const node = nodeAt(segments)
  if (node || cwd === '~' || /^[~/.]/.test(input.trim())) {
    return { node, segments, path: segments.length ? `~/${segments.join('/')}` : '~' }
  }
  // Friendly fallback: a bare name that is not here but exists under ~ still works.
  const fromHome = pathToSegments('~', input)
  const homeNode = fromHome ? nodeAt(fromHome) : null
  if (homeNode && fromHome) {
    return { node: homeNode, segments: fromHome, path: `~/${fromHome.join('/')}` }
  }
  return { node, segments, path: segments.length ? `~/${segments.join('/')}` : '~' }
}

export function listNode(node: FsNode): FsNode[] {
  return Object.values(node.children || {})
}

export function displayName(node: FsNode) {
  if (node.kind === 'dir') return `${node.name}/`
  if (node.kind === 'link') return `${node.name}@`
  return node.name
}
