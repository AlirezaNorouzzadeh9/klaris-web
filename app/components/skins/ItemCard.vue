<script setup lang="ts">
import type { TeamId } from '~/types/skins'
import { wearTierOf } from '~/data/weapons'

/**
 * Item card whose background is the item: a blurred colour wash from the
 * render fills the card, the sharp render floats on top, and the labels and
 * action sit in a glass panel over it (inspect top-left, sides top-right,
 * quality strip along the bottom edge).
 */
const props = withDefaults(defineProps<{
  image: string
  title: string
  /** Small mono line above the title: paint id, kit, faction or item type. */
  kicker?: string
  /** Paint id, at the right end of the wear line (e.g. "#1449"). */
  code?: string
  /** Sides this item is equipped on; empty = not equipped. */
  activeTeams?: TeamId[]
  /** Glow behind the render; defaults to mint when equipped. */
  glow?: string
  /** Float of the equipped finish; shows the wear line when set. */
  wear?: number
  /** StatTrak™ kill count of the equipped copy; undefined = no StatTrak. */
  stattrak?: number
  /** Shown dimmed when `image` is missing upstream (some new finishes have no render). */
  fallback?: string
  interactive?: boolean
  /** Show the inspect (pseudo-3D) button in the tile corner. */
  inspectable?: boolean
  /** Tile height class: skins 128px, agents 168px, music / pins 120px. */
  stageClass?: string
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
  stageClass: 'h-32',
})

const emit = defineEmits<{ select: [] }>()

