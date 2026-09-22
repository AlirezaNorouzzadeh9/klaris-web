<script setup lang="ts">
import type { CategoryKey } from '~/types/skins'
import { CATEGORIES } from '~/data/weapons'

defineProps<{ counts: Partial<Record<CategoryKey, number>> }>()
const model = defineModel<CategoryKey>({ required: true })
</script>

<template>
  <div class="sticky top-16 z-30 border-b border-white/6 bg-ink-950/90 backdrop-blur-md">
    <div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div class="scrollbar-none -mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="دسته‌بندی">
        <button
          v-for="cat in CATEGORIES"
          :key="cat.key"
          type="button"
          role="tab"
          :aria-selected="model === cat.key"
          class="group relative flex h-14 shrink-0 items-center gap-2.5 px-4 text-[14px] font-semibold transition-colors"
          :class="model === cat.key ? 'text-white' : 'text-white/45 hover:text-white/80'"
          @click="model = cat.key"
        >
          <Icon
            :name="cat.icon"
            class="size-[18px] transition-colors"
            :class="model === cat.key ? 'text-mint-500' : 'text-white/30 group-hover:text-white/50'"
          />
          {{ cat.label }}
          <span
            v-if="counts[cat.key]"
            class="grid h-[18px] min-w-[18px] place-items-center rounded-xs px-1 font-mono text-[10.5px] font-bold"
            :class="model === cat.key ? 'bg-mint-500 text-mint-950' : 'bg-white/8 text-white/60'"
          >{{ counts[cat.key] }}</span>
          <span
            class="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-mint-500 transition-transform duration-300 ease-out-quint"
            :class="model === cat.key ? 'scale-x-100' : 'scale-x-0'"
          />
        </button>
      </div>
    </div>
  </div>
</template>
