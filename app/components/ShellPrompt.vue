<script setup lang="ts">
import { complete } from '~/utils/shell/complete'

const shell = useShell()
const site = useSite()

const input = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const active = ref(-1)
const histIdx = ref(-1)
const histDraft = ref('')
const busy = ref(false)

const completions = computed(() => complete(input.value, shell.cwd.value))
const open = computed(() => focused.value && input.value.length > 0 && completions.value.length > 0)

watch(input, () => { active.value = -1 })

watch(() => shell.focusTick.value, () => inputEl.value?.focus())

function accept(index = active.value >= 0 ? active.value : 0) {
  const c = completions.value[index]
  if (!c) return
  input.value = c.value
  active.value = -1
  nextTick(() => inputEl.value?.focus())
}

async function submit() {
  const value = input.value
  input.value = ''
  active.value = -1
  histIdx.value = -1
  if (!value.trim()) return
  busy.value = true
  await shell.run(value)
  busy.value = false
}

function onKeydown(e: KeyboardEvent) {
  const list = completions.value
  if (e.key === 'Tab') {
    e.preventDefault()
    if (list.length === 0) return
    if (list.length === 1 || active.value >= 0) {
      accept()
    } else if (e.shiftKey) {
      active.value = (active.value - 1 + list.length) % list.length
    } else {
      active.value = (active.value + 1) % list.length
    }
    return
  }
  if (e.key === 'Enter') {
    if (open.value && active.value >= 0) {
      e.preventDefault()
      accept()
      return
    }
    submit()
    return
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const down = e.key === 'ArrowDown'
    if (open.value) {
      e.preventDefault()
      active.value = down
        ? (active.value + 1) % list.length
        : (active.value - 1 + list.length) % list.length
      return
    }
    const h = shell.history.value
    if (!h.length) return
    e.preventDefault()
    if (histIdx.value === -1) histDraft.value = input.value
    if (down) {
      if (histIdx.value === -1) return
      histIdx.value = Math.min(histIdx.value + 1, h.length)
      input.value = histIdx.value === h.length ? histDraft.value : h[histIdx.value]!
      if (histIdx.value === h.length) histIdx.value = -1
    } else {
      histIdx.value = histIdx.value === -1 ? h.length - 1 : Math.max(0, histIdx.value - 1)
      input.value = h[histIdx.value]!
    }
    return
  }
  if (e.key === 'Escape') {
    active.value = -1
    inputEl.value?.blur()
    return
  }
  if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
    e.preventDefault()
    shell.clear()
    return
  }
  if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
    e.preventDefault()
    shell.interrupt(input.value)
    input.value = ''
    active.value = -1
    return
  }
  if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
    e.preventDefault()
    input.value = ''
  }
}

function onGlobalKey(e: KeyboardEvent) {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
  const t = e.target as HTMLElement | null
  const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
  if (e.key === '/' && !typing) {
    e.preventDefault()
    inputEl.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKey))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <div class="promptbar">
    <ul
      v-if="open"
      id="shell-completions"
      class="complete"
      role="listbox"
      aria-label="completions"
    >
      <li
        v-for="(c, i) in completions"
        :id="`shell-opt-${i}`"
        :key="c.value"
        role="option"
        :aria-selected="i === active"
        @mousedown.prevent
        @click="accept(i)"
      >
        <span class="n">{{ c.label }}</span>
        <span>{{ c.note }}</span>
      </li>
    </ul>
    <form class="promptline" @submit.prevent="submit">
      <label class="ps1" for="shell-input">
        <span class="u">{{ site.prompt.split('@')[0] }}</span><span class="at">@</span><span class="h">{{ site.prompt.split('@')[1] }}</span><span class="s">:</span><span class="d">{{ shell.cwd.value }}</span><span class="s">$</span>
      </label>
      <input
        id="shell-input"
        ref="inputEl"
        v-model="input"
        type="text"
        role="combobox"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="go"
        placeholder="help"
        aria-label="shell command"
        aria-autocomplete="list"
        :aria-expanded="open"
        aria-controls="shell-completions"
        :aria-activedescendant="active >= 0 ? `shell-opt-${active}` : undefined"
        :disabled="busy"
        @keydown="focused = true; onKeydown($event)"
        @input="focused = true"
        @focus="focused = true"
        @blur="focused = false"
      >
      <span class="prompt-hint" aria-hidden="true">/ to focus · tab to complete</span>
    </form>
  </div>
</template>
