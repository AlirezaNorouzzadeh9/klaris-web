<script setup lang="ts">
import type { TeamId } from '~/types/skins'
import { wearTierOf } from '~/data/weapons'

/**
 * Inventory-style item card, like a tile in the game's inventory: render on a
 * soft spotlight, wear / StatTrak / name underneath, the action row (with the
 * inspect button beside it) and a quality strip along the bottom edge.
 */
const props = withDefaults(defineProps<{
  image: string
  title: string
  /** Small mono line above the title: paint id, kit, faction or item type. */
  kicker?: string
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
  /** Show the inspect (pseudo-3D) button next to the action. */
  inspectable?: boolean
  /** Tile height class: skins 128px, agents 168px, music / pins 120px. */
  stageClass?: string
}>(), {
  inspectable: true,
  kicker: '',
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
    class="group relative flex flex-col overflow-hidden rounded-lg border bg-ink-850 transition-[border-color,transform,box-shadow] duration-300 ease-out-quint"
    :class="[
      active ? 'border-mint-500/35' : 'border-white/6 hover:border-white/12',
      interactive && 'hover:-translate-y-0.5 hover:shadow-lift',
    ]"
  >
    <!-- render on a spotlight -->
    <button
      type="button"
      class="relative isolate block w-full overflow-hidden bg-[radial-gradient(90%_80%_at_50%_45%,rgb(255_255_255/.06),transparent_70%)] outline-none"
      :class="[stageClass, interactive ? 'cursor-pointer' : 'cursor-default']"
      :tabindex="interactive ? 0 : -1"
      :aria-label="title"
      @click="select"
    >
      <span
        class="absolute left-1/2 top-1/2 -z-10 size-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[28px] transition-colors duration-500"
        :style="{ background: glow || (active ? 'rgb(46 232 156 / .16)' : 'rgb(255 255 255 / .05)') }"
      />
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
        <span class="flex items-center justify-between gap-2 font-mono text-[9px] font-bold tracking-[.06em]">
          <span class="truncate text-white/30">{{ kicker }}</span>
          <span v-if="tier" class="shrink-0" :style="{ color: tier.color }">{{ tier.short }} · {{ wear!.toFixed(3) }}</span>
        </span>
        <span class="mt-0.5 block truncate text-[13px] font-bold text-white" :title="title">{{ title }}</span>
      </button>

      <div v-if="$slots.default" class="mt-auto">
        <slot />
      </div>
    </div>

    <!-- quality strip, like the colored bar under each inventory item -->
    <span
      class="h-[3px] w-full shrink-0 transition-colors"
      :class="hasStattrak ? 'bg-[#f5902d]' : active ? 'bg-mint-500' : 'bg-white/8 group-hover:bg-white/15'"
    />
  </article>
</template>
