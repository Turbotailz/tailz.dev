import type { GithubTelemetry } from '#shared/github'
import { site } from '~/utils/content'
import { execute } from '~/utils/shell/commands'
import { routeToPath } from '~/utils/shell/fs'
import type { Block, Entry } from '~/utils/shell/types'

const HISTORY_KEY = 'tailz:history'
const MAX_HISTORY = 100

export function useShell() {
  const route = useRoute()
  const router = useRouter()

  const entries = useState<Entry[]>('shell:entries', () => [])
  const history = useState<string[]>('shell:history', () => [])
  const prevCwd = useState<string | null>('shell:prev', () => null)
  const focusTick = useState<number>('shell:focus', () => 0)
  const nextId = useState<number>('shell:id', () => 1)
  const gh = useState<GithubTelemetry | null | undefined>('shell:gh', () => undefined)

  const cwd = computed(() => routeToPath(route.path))

  if (import.meta.client && history.value.length === 0) {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY)
      if (raw) history.value = JSON.parse(raw)
    } catch { /* ignore */ }
  }

  function persistHistory() {
    if (!import.meta.client) return
    try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.value)) } catch { /* ignore */ }
  }

  async function github(): Promise<GithubTelemetry | null> {
    if (gh.value !== undefined) return gh.value
    try {
      gh.value = await $fetch<GithubTelemetry>('/api/github')
    } catch {
      gh.value = null
    }
    return gh.value
  }

  function push(input: string, blocks: Block[]) {
    entries.value.push({ id: nextId.value++, cwd: cwd.value, input, blocks })
    if (entries.value.length > 60) entries.value.splice(0, entries.value.length - 60)
  }

  async function run(raw: string) {
    const input = raw.trim()
    if (!input) return
    if (history.value[history.value.length - 1] !== input) {
      history.value.push(input)
      if (history.value.length > MAX_HISTORY) history.value.shift()
      persistHistory()
    }
    const from = cwd.value
    let cleared = false
    const blocks = await execute(input, {
      cwd: from,
      prevCwd: prevCwd.value,
      history: history.value,
      navigate(to) {
        if (to !== route.path) {
          prevCwd.value = from
          router.push(to)
        }
      },
      open(href) {
        if (!import.meta.client) return
        if (href.startsWith('mailto:')) {
          window.location.href = href
        } else {
          window.open(href, '_blank', 'noopener,noreferrer')
        }
      },
      clear() {
        cleared = true
        entries.value = []
      },
      github
    })
    if (cleared) return
    push(input, blocks)
  }

  function interrupt(partial: string) {
    push(`${partial}^C`, [])
  }

  function clear() {
    entries.value = []
  }

  function focus() {
    focusTick.value++
  }

  return { site, cwd, entries, history, run, clear, interrupt, focus, focusTick, github }
}
