<script setup lang="ts">
import type { TeamId } from '~/types/skins'
import type { WeaponEntry } from '~/composables/useCatalog'
import { matchesQuery } from '~/composables/useCatalog'
import { ALL_WEAPONS, groupWeapons } from '~/data/weapons'

/** Desktop side panel. Phones and tablets use WeaponPicker instead. */
const props = defineProps<{
  weapons: WeaponEntry[]
  /** defindexes that have a saved skin (or the equipped knife). */
  configured: Set<number>
  /** Sides each weapon is equipped on, for the T / CT chips. */
  sides?: (defindex: number) => TeamId[]
  grouped?: boolean
  allLabel: string
  total: number
}>()
const model = defineModel<number>({ required: true })

/** Falls back to "equipped, side unknown" when the view does not pass sides. */
const sidesOf = (defindex: number): TeamId[] =>
  props.sides ? props.sides(defindex) : (props.configured.has(defindex) ? [2, 3] : [])

const railFilter = ref('')
const groups = computed(() =>
  groupWeapons(props.weapons.filter(w => matchesQuery(w.label, railFilter.value)), props.grouped)
    .filter(g => g.items.length))
</script>

<template>
  <!-- sticky offset = header (64) + tab bar (81) + breathing room -->
  <aside class="sticky top-[150px] flex max-h-[min(760px,calc(100dvh-166px))] flex-col overflow-hidden rounded-xl border border-white/7 bg-ink-900/70">
    <div class="border-b border-white/6 p-2.5">
      <div class="group relative" dir="rtl">
        <Icon name="lucide:search" class="pointer-events-none absolute top-1/2 start-2.5 size-[15px] -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-brand-500" />
        <input
          v-model="railFilter"
          type="search"
          placeholder="فیلتر اسلحه‌ها…"
          aria-label="Filter weapons"
          class="h-[34px] w-full rounded-full border border-white/9 bg-ink-950/60 ps-8 pe-3 text-[12.5px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand-500/45 [&::-webkit-search-cancel-button]:appearance-none"
          @keydown.esc="railFilter = ''"
        >
      </div>
    </div>

    <div class="scrollbar-none flex-1 overflow-y-auto p-2">
      <button
        v-if="!railFilter"
        type="button"
        class="group relative mb-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-start transition-colors"
        :class="model === ALL_WEAPONS ? 'bg-brand-500/[.09]' : 'hover:bg-white/[.04]'"
        @click="model = ALL_WEAPONS"
      >
        <span
          class="absolute inset-y-2 start-0 w-[2px] rounded-full bg-brand-500 transition-opacity"
          :class="model === ALL_WEAPONS ? 'opacity-100' : 'opacity-0'"
        />
        <span class="grid h-[26px] w-[52px] shrink-0 place-items-center">
          <Icon name="lucide:layout-grid" class="size-4" :class="model === ALL_WEAPONS ? 'text-brand-400' : 'text-white/35'" />
        </span>
        <span class="flex-1 text-[12.5px] font-semibold" :class="model === ALL_WEAPONS ? 'text-white' : 'text-white/60 group-hover:text-white/85'">{{ allLabel }}</span>
        <span class="font-mono text-[10px] text-white/20">{{ total }}</span>
      </button>

      <p v-if="!groups.length" class="px-2 py-6 text-center text-[12px] text-white/35">No weapon found</p>

      <div v-for="g in groups" :key="g.key" class="mb-2.5 last:mb-0">
        <p v-if="g.label" class="flex items-center gap-2 px-2 pt-2 pb-1.5 text-[11px] font-bold text-white/30">
          {{ g.label }}
          <span class="h-px flex-1 bg-white/6" />
        </p>
        <button
          v-for="w in g.items"
          :key="w.defindex"
          type="button"
          class="group relative flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-start transition-colors"
          :class="model === w.defindex ? 'bg-brand-500/[.09]' : 'hover:bg-white/[.04]'"
          @click="model = w.defindex"
        >
          <span
            class="absolute inset-y-2 start-0 w-[2px] rounded-full bg-brand-500 transition-opacity"
            :class="model === w.defindex ? 'opacity-100' : 'opacity-0'"
          />
          <img :src="w.image" alt="" loading="lazy" class="h-[26px] w-[52px] shrink-0 object-contain opacity-95">
          <span class="ltr flex-1 truncate text-right text-[12.5px] font-semibold" :class="model === w.defindex ? 'text-white' : 'text-white/60 group-hover:text-white/85'">{{ w.label }}</span>
          <!-- which sides wear this weapon, so two knives never look like one -->
          <span v-if="sidesOf(w.defindex).length" class="ltr flex shrink-0 gap-[3px]">
            <span
              v-for="t in sidesOf(w.defindex)"
              :key="t"
              class="rounded-full px-1 py-px font-mono text-[8.5px] font-bold"
              :class="t === 2 ? 'bg-side-t/15 text-side-t' : 'bg-side-ct/15 text-side-ct'"
            >{{ t === 2 ? 'T' : 'CT' }}</span>
          </span>
        </button>
      </div>
    </div>
  </aside>
</template>
