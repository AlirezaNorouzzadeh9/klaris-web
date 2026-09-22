<script setup lang="ts">
import type { WeaponEntry } from '~/composables/useCatalog'
import { ALL_WEAPONS, groupWeapons } from '~/data/weapons'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Phone / tablet weapon selector: a text nav — "All" plus one dropdown per
 * weapon class (Rifles, Pistols, Shotguns…) — each opening a roomy list of
 * weapon renders and names. The class holding the selection turns mint.
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

const groups = computed(() => groupWeapons(props.weapons, props.grouped).map(g => ({
  ...g,
  label: g.label || props.title,
  active: g.items.some(w => w.defindex === model.value),
  hasConfigured: g.items.some(w => props.configured.has(w.defindex)),
})))
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

    <DropdownMenu v-for="g in groups" :key="g.key" dir="ltr">
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          class="group relative flex h-10 shrink-0 items-center gap-1 rounded-md px-2.5 text-[15px] font-semibold transition-colors data-[state=open]:bg-white/[.06]"
          :class="g.active ? 'text-mint-400' : 'text-white/80 active:bg-white/5'"
        >
          {{ g.label }}
          <Icon name="lucide:chevron-down" class="size-4 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          <span v-if="g.active" class="absolute inset-x-2.5 bottom-1 h-0.5 rounded-full bg-mint-500" />
          <span v-else-if="g.hasConfigured" class="absolute top-2 end-1 size-1.5 rounded-full bg-mint-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        :side-offset="6"
        class="w-[min(18rem,calc(100vw-2rem))] max-h-[min(26rem,var(--reka-dropdown-menu-content-available-height))] rounded-lg border-white/8 bg-ink-700 p-1.5 shadow-lift"
      >
        <DropdownMenuItem
          v-for="w in g.items"
          :key="w.defindex"
          class="gap-3.5 rounded-md px-3 py-2.5 focus:bg-white/[.07]"
          :class="model === w.defindex && 'bg-mint-500/12'"
          @select="model = w.defindex"
        >
          <img :src="w.image" alt="" loading="lazy" class="h-7 w-11 shrink-0 object-contain">
          <span class="flex-1 truncate text-[15px]" :class="model === w.defindex ? 'font-semibold text-mint-300' : 'text-white/90'">{{ w.label }}</span>
          <span v-if="configured.has(w.defindex)" class="size-1.5 shrink-0 rounded-full bg-mint-500" title="Skin equipped" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </nav>
</template>
