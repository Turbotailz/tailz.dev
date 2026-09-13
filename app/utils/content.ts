import { parse } from 'yaml'
import siteRaw from '../../data/site.yml?raw'
import projectsRaw from '../../data/projects.yml?raw'
import usesRaw from '../../data/uses.yml?raw'

export type SiteHome = { label: string, href: string, note: string }
export type Community = { name: string, href: string, note: string }

export type Site = {
  handle: string
  prompt: string
  tagline: string
  offer: string
  email: string
  github: string
  discordHandle: string
  whoami: string
  homes: SiteHome[]
  communities: Community[]
  useChips: string[]
  boot: string[]
}

export type Project = {
  slug: string
  name: string
  role: string
  featured: boolean
  oneLiner: string
  github: string
  upstream?: string
  live?: string
  community?: string
  communityUrl?: string
  bullets: string[]
}

export type UseGroup = {
  group: string
  items: { name: string, href: string, note: string }[]
}

export const site = parse(siteRaw) as Site
export const projects = parse(projectsRaw) as Project[]
export const uses = parse(usesRaw) as UseGroup[]

export function projectBySlug(slug: string) {
  return projects.find(p => p.slug === slug)
}
