<script setup lang="ts">
import type { WeaponEntry } from '~/composables/useCatalog'
import { ALL_WEAPONS, groupWeapons } from '~/data/weapons'
import type { WeaponClass } from '~/types/skins'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Phone / tablet weapon selector: a row of pills with weapon silhouettes —
 * "All", Rifles, Snipers, Pistols and one "Mid-Tier" menu that holds SMGs,
 * shotguns and machine guns as labelled sections. The pill holding the
 * selection turns mint.
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

/** Weapon whose render, flattened to a white silhouette, marks each menu. */
const ICON_WEAPON: Record<string, number> = { 'rifle': 7, 'sniper': 9, 'pistol': 1, 'mid-tier': 19 } // AK-47, AWP, Desert Eagle, P90

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
      icon: (all.find(w => w.defindex === ICON_WEAPON[e.key]) ?? all[0])?.image,
      active: all.some(w => w.defindex === model.value),
      hasConfigured: all.some(w => props.configured.has(w.defindex)),
    }
  })
})
</script>

<template>
  <nav class="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Weapon classes">
    <!-- centred when it fits; scrolls from the start when it does not -->
    <div class="mx-auto flex w-max items-center gap-1 rounded-xl border border-white/7 bg-ink-900/70 p-1">
    <button
      type="button"
      class="ltr relative flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[12.5px] font-semibold transition-colors"
      :class="model === ALL_WEAPONS ? 'border-mint-500/50 bg-mint-500/10 text-mint-300' : 'border-white/8 bg-white/[.03] text-white/85 active:bg-white/[.07]'"
      @click="model = ALL_WEAPONS"
    >
      <Icon name="lucide:person-standing" class="size-4 opacity-80" />
      {{ allLabel }}
    </button>

    <DropdownMenu v-for="e in entries" :key="e.key" dir="rtl">
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          class="ltr group relative flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[12.5px] font-semibold transition-colors"
          :class="e.active
            ? 'border-mint-500/50 bg-mint-500/10 text-mint-300'
            : 'border-white/8 bg-white/[.03] text-white/85 active:bg-white/[.07] data-[state=open]:border-white/20 data-[state=open]:bg-white/[.07]'"
        >
          <img v-if="e.icon" :src="e.icon" alt="" class="h-4 w-8 object-contain brightness-0 invert" :class="e.active ? 'opacity-90' : 'opacity-75'">
          {{ e.label }}
          <svg viewBox="0 0 10 6" class="w-2 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true"><path d="M0 0h10L5 6z" fill="currentColor" /></svg>
          <span v-if="e.hasConfigured && !e.active" class="absolute -top-0.5 -end-0.5 size-2 rounded-full border-2 border-ink-900 bg-mint-500" />
        </button>
      </DropdownMenuTrigger>

      <!-- the weapon list reads left-to-right (reka sets dir from the root, hence the CSS); the nav row stays RTL -->
      <DropdownMenuContent
        align="start"
        :side-offset="6"
        class="[direction:ltr] w-[min(14rem,calc(100vw-2rem))] max-h-[min(24rem,var(--reka-dropdown-menu-content-available-height))] rounded-lg border-white/8 bg-ink-700 p-1 shadow-lift"
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
    </div>
  </nav>
</template>
