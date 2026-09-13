import { fetchGithubTelemetry } from '../../shared/github'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  return fetchGithubTelemetry((config.githubToken as string) || undefined)
})
