<script setup lang="ts">
import type { WeaponEntry } from '~/composables/useCatalog'
import { ALL_WEAPONS, groupWeapons } from '~/data/weapons'
import type { WeaponClass } from '~/types/skins'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Phone / tablet weapon selector: a text nav — "All", Rifles, Snipers,
 * Pistols and one "Mid-Tier" menu that holds SMGs, shotguns and machine guns
 * as labelled sections. The entry holding the selection turns mint.
 */
const props = defineProps<{
  weapons: WeaponEntry[]
  configured: Set<number>
  grouped?: boolean
  /** Label for the single dropdown when the list is not grouped (knives). */
  title: string
  allLabel: string
}>()
const model = defineModel<number>({ required: true })

/** Classes folded into the single "Mid-Tier" menu, in display order. */
const MID_TIER: WeaponClass[] = ['smg', 'shotgun', 'mg']

interface Section { label: string; items: WeaponEntry[] }

const entries = computed(() => {
  const groups = groupWeapons(props.weapons, props.grouped)
  const out: { key: string; label: string; sections: Section[] }[] = []
  const mid: Section[] = []
  for (const g of groups) {
    if (MID_TIER.includes(g.key as WeaponClass)) mid.push({ label: g.label, items: g.items })
    else out.push({ key: g.key, label: g.label || props.title, sections: [{ label: '', items: g.items }] })
  }
  if (mid.length) out.push({ key: 'mid-tier', label: 'Mid-Tier', sections: mid })

  return out.map((e) => {
    const all = e.sections.flatMap(s => s.items)
    return {
      ...e,
      active: all.some(w => w.defindex === model.value),
      hasConfigured: all.some(w => props.configured.has(w.defindex)),
    }
  })
})
</script>

<template>
  <nav class="scrollbar-none -mx-4 flex items-center gap-1 overflow-x-auto px-3 sm:mx-0 sm:px-0" aria-label="Weapon classes">
    <button
      type="button"
      class="relative flex h-10 shrink-0 items-center rounded-md px-2.5 text-[15px] font-semibold transition-colors"
      :class="model === ALL_WEAPONS ? 'text-mint-400' : 'text-white/80 active:bg-white/5'"
      @click="model = ALL_WEAPONS"
    >
      {{ allLabel }}
      <span v-if="model === ALL_WEAPONS" class="absolute inset-x-2.5 bottom-1 h-0.5 rounded-full bg-mint-500" />
    </button>

    <DropdownMenu v-for="e in entries" :key="e.key" dir="ltr">
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          class="group relative flex h-10 shrink-0 items-center gap-1 rounded-md px-2.5 text-[15px] font-semibold transition-colors data-[state=open]:bg-white/[.06]"
          :class="e.active ? 'text-mint-400' : 'text-white/80 active:bg-white/5'"
        >
          {{ e.label }}
          <Icon name="lucide:chevron-down" class="size-4 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          <span v-if="e.active" class="absolute inset-x-2.5 bottom-1 h-0.5 rounded-full bg-mint-500" />
          <span v-else-if="e.hasConfigured" class="absolute top-2 end-1 size-1.5 rounded-full bg-mint-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        :side-offset="6"
        class="w-[min(14rem,calc(100vw-2rem))] max-h-[min(24rem,var(--reka-dropdown-menu-content-available-height))] rounded-lg border-white/8 bg-ink-700 p-1 shadow-lift"
      >
        <template v-for="s in e.sections" :key="s.label">
          <DropdownMenuLabel
            v-if="s.label"
            class="px-2.5 pt-2.5 pb-1 text-[10.5px] font-bold tracking-[.08em] text-white/40 uppercase"
          >{{ s.label }}</DropdownMenuLabel>
          <DropdownMenuItem
            v-for="w in s.items"
            :key="w.defindex"
            class="gap-2.5 rounded-md px-2.5 py-1.5 focus:bg-white/[.07]"
            :class="model === w.defindex && 'bg-mint-500/12'"
            @select="model = w.defindex"
          >
            <img :src="w.image" alt="" loading="lazy" class="h-5 w-9 shrink-0 object-contain">
            <span class="flex-1 truncate text-[13.5px]" :class="model === w.defindex ? 'font-semibold text-mint-300' : 'text-white/90'">{{ w.label }}</span>
            <span v-if="configured.has(w.defindex)" class="size-1.5 shrink-0 rounded-full bg-mint-500" title="Skin equipped" />
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>
  </nav>
</template>
