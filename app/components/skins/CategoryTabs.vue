<script setup lang="ts">
import type { CategoryKey } from '~/types/skins'
import { CATEGORIES } from '~/data/weapons'

/**
 * Flat tabs split by hairlines, each with its item count; the active one turns
 * the active pill is filled with the brand colour. Laid out from the left.
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
  <div class="sticky top-14 z-30 border-b border-white/6 bg-ink-950/90 backdrop-blur-md">
    <div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div dir="ltr" class="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div class="flex w-max items-stretch" role="tablist" aria-label="Categories">
          <button
            v-for="(cat, i) in CATEGORIES"
            :key="cat.key"
            type="button"
            role="tab"
            :aria-selected="model === cat.key"
            class="relative flex h-12 shrink-0 items-center gap-2 px-3.5 text-[12.5px] whitespace-nowrap transition-colors duration-250 sm:h-14 sm:gap-2.5 sm:px-5 sm:text-[13.5px]"
            :class="[
              i > 0 && 'border-l border-white/6',
              model === cat.key
                ? (cat.key === 'exclusive' ? 'font-bold text-gold-k' : 'font-bold text-white')
                : (cat.key === 'exclusive' ? 'font-semibold text-gold-k/60 hover:text-gold-k/90' : 'font-semibold text-white/45 hover:text-white/75'),
            ]"
            @click="model = cat.key"
          >
            <span
              v-if="counts[cat.key] !== undefined"
              class="font-mono text-[10px] font-bold"
              :class="model === cat.key ? 'text-white/40' : 'text-white/20'"
            >{{ counts[cat.key] }}</span>
            {{ cat.label }}
            <Icon
              :name="cat.icon"
              class="size-3.5 sm:size-4"
              :class="model === cat.key ? (cat.key === 'exclusive' ? 'text-gold-k' : 'text-brand-500') : 'text-white/25'"
            />
            <!-- the active tab is marked by the bar on the bottom edge -->
            <span
              class="absolute inset-x-0 bottom-0 h-0.5 origin-center transition-[opacity,scale] duration-250"
              :class="[
                cat.key === 'exclusive' ? 'bg-gold-k' : 'bg-brand-500',
                model === cat.key ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
              ]"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
