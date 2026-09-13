import type { GithubTelemetry } from '#shared/github'

export type Tone = 'dim' | 'mag' | 'cyan' | 'fg'

export type Row = {
  cells: string[]
  href?: string
}

export type Block =
  | { kind: 'text', text: string, tone?: Tone }
  | { kind: 'rows', rows: Row[], cols?: 2 | 3 }
  | { kind: 'link', label: string, href: string, note?: string }
  | { kind: 'error', text: string }
  | { kind: 'ascii', text: string }

export type Entry = {
  id: number
  cwd: string
  input: string
  blocks: Block[]
}

export type Ctx = {
  cwd: string
  prevCwd: string | null
  history: string[]
  navigate: (route: string) => void
  open: (href: string) => void
  clear: () => void
  github: () => Promise<GithubTelemetry | null>
}

export type Command = {
  name: string
  usage: string
  description: string
  hidden?: boolean
  run: (args: string[], ctx: Ctx) => Block[] | Promise<Block[]>
}

export type Completion = {
  value: string
  label: string
  note: string
}
