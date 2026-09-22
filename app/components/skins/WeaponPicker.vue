<script setup lang="ts">
import type { WeaponEntry } from '~/composables/useCatalog'
import { ALL_WEAPONS, groupWeapons } from '~/data/weapons'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Phone / tablet weapon selector: "All" plus one dropdown per weapon class
 * (rifle, pistol, shotgun, SMG…). The class holding the selected weapon is
 * highlighted and shows that weapon's name instead of the class label.
 */
const props = defineProps<{
  weapons: WeaponEntry[]
  configured: Set<number>
  grouped?: boolean
  title: string
  allLabel: string
}>()
const model = defineModel<number>({ required: true })

const groups = computed(() => groupWeapons(props.weapons, props.grouped).map(g => ({
  ...g,
  label: g.label || props.title,
  active: g.items.find(w => w.defindex === model.value),
  // Class icon: a real render of the class's most popular weapon.
  icon: g.items[0]?.image ?? '',
  hasConfigured: g.items.some(w => props.configured.has(w.defindex)),
})))
</script>

<template>
  <!-- one scrollable row: seven buttons wrapped into three rows ate a third of a phone screen -->
  <div class="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
    <button
      type="button"
      class="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border px-3.5 text-[13px] font-bold transition-colors"
      :class="model === ALL_WEAPONS
        ? 'border-mint-500/55 bg-mint-500/10 text-mint-300'
        : 'border-white/10 bg-ink-900/80 text-white/60 active:bg-white/5'"
      @click="model = ALL_WEAPONS"
    >
      <Icon name="lucide:layout-grid" class="size-4" />
      {{ allLabel }}
    </button>

    <DropdownMenu v-for="g in groups" :key="g.key" dir="ltr">
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          class="relative inline-flex h-10 shrink-0 items-center gap-2 rounded-md border ps-2 pe-2.5 text-[13px] font-bold transition-colors data-[state=open]:border-white/25"
          :class="g.active
            ? 'border-mint-500/55 bg-mint-500/10 text-mint-300'
            : 'border-white/10 bg-ink-900/80 text-white/70 active:bg-white/5'"
        >
          <img :src="g.active?.image ?? g.icon" alt="" class="h-5 w-10 object-contain" :class="!g.active && 'opacity-70'">
          <span :class="g.active && 'ltr'">{{ g.active?.label ?? g.label }}</span>
          <Icon name="lucide:chevron-down" class="size-3.5 opacity-60" />
          <span v-if="g.hasConfigured" class="absolute -top-1 -end-1 size-2 rounded-full border-2 border-ink-950 bg-mint-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        :side-offset="6"
        class="w-60 max-h-[min(22rem,var(--reka-dropdown-menu-content-available-height))] border-white/10 bg-ink-850 p-1.5 shadow-lift"
      >
        <DropdownMenuItem
          v-for="w in g.items"
          :key="w.defindex"
          class="ltr gap-3 rounded-sm px-2 py-2 focus:bg-white/[.06]"
          :class="model === w.defindex && 'bg-mint-500/10'"
          @select="model = w.defindex"
        >
          <img :src="w.image" alt="" loading="lazy" class="h-7 w-14 object-contain">
          <span class="flex-1 truncate text-[13.5px] font-semibold" :class="model === w.defindex ? 'text-mint-300' : 'text-white/85'">{{ w.label }}</span>
          <span v-if="configured.has(w.defindex)" class="size-1.5 rounded-full bg-mint-500" />
          <Icon v-if="model === w.defindex" name="lucide:check" class="size-4 text-mint-400" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
