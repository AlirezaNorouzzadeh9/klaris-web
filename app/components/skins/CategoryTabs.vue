<script setup lang="ts">
import type { CategoryKey } from '~/types/skins'
import { CATEGORIES } from '~/data/weapons'

/**
 * Flat tabs split by hairlines, each with its item count; the active one turns
 * white with a mint tick along the bar's bottom edge. Laid out from the left.
 */
const model = defineModel<CategoryKey>({ required: true })

// Counts come from the same (cached) catalog files the views load.
const { load } = useCatalog()
const counts = ref<Partial<Record<CategoryKey, number>>>({})

onMounted(async () => {
  try {
    const [skins, gloves, agents, music, pins] = await Promise.all([
      load('skins'), load('gloves'), load('agents'), load('music'), load('collectibles'),
    ])
    const finishes = skins.filter(s => String(s.paint) !== '0')
    counts.value = {
      skins: finishes.filter(s => s.weapon_defindex < 500).length,
      knives: finishes.filter(s => s.weapon_defindex >= 500).length,
      gloves: gloves.filter(g => g.weapon_defindex).length,
      agents: agents.filter(a => a.model && a.model !== 'null').length,
      music: music.length,
      pins: pins.length,
    }
  } catch {
    // counts are decoration; the tabs work without them
  }
})
</script>

<template>
  <div class="sticky top-16 z-30 border-b border-white/6 bg-ink-950/90 backdrop-blur-md">
    <div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div dir="ltr" class="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div class="flex w-max items-stretch" role="tablist" aria-label="Categories">
          <button
            v-for="(cat, i) in CATEGORIES"
            :key="cat.key"
            type="button"
            role="tab"
            :aria-selected="model === cat.key"
            class="relative flex h-12 shrink-0 items-center gap-2 px-3.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors duration-250 sm:h-[58px] sm:gap-[9px] sm:px-5 sm:text-[13.5px]"
            :class="[
              i > 0 && 'border-l border-white/6',
              model === cat.key ? 'text-white' : 'text-white/45 hover:text-white/75',
            ]"
            @click="model = cat.key"
          >
            <Icon
              :name="cat.icon"
              class="size-3.5 transition-colors duration-250 sm:size-4"
              :class="model === cat.key ? 'text-mint-500' : 'text-white/28'"
            />
            {{ cat.label }}
            <span
              v-if="counts[cat.key] !== undefined"
              class="font-mono text-[10px] font-bold"
              :class="model === cat.key ? 'text-white/40' : 'text-white/20'"
            >{{ counts[cat.key] }}</span>
            <span
              class="absolute inset-x-0 bottom-0 h-0.5 origin-center bg-mint-500 transition-[opacity,scale] duration-250"
              :class="model === cat.key ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
