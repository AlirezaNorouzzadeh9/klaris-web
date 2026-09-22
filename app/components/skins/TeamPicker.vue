<script setup lang="ts">
import type { TeamId } from '~/types/skins'

/** Multi-select T / CT toggle. At least one side stays selected. */
const props = withDefaults(defineProps<{ size?: 'sm' | 'md'; allowNone?: boolean }>(), {
  size: 'md',
  allowNone: false,
})
const model = defineModel<TeamId[]>({ required: true })

const sides = [
  { id: 2 as TeamId, label: 'T', full: 'تروریست', tone: 'side-t' },
  { id: 3 as TeamId, label: 'CT', full: 'ضدتروریست', tone: 'side-ct' },
]

function toggle(id: TeamId) {
  const on = model.value.includes(id)
  if (on && model.value.length === 1 && !props.allowNone) return
  model.value = on ? model.value.filter(t => t !== id) : [...model.value, id].sort()
}
</script>

<template>
  <div class="inline-flex gap-1.5" role="group" aria-label="تیم">
    <button
      v-for="side in sides"
      :key="side.id"
      type="button"
      :aria-pressed="model.includes(side.id)"
      :title="side.full"
      class="ltr inline-flex items-center gap-1.5 rounded-sm border font-mono font-bold transition-all duration-200"
      :class="[
        size === 'sm' ? 'h-7 px-2.5 text-[11px]' : 'h-9 px-3.5 text-xs',
        model.includes(side.id)
          ? side.tone === 'side-t'
            ? 'border-side-t/60 bg-side-t/15 text-side-t'
            : 'border-side-ct/60 bg-side-ct/15 text-side-ct'
          : 'border-white/10 bg-white/[.02] text-white/35 hover:border-white/20 hover:text-white/60',
      ]"
      @click="toggle(side.id)"
    >
      <span
        class="size-1.5 rounded-full transition-colors"
        :class="model.includes(side.id) ? (side.tone === 'side-t' ? 'bg-side-t' : 'bg-side-ct') : 'bg-white/20'"
      />
      {{ side.label }}
    </button>
  </div>
</template>
