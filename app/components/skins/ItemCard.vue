<script setup lang="ts">
import type { TeamId } from '~/types/skins'
import { wearTierOf } from '~/data/weapons'

const props = withDefaults(defineProps<{
  image: string
  title: string
  /** Small mono line above the title: paint id, kit, faction or item type. */
  kicker?: string
  /** Sides this item is equipped on; empty = not equipped. */
  activeTeams?: TeamId[]
  /** Glow behind the render; defaults to mint when equipped. */
  glow?: string
  /** Float of the equipped finish; shows the wear bar when set. */
  wear?: number
  /** Shown dimmed when `image` is missing upstream (some new finishes have no render). */
  fallback?: string
  interactive?: boolean
  /** Show the inspect (pseudo-3D) button in the tile corner. */
  inspectable?: boolean
  /** Tile height class: skins 112px, agents 168px, music / pins 120px. */
  stageClass?: string
}>(), {
  inspectable: true,
  kicker: '',
  activeTeams: () => [],
  glow: '',
  wear: undefined,
  fallback: '',
  interactive: true,
  stageClass: 'h-28',
})

defineEmits<{ select: [] }>()

const active = computed(() => props.activeTeams.length > 0)

const { inspect } = useInspect()
function openInspect() {
  inspect({ image: props.image, fallback: props.fallback, title: props.title, kicker: props.kicker, wear: active.value ? props.wear : undefined })
}
const tier = computed(() => (props.wear === undefined ? null : wearTierOf(props.wear)))

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
    class="group relative flex flex-col overflow-hidden rounded-xl border bg-ink-850 bg-[linear-gradient(180deg,rgb(255_255_255/.035),rgb(255_255_255/0)_40%)] transition-[border-color,transform,box-shadow] duration-300 ease-out-quint"
    :class="[
      active ? 'border-mint-500/35' : 'border-white/6 hover:border-white/12',
      interactive && 'hover:-translate-y-0.5 hover:shadow-lift',
    ]"
  >
    <!-- tile -->
    <button
      type="button"
      class="relative isolate block w-full overflow-hidden outline-none"
      :class="[stageClass, interactive ? 'cursor-pointer' : 'cursor-default']"
      :tabindex="interactive ? 0 : -1"
      :aria-label="title"
      @click="interactive && $emit('select')"
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
        class="relative mx-auto block h-full w-[86%] object-contain py-2.5 drop-shadow-[0_10px_12px_rgb(0_0_0/.6)] transition-[transform,opacity] duration-500 ease-out-quint"
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

      <!-- side chips -->
      <span v-if="active" class="ltr absolute top-2 end-2 flex gap-[3px]">
        <span
          v-for="t in activeTeams"
          :key="t"
          class="rounded-full px-1.5 py-px font-mono text-[9px] font-bold"
          :class="t === 2 ? 'bg-side-t/15 text-side-t' : 'bg-side-ct/15 text-side-ct'"
        >{{ t === 2 ? 'T' : 'CT' }}</span>
      </span>
    </button>

    <!-- sibling of the tile button (buttons cannot nest); always shown on touch screens -->
    <button
      v-if="inspectable && (image || fallback)"
      type="button"
      class="absolute top-2 start-2 z-10 grid size-7 place-items-center rounded-full border border-white/10 bg-ink-950/70 text-white/60 opacity-0 backdrop-blur-sm transition-[opacity,color,border-color] duration-200 group-hover:opacity-100 hover:border-mint-500/50 hover:text-mint-300 focus-visible:opacity-100 pointer-coarse:opacity-100"
      aria-label="Inspect"
      title="Inspect"
      @click="openInspect"
    >
      <Icon name="lucide:scan-eye" class="size-3.5" />
    </button>

    <!-- body -->
    <div class="flex flex-1 flex-col gap-2 px-2.5 pb-2.5">
      <div class="min-w-0">
        <p v-if="kicker" class="ltr truncate text-right font-mono text-[9px] font-bold tracking-[.08em] text-white/28">{{ kicker }}</p>
        <h3 class="ltr mt-0.5 truncate text-right text-[12.5px] font-bold text-white" :title="title">{{ title }}</h3>
      </div>

      <div v-if="tier && active">
        <div class="flex items-center justify-between font-mono text-[9px] text-white/40">
          <span>{{ tier.label }}</span><span>{{ wear!.toFixed(3) }}</span>
        </div>
        <div class="relative mt-1 h-[3px] rounded-full bg-white/8">
          <span class="absolute inset-y-0 start-0 rounded-full" :style="{ width: `${Math.max(2, wear! * 100)}%`, background: tier.color }" />
        </div>
      </div>

      <div v-if="$slots.default" class="mt-auto">
        <slot />
      </div>
    </div>
  </article>
</template>
