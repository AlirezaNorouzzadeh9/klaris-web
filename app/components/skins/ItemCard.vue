<script setup lang="ts">
import type { TeamId } from '~/types/skins'
import { WEAR_TIERS, wearTierOf } from '~/data/weapons'

/**
 * Item card: render on a tinted spotlight with the name and a big float
 * number over its lower edge, a five-step wear gauge, then the action row
 * (StatTrak toggle for weapons and knives, then select / settings or the
 * T / CT buttons). Equipped cards get an accent edge; StatTrak adds a corner
 * ribbon. Inspect sits top-left, the sides top-right.
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
  /** Float of the equipped finish; fills the wear gauge when set. */
  wear?: number
  /** StatTrak™ kill count of the equipped copy; undefined = no StatTrak. */
  stattrak?: number
  /** Show the ST toggle in the action row (weapons and knives). */
  stattrakToggle?: boolean
  /** Shown dimmed when `image` is missing upstream (some new finishes have no render). */
  fallback?: string
  interactive?: boolean
  /** Show the inspect (pseudo-3D) button in the tile corner. */
  inspectable?: boolean
  /** Stage height class: skins 146px, agents 186px, music / pins 138px. */
  stageClass?: string
}>(), {
  inspectable: true,
  kicker: '',
  code: '',
  activeTeams: () => [],
  glow: '',
  wear: undefined,
  stattrak: undefined,
  stattrakToggle: false,
  fallback: '',
  interactive: true,
  stageClass: 'h-[146px]',
})

const emit = defineEmits<{ select: []; stattrak: [] }>()

const active = computed(() => props.activeTeams.length > 0)
const hasStattrak = computed(() => active.value && props.stattrak !== undefined)
const tier = computed(() => (props.wear === undefined || !active.value ? null : wearTierOf(props.wear)))
const tierIndex = computed(() => (tier.value ? WEAR_TIERS.findIndex(t => t.key === tier.value!.key) : -1))
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
    class="group relative flex flex-col overflow-hidden rounded-xl border bg-ink-850 transition-[border-color,transform,box-shadow] duration-300 ease-out-quint"
    :class="[
      active
        ? 'border-[color-mix(in_oklab,var(--accent)_45%,transparent)] shadow-[0_14px_34px_-20px_var(--accent)]'
        : 'border-white/7 hover:border-[color-mix(in_oklab,var(--accent)_35%,transparent)] hover:shadow-lift',
      interactive && 'hover:-translate-y-0.5',
    ]"
    :style="{ '--accent': accent }"
  >
    <!-- accent edge for equipped items -->
    <span v-if="active" class="absolute inset-y-0 left-0 z-[5] w-[3px] bg-[var(--accent)]" />

    <!-- StatTrak corner ribbon -->
    <span v-if="hasStattrak" class="pointer-events-none absolute top-0 right-0 z-[5] size-16 overflow-hidden">
      <span class="absolute top-[11px] -right-5 w-24 rotate-45 bg-[#f5902d] py-0.5 text-center font-mono text-[9px] font-bold tracking-[.14em] text-[#1a0f02]">ST™</span>
    </span>

    <!-- stage -->
    <button
      type="button"
      class="relative isolate block w-full overflow-hidden bg-[radial-gradient(90%_85%_at_50%_40%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_70%)] outline-none"
      :class="[stageClass, interactive ? 'cursor-pointer' : 'cursor-default']"
      :tabindex="interactive ? 0 : -1"
      :aria-label="title"
      @click="select"
    >
      <span
        class="absolute left-1/2 top-[44%] -z-10 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[30px]"
        :style="{ background: glow || `color-mix(in oklab, var(--accent) ${active ? 26 : 12}%, transparent)` }"
      />
      <span v-if="!loaded && !failed && image" class="skeleton absolute inset-x-6 top-4 bottom-12 rounded-lg" />
      <img
        v-if="image && !failed"
        ref="img"
        :src="image"
        :alt="title"
        loading="lazy"
        decoding="async"
        class="relative mx-auto block h-[86%] w-[92%] object-contain pt-1.5 drop-shadow-[0_12px_14px_rgb(0_0_0/.65)] transition-[transform,opacity] duration-500 ease-out-quint"
        :class="[loaded ? 'opacity-100' : 'opacity-0', interactive && 'group-hover:scale-[1.05]']"
        @load="loaded = true"
        @error="failed = true"
      >
      <span v-else-if="fallback" class="relative grid h-[86%] place-items-center">
        <img :src="fallback" alt="" class="h-full w-[86%] object-contain py-2.5 opacity-25 grayscale">
        <span class="absolute top-2 rounded-full bg-ink-950/80 px-2 py-0.5 text-[10px] text-white/45">No image</span>
      </span>
      <span v-else class="grid h-[86%] place-items-center text-white/15">
        <Icon name="lucide:image-off" class="size-6" />
      </span>

      <!-- name + float over the stage's lower edge -->
      <span class="ltr absolute inset-x-0 bottom-0 flex items-end gap-2 bg-gradient-to-t from-ink-850 from-5% via-ink-850/55 to-transparent px-3 pt-[26px] pb-2 text-left">
        <span class="min-w-0 flex-1">
          <span class="block truncate font-mono text-[9.5px] font-bold tracking-[.18em] text-[color-mix(in_oklab,var(--accent)_55%,white_30%)] uppercase">
            {{ kicker }}<template v-if="kicker && code"> · </template>{{ code }}
          </span>
          <span class="block truncate text-[14.5px] font-bold text-white" :title="title">{{ title }}</span>
        </span>
        <span
          class="shrink-0 font-mono text-[17px] leading-none font-bold"
          :style="{ color: tier ? tier.color : 'rgb(255 255 255 / .25)' }"
        >{{ tier ? wear!.toFixed(3) : '—' }}</span>
      </span>
    </button>

    <!-- sides -->
    <span
      v-if="active"
      class="ltr pointer-events-none absolute top-2 z-[6] flex gap-[3px]"
      :class="hasStattrak ? 'right-14' : 'right-2'"
    >
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
      aria-label="Inspect"
      title="Inspect"
      @click="openInspect"
    >
      <Icon name="lucide:scan-eye" class="size-3.5" />
    </button>

    <!-- wear gauge + actions -->
    <div class="ltr flex flex-1 flex-col gap-[9px] px-[11px] pt-2.5 pb-[11px]">
      <span class="flex gap-[3px]" :title="tier ? `${tier.label} · ${wear!.toFixed(4)}` : undefined">
        <span
          v-for="(t, i) in WEAR_TIERS"
          :key="t.key"
          class="h-[5px] flex-1 rounded-[2px]"
          :style="{ background: tier && i <= tierIndex ? tier.color : 'rgb(255 255 255 / .06)' }"
        />
      </span>
      <span class="mt-auto flex items-center gap-[7px]">
        <button
          v-if="stattrakToggle"
          type="button"
          class="h-7 shrink-0 rounded-[7px] border px-[9px] font-mono text-[9.5px] font-bold transition-all duration-200"
          :class="hasStattrak
            ? 'border-[#f5902d]/55 bg-[#f5902d]/16 text-[#f5902d]'
            : 'border-white/10 text-white/35 hover:border-[#f5902d]/40 hover:text-[#f5902d]'"
          :aria-pressed="hasStattrak"
          :title="hasStattrak ? 'StatTrak™ on' : 'Turn on StatTrak™'"
          @click="emit('stattrak')"
        >ST</button>
        <span v-if="$slots.default" class="min-w-0 flex-1">
          <slot />
        </span>
      </span>
    </div>
  </article>
</template>
