<script setup lang="ts">
import type { CategoryKey } from '~/types/skins'
import { CATEGORIES } from '~/data/weapons'

/** Inset tabs: a dark track; the active tab is a raised card with an accent tick on top. */
const model = defineModel<CategoryKey>({ required: true })
</script>

<template>
  <div class="sticky top-16 z-30 border-b border-white/6 bg-ink-950/90 backdrop-blur-md">
    <div class="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 lg:px-10 lg:py-3.5">
      <div class="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div class="flex w-max gap-1 rounded-2xl bg-black/35 p-[5px]" role="tablist" aria-label="Categories">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.key"
            type="button"
            role="tab"
            :aria-selected="model === cat.key"
            class="relative flex h-[42px] shrink-0 items-center gap-[9px] overflow-hidden rounded-lg px-4 text-[13.5px] font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-300 ease-out-quint"
            :class="model === cat.key
              ? 'bg-ink-750 text-white shadow-[0_1px_0_rgb(255_255_255/.06)_inset,0_8px_20px_-10px_rgb(0_0_0/.8)]'
              : 'text-white/45 hover:bg-white/[.04] hover:text-white/70'"
            @click="model = cat.key"
          >
            <span
              class="absolute inset-x-0 top-0 h-[2px] bg-mint-500 transition-opacity duration-300"
              :class="model === cat.key ? 'opacity-100' : 'opacity-0'"
            />
            <Icon
              :name="cat.icon"
              class="size-4 transition-colors duration-300"
              :class="model === cat.key ? 'text-mint-500' : 'text-white/28'"
            />
            {{ cat.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
