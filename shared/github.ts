export type GithubDay = { date: string, count: number }

export type GithubActivity = {
  date: string
  title: string
  url: string
}

export type GithubPinned = {
  name: string
  url: string
  description: string | null
}

export type GithubTelemetry = {
  ok: boolean
  login: string
  name: string | null
  bio: string | null
  avatarUrl: string | null
  htmlUrl: string
  publicRepos: number
  followers: number
  createdAt: string | null
  weeks: GithubDay[][]
  pinned: GithubPinned[]
  activity: GithubActivity[]
}

const LOGIN = 'Turbotailz'
const FALLBACK_PINNED: GithubPinned[] = [
  { name: 'LuckPermsWeb', url: 'https://github.com/Turbotailz/LuckPermsWeb', description: 'LuckPerms website and editor (v3)' },
  { name: 'syscraft.dev', url: 'https://github.com/Turbotailz/syscraft.dev', description: 'Syscraft wiki rebuild' },
  { name: 'morpheus', url: 'https://github.com/Turbotailz/morpheus', description: 'In-browser data transforms' },
  { name: 'athena-api', url: 'https://github.com/Turbotailz/athena-api', description: 'Overwatch Stadium data API' }
]

function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'tailz.dev'
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

function emptyTelemetry(partial: Partial<GithubTelemetry> = {}): GithubTelemetry {
  return {
    ok: false,
    login: LOGIN,
    name: 'Sam Goodger',
    bio: null,
    avatarUrl: 'https://avatars.githubusercontent.com/u/10846855?v=4',
    htmlUrl: `https://github.com/${LOGIN}`,
    publicRepos: 0,
    followers: 0,
    createdAt: '2015-02-04T10:28:09Z',
    weeks: [],
    pinned: FALLBACK_PINNED,
    activity: [],
    ...partial
  }
}

type GraphqlBody = {
  data?: {
    user?: {
      pinnedItems?: { nodes?: Array<{ name?: string, url?: string, description?: string | null }> }
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: Array<{ contributionDays?: Array<{ date: string, contributionCount: number }> }>
        }
      }
    }
    search?: {
      nodes?: Array<{ title?: string, url?: string, createdAt?: string }>
    }
  }
}

async function graphql(token: string, query: string): Promise<GraphqlBody | null> {
  try {
    return await $fetch<GraphqlBody>('https://api.github.com/graphql', {
      method: 'POST',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: { query }
    })
  } catch {
    return null
  }
}

export async function fetchGithubTelemetry(token?: string): Promise<GithubTelemetry> {
  try {
    const user = await $fetch<{
      login: string
      name: string | null
      bio: string | null
      avatar_url: string
      html_url: string
      public_repos: number
      followers: number
      created_at: string
    }>(`https://api.github.com/users/${LOGIN}`, { headers: headers(token) })

    const base = emptyTelemetry({
      ok: true,
      login: user.login,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      htmlUrl: user.html_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      createdAt: user.created_at
    })

    if (token) {
      const gq = await graphql(token, `
        query {
          user(login: "${LOGIN}") {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes { ... on Repository { name url description } }
            }
            contributionsCollection {
              contributionCalendar {
                weeks { contributionDays { date contributionCount } }
              }
            }
          }
          search(query: "author:${LOGIN} org:LuckPerms is:pr sort:created-desc", type: ISSUE, first: 6) {
            nodes { ... on PullRequest { title url createdAt } }
          }
        }
      `)
      const u = gq?.data?.user
      const weeks = (u?.contributionsCollection?.contributionCalendar?.weeks || []).map(w =>
        (w.contributionDays || []).map(d => ({ date: d.date, count: d.contributionCount }))
      )
      const pinned = (u?.pinnedItems?.nodes || [])
        .filter(n => n?.name && n?.url)
        .map(n => ({ name: n.name!, url: n.url!, description: n.description ?? null }))
      const activity = (gq?.data?.search?.nodes || [])
        .filter(n => n?.title && n?.url)
        .map(n => ({
          date: (n.createdAt || '').slice(0, 10),
          title: n.title!,
          url: n.url!
        }))
      return {
        ...base,
        weeks,
        pinned: pinned.length ? pinned : FALLBACK_PINNED,
        activity
      }
    }

    try {
      const events = await $fetch<Array<{
        type: string
        created_at: string
        repo: { name: string }
        payload?: { pull_request?: { html_url?: string, title?: string } }
      }>>(`https://api.github.com/users/${LOGIN}/events/public`, {
        headers: headers(token),
        query: { per_page: 20 }
      })
      const verbs: Record<string, string> = {
        PushEvent: 'push',
        PullRequestEvent: 'pull request',
        IssuesEvent: 'issue',
        IssueCommentEvent: 'comment',
        CreateEvent: 'create',
        ReleaseEvent: 'release',
        WatchEvent: 'star',
        ForkEvent: 'fork'
      }
      const seen = new Map<string, { date: string, title: string, url: string, n: number }>()
      for (const e of events) {
        if (e.type === 'WatchEvent' || e.type === 'ForkEvent') continue
        const date = e.created_at.slice(0, 10)
        const pr = e.payload?.pull_request
        const key = pr ? pr.html_url || `${date}:${e.type}:${e.repo.name}` : `${date}:${e.type}:${e.repo.name}`
        const existing = seen.get(key)
        if (existing) {
          existing.n += 1
          continue
        }
        seen.set(key, {
          date,
          title: pr?.title ? `${verbs[e.type] || e.type} · ${pr.title}` : `${verbs[e.type] || e.type} → ${e.repo.name}`,
          url: pr?.html_url || `https://github.com/${e.repo.name}`,
          n: 1
        })
      }
      const activity = [...seen.values()].slice(0, 6).map(a => ({
        date: a.date,
        title: a.n > 1 ? `${a.title} ×${a.n}` : a.title,
        url: a.url
      }))
      return { ...base, activity }
    } catch {
      return base
    }
  } catch {
    return emptyTelemetry()
  }
}
