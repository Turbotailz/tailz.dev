import { site, projects, uses } from '~/utils/content'

export function useSite() {
  return site
}

export function useProjects() {
  return projects
}

export function useUses() {
  return uses
}

export function useReducedMotion() {
  const reduced = ref(false)

  onMounted(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = mq.matches
    const onChange = () => { reduced.value = mq.matches }
    mq.addEventListener('change', onChange)
    onUnmounted(() => mq.removeEventListener('change', onChange))
  })

  return reduced
}
