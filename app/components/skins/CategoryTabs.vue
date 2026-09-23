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
      <div dir="ltr" class="scrollbar-none -mx-4 overflow-x-auto px-4 py-3 sm:mx-0 sm:px-0">
        <div class="mx-auto flex w-max items-center gap-2" role="tablist" aria-label="Categories">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.key"
            type="button"
            role="tab"
            :aria-selected="model === cat.key"
            class="flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors duration-250 sm:h-10 sm:px-4 sm:text-[13px]"
            :class="model === cat.key
              ? 'border-brand-500 bg-brand-500 text-ink-950 shadow-[0_10px_24px_-14px_var(--color-brand-500)]'
              : 'border-white/8 bg-white/[.02] text-white/60 hover:border-white/20 hover:text-white'"
            @click="model = cat.key"
          >
            <Icon
              :name="cat.icon"
              class="size-3.5 sm:size-4"
              :class="model === cat.key ? 'text-ink-950' : 'text-white/35'"
            />
            {{ cat.label }}
            <span
              v-if="counts[cat.key] !== undefined"
              class="font-mono text-[10px] font-bold"
              :class="model === cat.key ? 'text-ink-950/55' : 'text-white/25'"
            >{{ counts[cat.key] }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
