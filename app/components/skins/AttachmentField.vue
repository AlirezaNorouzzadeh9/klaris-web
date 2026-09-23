<script setup lang="ts">
import { Slider } from '@/components/ui/slider'

/** One sticker / charm value: label, exact number, dice for a random value, and a slider. */
const props = withDefaults(defineProps<{
  label: string
  min: number
  max: number
  step: number
  /** Digits shown in the number box. */
  decimals?: number
}>(), { decimals: 2 })
const model = defineModel<number>({ required: true })

const clamp = (v: number) => Math.min(props.max, Math.max(props.min, v))
const round = (v: number) => Number(v.toFixed(props.decimals))

const sliderModel = computed({
  get: () => [model.value],
  set: ([v]) => { model.value = round(v ?? props.min) },
})

function onInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(v)) model.value = round(clamp(v))
}

function randomize() {
  const steps = Math.round((props.max - props.min) / props.step)
  model.value = round(props.min + Math.floor(Math.random() * (steps + 1)) * props.step)
}
</script>

<template>
  <div class="min-w-0">
    <div class="mb-2 flex items-center justify-between gap-2">
      <span class="ltr truncate font-mono text-[10.5px] font-bold tracking-[.08em] text-white/40 uppercase">{{ label }}</span>
      <div class="ltr flex shrink-0 overflow-hidden rounded-sm border border-white/10 bg-ink-950/70 focus-within:border-brand-500/50">
        <input
          :value="model.toFixed(decimals)"
          type="number"
          :min="min"
          :max="max"
          :step="step"
          inputmode="decimal"
          :aria-label="label"
          class="h-7 w-[74px] bg-transparent px-2 text-right font-mono text-[12px] font-bold text-white outline-none"
          @change="onInput"
        >
        <button
          type="button"
          class="grid w-7 place-items-center border-l border-white/10 text-white/40 transition-colors hover:bg-white/5 hover:text-brand-400"
          :title="`Random ${label.toLowerCase()}`"
          @click="randomize"
        >
          <Icon name="lucide:dices" class="size-3.5" />
        </button>
      </div>
    </div>
    <!-- numeric axis: always left (min) to right (max) -->
    <Slider v-model="sliderModel" dir="ltr" :min="min" :max="max" :step="step" />
  </div>
</template>
