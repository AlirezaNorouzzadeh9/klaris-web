<script setup lang="ts">
import type { TeamId } from '~/types/skins'
import { wearTierOf } from '~/data/weapons'

/**
 * Minimal item card: render on a tinted spotlight, centred name with the
 * weapon and float under it, then the action. An equipped card is filled with
 * its accent colour and carries an EQUIPPED badge; StatTrak (set in the
 * skin settings) turns that accent orange.
 * Inspect sits top-left, the sides top-right.
 */
const props = withDefaults(defineProps<{
  image: string
  title: string
  /** Small mono line above the title: weapon, kit, faction or item type. */
  kicker?: string
  /** Paint id, shown after the kicker (e.g. "#1449"). */
  code?: string
  /** Sides this item is equipped on; empty = not equipped. */
  activeTeams?: TeamId[]
  /** Glow behind the render; defaults to the card accent. */
  glow?: string
  /** Float of the equipped finish; shown big over the stage when set. */
  wear?: number
  /** StatTrak™ kill count of the equipped copy; undefined = no StatTrak. */
  stattrak?: number
  /** Shown dimmed when `image` is missing upstream (some new finishes have no render). */
  fallback?: string
  interactive?: boolean
  /** Show the inspect (pseudo-3D) button in the tile corner. */
  inspectable?: boolean
  /** Stage height class: skins 146px, agents 186px, music / pins 138px. */
  stageClass?: string
  /** Fill the stage instead of fitting inside it (screenshots, not renders). */
  cover?: boolean
  /** Lines the title may wrap to (music kits and pins have long names). */
  titleLines?: 1 | 2
}>(), {
  inspectable: true,
  kicker: '',
  code: '',
  activeTeams: () => [],
  glow: '',
  wear: undefined,
  stattrak: undefined,
  fallback: '',
  interactive: true,
  stageClass: 'h-[146px]',
  cover: false,
  titleLines: 1,
})

const emit = defineEmits<{ select: [] }>()

/** The accent at a given opacity, e.g. mix(45) -> 45% accent over whatever is behind. */
function mix(pct: number) {
  const hex = accent.value
  const [r, g, b] = [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16))
  return `rgb(${r} ${g} ${b} / ${pct / 100})`
}

/** An equipped card is filled with its accent colour. */
const activeStyle = computed(() => (active.value
  ? { borderColor: mix(35), background: `linear-gradient(180deg, ${mix(18)}, ${mix(4)})` }
  : {}))

const active = computed(() => props.activeTeams.length > 0)
const hasStattrak = computed(() => active.value && props.stattrak !== undefined)
const tier = computed(() => (props.wear === undefined || !active.value ? null : wearTierOf(props.wear)))
const titleClass = computed(() => (props.titleLines === 2 ? 'line-clamp-2' : 'truncate'))
const floatText = computed(() => (tier.value ? props.wear!.toFixed(3) : '—'))
const canInspect = computed(() => props.inspectable && !!(props.image || props.fallback))

/** Card tint: StatTrak orange, equipped mint, otherwise a cool steel blue. */
const accent = computed(() => (hasStattrak.value ? '#f5902d' : active.value ? '#2ee89c' : '#62aeea'))

const { inspect } = useInspect()
function openInspect() {
  inspect({ image: props.image, fallback: props.fallback, title: props.title, kicker: props.kicker, wear: active.value ? props.wear : undefined })
}

function select() {
  if (props.interactive) emit('select')
}

const failed = ref(false)
const loaded = ref(false)
const img = ref<HTMLImageElement>()

// An image that finished before hydration never fires @load, so read its
// state directly once mounted (and whenever the source changes).
function syncImageState() {
  const el = img.value
  if (!el?.complete) return
  if (el.naturalWidth > 0) loaded.value = true
  else failed.value = true
}
onMounted(syncImageState)
watch(() => props.image, () => {
  loaded.value = false
  failed.value = false
  nextTick(syncImageState)
})
</script>

