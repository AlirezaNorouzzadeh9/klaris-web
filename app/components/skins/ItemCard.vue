<script setup lang="ts">
import type { TeamId } from '~/types/skins'
import { wearTierOf } from '~/data/weapons'

/**
 * Inventory-style item card, like a tile in the game's inventory: render on a
 * soft spotlight (inspect top-left, sides top-right), weapon / wear and name
 * underneath, the action button and a quality strip along the bottom edge.
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
    class="group relative flex flex-col overflow-hidden rounded-lg border bg-ink-850 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--accent)_7%,transparent),transparent_45%)] transition-[border-color,transform,box-shadow] duration-300 ease-out-quint"
    :class="[
      active
        ? 'border-[color-mix(in_oklab,var(--accent)_45%,transparent)] shadow-[0_14px_34px_-20px_var(--accent)]'
        : 'border-white/7 hover:border-[color-mix(in_oklab,var(--accent)_35%,transparent)]',
      interactive && 'hover:-translate-y-0.5 hover:shadow-lift',
    ]"
    :style="{ '--accent': accent }"
  >
    <!-- render on a spotlight -->
    <button
      type="button"
      class="relative isolate block w-full overflow-hidden bg-[radial-gradient(90%_85%_at_50%_40%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_70%)] outline-none"
      :class="[stageClass, interactive ? 'cursor-pointer' : 'cursor-default']"
      :tabindex="interactive ? 0 : -1"
      :aria-label="title"
      @click="select"
    >
      <span
        class="absolute left-1/2 top-1/2 -z-10 size-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[28px] transition-colors duration-500"
        :style="{ background: glow || `color-mix(in oklab, var(--accent) ${active ? 26 : 12}%, transparent)` }"
      />
      <span class="absolute inset-x-8 bottom-2 -z-10 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--accent)_45%,transparent),transparent)]" />
      <span v-if="!loaded && !failed && image" class="skeleton absolute inset-x-6 inset-y-4 rounded-lg" />
      <img
        v-if="image && !failed"
        ref="img"
        :src="image"
        :alt="title"
        loading="lazy"
        decoding="async"
        class="relative mx-auto block h-[84%] w-[84%] object-contain pt-3 drop-shadow-[0_10px_12px_rgb(0_0_0/.6)] transition-[transform,opacity] duration-500 ease-out-quint"
        :class="[loaded ? 'opacity-100' : 'opacity-0', interactive && 'group-hover:scale-[1.05]']"
        @load="loaded = true"
        @error="failed = true"
      >
      <span v-else-if="fallback" class="relative grid h-full place-items-center">
        <img :src="fallback" alt="" class="h-full w-[86%] object-contain py-2.5 opacity-25 grayscale">
        <span class="absolute bottom-1.5 rounded-full bg-ink-950/80 px-2 py-0.5 text-[10px] text-white/45">No image</span>
      </span>
      <span v-else class="grid h-full place-items-center text-white/15">
        <Icon name="lucide:image-off" class="size-6" />
      </span>

      <!-- sides (and StatTrak) in the corner -->
      <span v-if="active" class="ltr absolute top-2 right-2 flex gap-[3px]">
        <span
          v-if="hasStattrak"
          class="rounded-full bg-[#f5902d]/15 px-1.5 py-px font-mono text-[9px] font-bold text-[#f5902d]"
          title="StatTrak™"
        >ST™</span>
        <span
          v-for="t in activeTeams"
          :key="t"
          class="rounded-full px-1.5 py-px font-mono text-[9px] font-bold"
          :class="t === 2 ? 'bg-side-t/15 text-side-t' : 'bg-side-ct/15 text-side-ct'"
        >{{ t === 2 ? 'T' : 'CT' }}</span>
      </span>
    </button>

    <!-- inspect: top-left, opposite the side chips; sibling of the tile (buttons cannot nest); always shown on touch screens -->
    <button
      v-if="canInspect"
      type="button"
      class="absolute top-2 left-2 z-10 grid size-7 place-items-center rounded-full border border-white/10 bg-ink-950/70 text-white/60 opacity-0 backdrop-blur-sm transition-[opacity,color,border-color] duration-200 group-hover:opacity-100 hover:border-mint-500/50 hover:text-mint-300 focus-visible:opacity-100 pointer-coarse:opacity-100"
      aria-label="Inspect"
      title="Inspect"
      @click="openInspect"
    >
      <Icon name="lucide:scan-eye" class="size-3.5" />
    </button>

    <!-- labels -->
    <div class="flex flex-1 flex-col gap-2 px-2.5 pt-2 pb-2.5">
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
          <span v-if="code" class="ms-auto rounded-full bg-white/[.04] px-2 py-px text-white/40">{{ code }}</span>
        </span>
      </button>

      <div v-if="$slots.default" class="mt-auto">
        <slot />
      </div>
    </div>

    <!-- quality strip, like the colored bar under each inventory item -->
    <span
      class="h-[3px] w-full shrink-0 transition-opacity duration-300"
      :class="[
        hasStattrak ? 'bg-[linear-gradient(90deg,#f5902d,#f5c542)]' : active ? 'bg-[linear-gradient(90deg,var(--color-mint-500),var(--color-cyan-k))]' : 'bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--accent)_50%,transparent),transparent)]',
        !active && 'opacity-40 group-hover:opacity-100',
      ]"
    />
  </article>
</template>