const active = computed(() => props.activeTeams.length > 0)
const hasStattrak = computed(() => active.value && props.stattrak !== undefined)
const tier = computed(() => (props.wear === undefined || !active.value ? null : wearTierOf(props.wear)))
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
    class="group relative isolate flex flex-col overflow-hidden rounded-xl border bg-ink-900 transition-[border-color,transform,box-shadow] duration-300 ease-out-quint"
    :class="[
      active
        ? 'border-[color-mix(in_oklab,var(--accent)_45%,transparent)] shadow-[0_14px_34px_-20px_var(--accent)]'
        : 'border-white/7 hover:border-[color-mix(in_oklab,var(--accent)_35%,transparent)]',
      interactive && 'hover:-translate-y-0.5 hover:shadow-lift',
    ]"
    :style="{ '--accent': accent }"
  >
    <!-- ── background: the item itself, blown up and blurred, with the sharp render on top ── -->
    <button
      type="button"
      class="absolute inset-0 -z-10 block overflow-hidden outline-none"
      :class="interactive ? 'cursor-pointer' : 'cursor-default'"
      :tabindex="interactive ? 0 : -1"
      :aria-label="title"
      @click="select"
    >
      <!-- colour wash taken from the render -->
      <img
        v-if="image && !failed"
        :src="image"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 size-full scale-[1.6] object-cover opacity-45 blur-2xl saturate-150 transition-opacity duration-500"
        :class="loaded ? '' : 'opacity-0'"
      >
      <span class="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_30%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_75%)]" />
      <span class="absolute inset-0 bg-gradient-to-b from-ink-900/10 via-ink-900/35 to-ink-900/90" />

      <span v-if="!loaded && !failed && image" class="skeleton absolute inset-x-6 top-5 h-24 rounded-lg" />
      <!-- the render hangs over the info panel below -->
      <img
        v-if="image && !failed"
        ref="img"
        :src="image"
        :alt="title"
        loading="lazy"
        decoding="async"
        class="absolute inset-x-[5%] top-[4%] h-[62%] w-[90%] object-contain drop-shadow-[0_16px_18px_rgb(0_0_0/.7)] transition-[transform,opacity] duration-500 ease-out-quint"
        :class="[loaded ? 'opacity-100' : 'opacity-0', interactive && 'group-hover:scale-[1.07] group-hover:-rotate-2']"
        @load="loaded = true"
        @error="failed = true"
      >
      <span v-else-if="fallback" class="absolute inset-x-[7%] top-[6%] grid h-[55%] place-items-center">
        <img :src="fallback" alt="" class="size-full object-contain opacity-25 grayscale">
        <span class="absolute bottom-1 rounded-full bg-ink-950/80 px-2 py-0.5 text-[10px] text-white/45">No image</span>
      </span>
      <span v-else class="absolute inset-x-0 top-[20%] grid place-items-center text-white/15">
        <Icon name="lucide:image-off" class="size-6" />
      </span>
    </button>

    <!-- sides (and StatTrak) -->
    <span v-if="active" class="ltr pointer-events-none absolute top-2 right-2 z-10 flex gap-[3px]">
      <span
        v-if="hasStattrak"
        class="rounded-full border border-[#f5902d]/30 bg-ink-950/60 px-1.5 py-px font-mono text-[9px] font-bold text-[#f5902d] backdrop-blur-sm"
        title="StatTrak™"
      >ST™</span>
      <span
        v-for="t in activeTeams"
        :key="t"
        class="rounded-full border bg-ink-950/60 px-1.5 py-px font-mono text-[9px] font-bold backdrop-blur-sm"
        :class="t === 2 ? 'border-side-t/30 text-side-t' : 'border-side-ct/30 text-side-ct'"
      >{{ t === 2 ? 'T' : 'CT' }}</span>
    </span>

    <!-- inspect: top-left, opposite the side chips; always shown on touch screens -->
    <button
      v-if="canInspect"
      type="button"
      class="absolute top-2 left-2 z-10 grid size-7 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-white/60 opacity-0 backdrop-blur-sm transition-[opacity,color,border-color] duration-200 group-hover:opacity-100 hover:border-mint-500/50 hover:text-mint-300 focus-visible:opacity-100 pointer-coarse:opacity-100"
      aria-label="Inspect"
      title="Inspect"
      @click="openInspect"
    >
      <Icon name="lucide:scan-eye" class="size-3.5" />
    </button>

    <!-- ── foreground: glass panels over the item ── -->
    <div class="pointer-events-none flex flex-1 flex-col">
      <!-- room for the render; clicks fall through to the background button -->
      <div class="shrink-0" :class="stageClass" />

      <div class="pointer-events-auto mx-2 flex flex-1 flex-col gap-2 rounded-lg border border-white/8 bg-ink-950/55 p-2.5 shadow-[0_8px_24px_-12px_rgb(0_0_0/.8)] backdrop-blur-md">
        <button type="button" class="ltr block w-full text-left outline-none" :class="interactive ? 'cursor-pointer' : 'cursor-default'" tabindex="-1" @click="select">
          <span v-if="kicker" class="block truncate text-[12px] font-semibold text-[color-mix(in_oklab,var(--accent)_55%,white_30%)]">{{ kicker }}</span>
          <span class="mt-0.5 block truncate text-[14px] font-bold text-white" :title="title">{{ title }}</span>
          <span v-if="tier || code" class="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] font-bold">
            <span
              v-if="tier"
              class="inline-flex items-center gap-1.5 rounded-full border px-2 py-px"
              :style="{ color: tier.color, borderColor: `${tier.color}40`, background: `${tier.color}14` }"
            >
              <span class="size-1.5 rounded-full shadow-[0_0_6px_currentColor]" :style="{ background: tier.color }" />
              {{ tier.short }}
              <span class="text-white/70">{{ wear!.toFixed(3) }}</span>
            </span>
            <span v-if="code" class="ms-auto rounded-full bg-white/[.06] px-2 py-px text-white/45">{{ code }}</span>
          </span>
        </button>

        <div v-if="$slots.default" class="mt-auto">
          <slot />
        </div>
      </div>

      <!-- quality strip, like the colored bar under each inventory item -->
      <span
        class="mt-2 h-[3px] w-full shrink-0 transition-opacity duration-300"
        :class="[
          hasStattrak ? 'bg-[linear-gradient(90deg,#f5902d,#f5c542)]' : active ? 'bg-[linear-gradient(90deg,var(--color-mint-500),var(--color-cyan-k))]' : 'bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--accent)_50%,transparent),transparent)]',
          !active && 'opacity-40 group-hover:opacity-100',
        ]"
      />
    </div>
  </article>
</template>
