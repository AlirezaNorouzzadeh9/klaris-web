<script setup lang="ts">
import type { WeaponEntry } from '~/composables/useCatalog'
import { ALL_WEAPONS, groupWeapons } from '~/data/weapons'

/** Desktop side panel. Phones and tablets use WeaponPicker instead. */
const props = defineProps<{
  weapons: WeaponEntry[]
  /** defindexes that have a saved skin (or the equipped knife). */
  configured: Set<number>
  grouped?: boolean
  title: string
  allLabel: string
  total: number
}>()
const model = defineModel<number>({ required: true })

const groups = computed(() => groupWeapons(props.weapons, props.grouped))
</script>

<template>
  <aside class="sticky top-[136px] flex max-h-[calc(100dvh-156px)] flex-col overflow-hidden rounded-lg border border-white/7 bg-ink-900/70">
    <p class="border-b border-white/6 px-4 py-3 text-[12px] font-bold text-white/45">{{ title }}</p>
    <div class="scrollbar-none flex-1 overflow-y-auto p-2">
      <button
        type="button"
        class="group relative mb-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-start transition-colors"
        :class="model === ALL_WEAPONS ? 'bg-mint-500/[.09]' : 'hover:bg-white/[.04]'"
        @click="model = ALL_WEAPONS"
      >
        <span
          class="absolute inset-y-2 start-0 w-[2px] rounded-full bg-mint-500 transition-opacity"
          :class="model === ALL_WEAPONS ? 'opacity-100' : 'opacity-0'"
        />
        <span class="grid h-7 w-14 shrink-0 place-items-center">
          <Icon name="lucide:layout-grid" class="size-4" :class="model === ALL_WEAPONS ? 'text-mint-400' : 'text-white/35'" />
        </span>
        <span class="flex-1 text-[13px] font-semibold" :class="model === ALL_WEAPONS ? 'text-white' : 'text-white/60 group-hover:text-white/85'">{{ allLabel }}</span>
        <span class="font-mono text-[10.5px] text-white/20">{{ total }}</span>
      </button>

      <div v-for="g in groups" :key="g.key" class="mb-2 last:mb-0">
        <p v-if="g.label" class="px-2 pt-2 pb-1.5 text-[11px] font-bold tracking-wide text-white/30">{{ g.label }}</p>
        <button
          v-for="w in g.items"
          :key="w.defindex"
          type="button"
          class="group relative flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-start transition-colors"
          :class="model === w.defindex ? 'bg-mint-500/[.09]' : 'hover:bg-white/[.04]'"
          @click="model = w.defindex"
        >
          <span
            class="absolute inset-y-2 start-0 w-[2px] rounded-full bg-mint-500 transition-opacity"
            :class="model === w.defindex ? 'opacity-100' : 'opacity-0'"
          />
          <img :src="w.image" alt="" loading="lazy" class="h-7 w-14 shrink-0 object-contain opacity-90">
          <span class="ltr flex-1 truncate text-start text-[13px] font-semibold" :class="model === w.defindex ? 'text-white' : 'text-white/60 group-hover:text-white/85'">{{ w.label }}</span>
          <span v-if="configured.has(w.defindex)" class="size-1.5 shrink-0 rounded-full bg-mint-500" title="اسکین انتخاب شده" />
          <span v-else class="font-mono text-[10.5px] text-white/20">{{ w.skinCount }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>
