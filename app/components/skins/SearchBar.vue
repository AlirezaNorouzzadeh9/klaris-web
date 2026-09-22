<script setup lang="ts">
/** `lg`: full-width field (phones). `md`: 38px pill that sits in the grid header (desktop). */
withDefaults(defineProps<{ placeholder: string; size?: 'lg' | 'md' }>(), { size: 'lg' })
const model = defineModel<string>({ required: true })
const input = ref<HTMLInputElement>()

// "/" focuses search from anywhere on the page. Pages can render one bar per
// breakpoint, so only the visible one reacts.
function onKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (e.key !== '/' || ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return
  if (!input.value || input.value.offsetParent === null) return
  e.preventDefault()
  input.value.focus()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="group relative">
    <Icon
      name="lucide:search"
      class="pointer-events-none absolute top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-mint-500"
      :class="size === 'md' ? 'start-3.5 size-4' : 'start-4 size-[18px]'"
    />
    <input
      ref="input"
      v-model="model"
      type="search"
      :placeholder="placeholder"
      enterkeyhint="search"
      autocomplete="off"
      class="w-full text-white outline-none transition-[border-color,box-shadow] placeholder:text-white/30 focus:border-mint-500/50 focus:shadow-[0_0_0_4px_rgb(46_232_156/.08)] [&::-webkit-search-cancel-button]:appearance-none"
      :class="size === 'md'
        ? 'h-[38px] rounded-full border border-white/10 bg-ink-900/80 ps-[38px] pe-12 text-[13px]'
        : 'h-12 rounded-xl border border-white/10 bg-ink-900/80 ps-11 pe-20 text-[14.5px]'"
      @keydown.esc="model = ''"
    >
    <button
      v-if="model"
      type="button"
      class="absolute top-1/2 end-2.5 grid size-7 -translate-y-1/2 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/8 hover:text-white"
      aria-label="پاک کردن جستجو"
      @click="model = ''; input?.focus()"
    >
      <Icon name="lucide:x" class="size-4" />
    </button>
    <kbd
      v-else
      class="pointer-events-none absolute top-1/2 end-3 hidden -translate-y-1/2 rounded-xs border border-white/12 px-1.5 py-0.5 font-mono text-[11px] text-white/35 sm:block"
    >/</kbd>
  </div>
</template>