<template>
  <article
    class="group relative flex flex-col overflow-hidden rounded-xl border transition-[border-color,transform,box-shadow,background-color] duration-300 ease-out-quint"
    :class="[
      // a Glow, b Badge, c Bar, d Filled — the look of an equipped card
      !active && 'border-transparent bg-white/[.015] hover:border-white/10 hover:bg-white/[.03]',
      interactive && 'hover:-translate-y-0.5',
    ]"
    :style="{ '--accent': accent, ...activeStyle }"
  >
    <!-- stage -->
    <button
      type="button"
      class="relative isolate block w-full shrink-0 overflow-hidden outline-none"
      :class="[stageClass, interactive ? 'cursor-pointer' : 'cursor-default']"
      :style="{ background: `radial-gradient(90% 85% at 50% 40%, ${mix(active ? 26 : 12)}, transparent 70%)` }"
      :tabindex="interactive ? 0 : -1"
      :aria-label="title"
      @click="select"
    >
      <span
        class="absolute left-1/2 top-[46%] -z-10 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[30px]"
        :style="{ background: glow || `color-mix(in oklab, var(--accent) ${active ? 26 : 12}%, transparent)` }"
      />
      <span v-if="!loaded && !failed && image" class="skeleton absolute inset-x-6 inset-y-5 rounded-lg" />
      <img
        v-if="image && !failed"
        ref="img"
        :src="image"
        :alt="title"
        loading="lazy"
        decoding="async"
        class="relative mx-auto block transition-[transform,opacity] duration-500 ease-out-quint"
        :class="[
          loaded ? 'opacity-100' : 'opacity-0',
          interactive && 'group-hover:scale-[1.05]',
          cover ? 'size-full object-cover' : 'h-full w-[88%] object-contain py-3 drop-shadow-[0_12px_14px_rgb(0_0_0/.65)]',
        ]"
        @load="loaded = true"
        @error="failed = true"
      >
      <span v-else-if="fallback" class="relative grid h-full place-items-center">
        <img :src="fallback" alt="" class="h-full w-[86%] object-contain py-2.5 opacity-25 grayscale">
        <span class="absolute top-2 rounded-full bg-ink-950/80 px-2 py-0.5 text-[10px] text-white/45">No image</span>
      </span>
      <span v-else class="grid h-full place-items-center text-white/15">
        <Icon name="lucide:image-off" class="size-6" />
      </span>

      <!-- equipped badge in the corner -->
      <span
        v-if="active"
        class="ltr absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold"
        :style="{ background: accent, color: '#07090c' }"
      >
        <Icon name="lucide:check" class="size-2.5" /> EQUIPPED
      </span>
    </button>

    <!-- sides (+ StatTrak) -->
    <span v-if="active" class="ltr pointer-events-none absolute top-2 right-2 z-[6] flex gap-[3px]">
      <span
        v-if="hasStattrak"
        class="rounded-full border border-[#f5902d]/40 bg-ink-950/60 px-1.5 py-px font-mono text-[9px] font-bold text-[#f5902d] backdrop-blur-sm"
      >ST™</span>
      <span
        v-for="t in activeTeams"
        :key="t"
        class="rounded-full border bg-ink-950/60 px-1.5 py-px font-mono text-[9px] font-bold backdrop-blur-sm"
        :class="t === 2 ? 'border-side-t/30 text-side-t' : 'border-side-ct/30 text-side-ct'"
      >{{ t === 2 ? 'T' : 'CT' }}</span>
    </span>

    <!-- inspect: top-left; always shown on touch screens -->
    <button
      v-if="canInspect"
      type="button"
      class="absolute top-2 left-2.5 z-[6] grid size-7 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-white/60 opacity-0 backdrop-blur-sm transition-[opacity,color,border-color] duration-200 group-hover:opacity-100 hover:border-mint-500/50 hover:text-mint-300 focus-visible:opacity-100 pointer-coarse:opacity-100"
      :class="active && 'top-9'"
      aria-label="Inspect"
      title="Inspect"
      @click="openInspect"
    >
      <Icon name="lucide:scan-eye" class="size-3.5" />
    </button>

    <!-- labels -->
    <button type="button" class="ltr flex flex-col items-center px-3 pt-1 text-center outline-none" :class="interactive ? 'cursor-pointer' : 'cursor-default'" tabindex="-1" @click="select">
      <span
        class="max-w-full text-[14px] font-bold"
        :class="titleClass"
        :title="title"
      >{{ title }}</span>
      <span class="mt-1 flex max-w-full items-center gap-1.5 font-mono text-[10.5px] font-bold">
        <span class="truncate text-white/40">{{ kicker }}</span>
        <template v-if="tier">
          <span class="size-1 rounded-full bg-white/20" />
          <span :style="{ color: tier.color }">{{ tier.short }} {{ floatText }}</span>
        </template>
        <template v-else-if="code">
          <span class="size-1 rounded-full bg-white/20" />
          <span class="text-white/25">{{ code }}</span>
        </template>
      </span>
    </button>

    <!-- action -->
    <div v-if="$slots.default" class="ltr mt-auto px-3 pt-2.5 pb-3">
      <slot />
    </div>
  </article>
</template>
