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
  /** StatTrak™ kill count of the equipped copy; undefined = no StatTrak. */
  stattrak?: number
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
  stattrak: undefined,
  fallback: '',
  interactive: true,
  stageClass: 'h-28',
})

const emit = defineEmits<{ select: [] }>()

const { design } = useCardDesign()

const active = computed(() => props.activeTeams.length > 0)
const hasStattrak = computed(() => active.value && props.stattrak !== undefined)

const { inspect } = useInspect()
function openInspect() {
  inspect({ image: props.image, fallback: props.fallback, title: props.title, kicker: props.kicker, wear: active.value ? props.wear : undefined })
}
const tier = computed(() => (props.wear === undefined || !active.value ? null : wearTierOf(props.wear)))

const failed = ref(false)
const loaded = ref(false)
const img = ref<HTMLImageElement>()

// An image that finished before hydration never fires @load, so read its
// state directly once mounted (and whenever the source or design changes).
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
watch(design, () => nextTick(syncImageState))

function select() {
  if (props.interactive) emit('select')
}

const glowColor = computed(() => props.glow || (active.value ? 'rgb(46 232 156 / .16)' : 'rgb(255 255 255 / .05)'))
</script>

<template>
  <article
    class="group relative flex flex-col overflow-hidden transition-[border-color,transform,box-shadow] duration-300 ease-out-quint"
    :class="[
      {
        // A · Classic
        'rounded-xl border bg-ink-850 bg-[linear-gradient(180deg,rgb(255_255_255/.035),rgb(255_255_255/0)_40%)]': design === 'a',
        // B · Inventory
        'rounded-lg border bg-ink-850': design === 'b',
        // C · Showcase
        'rounded-2xl border bg-ink-900': design === 'c',
        // D · Ticket
        'rounded-xl border bg-ink-850': design === 'd',
      },
      active
        ? (design === 'c' ? 'border-mint-500/40 shadow-[0_0_0_1px_rgb(46_232_156/.12),0_18px_40px_-18px_rgb(46_232_156/.45)]' : 'border-mint-500/35')
        : 'border-white/6 hover:border-white/12',
      interactive && 'hover:-translate-y-0.5 hover:shadow-lift',
    ]"
  >
    <!-- ───────── tile (render) ───────── -->
    <button
      type="button"
      class="relative isolate block w-full overflow-hidden outline-none"
      :class="[
        design === 'c' ? 'h-40' : design === 'b' ? 'h-32' : stageClass,
        interactive ? 'cursor-pointer' : 'cursor-default',
        design === 'b' && 'bg-[radial-gradient(90%_80%_at_50%_45%,rgb(255_255_255/.06),transparent_70%)]',
      ]"
      :tabindex="interactive ? 0 : -1"
      :aria-label="title"
      @click="select"
    >
      <span
        class="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-500"
        :class="design === 'c' ? 'size-[170px] blur-[38px]' : 'size-[130px] blur-[28px]'"
        :style="{ background: hasStattrak && design === 'c' ? 'rgb(245 144 45 / .16)' : glowColor }"
      />
      <!-- C: floor line under the render -->
      <span v-if="design === 'c'" class="absolute inset-x-6 bottom-9 -z-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <span v-if="!loaded && !failed && image" class="skeleton absolute inset-x-6 inset-y-4 rounded-lg" />
      <img
        v-if="image && !failed"
        ref="img"
        :src="image"
        :alt="title"
        loading="lazy"
        decoding="async"
        class="relative mx-auto block object-contain drop-shadow-[0_10px_12px_rgb(0_0_0/.6)] transition-[transform,opacity] duration-500 ease-out-quint"
        :class="[
          loaded ? 'opacity-100' : 'opacity-0',
          interactive && 'group-hover:scale-[1.05]',
          design === 'c' ? 'h-[78%] w-[88%] pt-4' : design === 'b' ? 'h-[80%] w-[84%] pt-3' : 'h-full w-[86%] py-2.5',
        ]"
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

      <!-- side chips (+ StatTrak on A / B) -->
      <span v-if="active" class="ltr absolute top-2 end-2 flex gap-[3px]">
        <span
          v-if="hasStattrak && (design === 'a' || design === 'b')"
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

      <!-- C: title sits on the stage -->
      <span v-if="design === 'c'" class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900 via-ink-900/85 to-transparent px-3 pt-6 pb-2.5">
        <span class="flex items-end justify-between gap-2">
          <span class="min-w-0">
            <span v-if="kicker" class="ltr block truncate text-right font-mono text-[9px] font-bold tracking-[.08em] text-white/30">{{ kicker }}</span>
            <span class="ltr block truncate text-right text-[13px] font-bold text-white" :title="title">{{ title }}</span>
          </span>
          <span
            v-if="hasStattrak"
            class="ltr inline-flex shrink-0 items-center gap-1 rounded-full border border-[#f5902d]/30 bg-[#f5902d]/12 px-2 py-0.5 font-mono text-[9.5px] font-bold text-[#f5902d]"
          ><Icon name="lucide:activity" class="size-3" />{{ stattrak }}</span>
        </span>
      </span>
    </button>

    <!-- inspect: sibling of the tile button (buttons cannot nest); always shown on touch screens -->
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

    <!-- ───────── A · Classic ───────── -->
    <div v-if="design === 'a'" class="flex flex-1 flex-col gap-2 px-2.5 pb-2.5">
      <div class="min-w-0">
        <p v-if="kicker || hasStattrak" class="ltr truncate text-right font-mono text-[9px] font-bold tracking-[.08em] text-white/28">
          <span v-if="hasStattrak" class="text-[#f5902d]">StatTrak™ {{ stattrak }}<template v-if="kicker"> · </template></span>{{ kicker }}
        </p>
        <h3 class="ltr mt-0.5 truncate text-right text-[12.5px] font-bold text-white" :title="title">{{ title }}</h3>
      </div>

      <div v-if="tier">
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

    <!-- ───────── B · Inventory: the game's tile, whole card is the button ───────── -->
    <div v-else-if="design === 'b'" class="relative flex flex-1 flex-col">
      <button type="button" class="block w-full px-2.5 pt-2 pb-2.5 text-right outline-none" :tabindex="-1" @click="select">
        <span class="ltr flex items-center justify-between gap-2 font-mono text-[9px] font-bold tracking-[.06em]">
          <span v-if="tier" :style="{ color: tier.color }">{{ tier.short }} · {{ wear!.toFixed(3) }}</span>
          <span v-else />
          <span class="truncate text-white/30">{{ kicker }}</span>
        </span>
        <span v-if="hasStattrak" class="ltr mt-1 block truncate text-right text-[10.5px] font-semibold text-[#f5902d]">StatTrak™ · {{ stattrak }} kills</span>
        <span class="ltr mt-0.5 block truncate text-right text-[13px] font-bold text-white" :title="title">{{ title }}</span>
      </button>
      <!-- quality strip, like the colored bar under each inventory item -->
      <span
        class="mt-auto h-[3px] w-full"
        :class="hasStattrak ? 'bg-[#f5902d]' : active ? 'bg-mint-500' : 'bg-white/8 group-hover:bg-white/15'"
      />
    </div>

    <!-- ───────── C · Showcase ───────── -->
    <div v-else-if="design === 'c'" class="flex flex-1 flex-col gap-2.5 px-3 pb-3">
      <div v-if="tier" class="ltr flex items-center gap-2 font-mono text-[9px] text-white/40">
        <span class="font-bold" :style="{ color: tier.color }">{{ tier.short }}</span>
        <span class="relative h-1 flex-1 overflow-hidden rounded-full bg-white/8">
          <span class="absolute inset-y-0 left-0 rounded-full" :style="{ width: `${Math.max(2, wear! * 100)}%`, background: tier.color }" />
        </span>
        <span>{{ wear!.toFixed(3) }}</span>
      </div>
      <div v-if="$slots.default" class="mt-auto">
        <slot />
      </div>
    </div>

    <!-- ───────── D · Ticket: perforated stub with a stat strip ───────── -->
    <div v-else class="relative flex flex-1 flex-col">
      <!-- perforation with notches -->
      <div class="relative h-3">
        <span class="absolute -start-1.5 top-1/2 size-3 -translate-y-1/2 rounded-full border border-white/6 bg-ink-950" />
        <span class="absolute -end-1.5 top-1/2 size-3 -translate-y-1/2 rounded-full border border-white/6 bg-ink-950" />
        <span class="absolute inset-x-3 top-1/2 border-t border-dashed border-white/12" />
      </div>
      <div class="flex flex-1 flex-col gap-2 px-2.5 pb-2.5">
        <div class="min-w-0">
          <p v-if="kicker" class="ltr truncate text-right font-mono text-[9px] font-bold tracking-[.08em] text-white/28">{{ kicker }}</p>
          <h3 class="ltr mt-0.5 truncate text-right text-[12.5px] font-bold text-white" :title="title">{{ title }}</h3>
        </div>
        <div v-if="active" class="ltr grid grid-cols-3 overflow-hidden rounded-md border border-white/6 font-mono text-[9px]">
          <span class="flex flex-col items-center border-e border-white/6 py-1">
            <span class="text-white/30">WEAR</span>
            <span class="font-bold" :style="{ color: tier?.color ?? 'rgb(255 255 255 / .5)' }">{{ tier ? tier.short : '—' }}</span>
          </span>
          <span class="flex flex-col items-center border-e border-white/6 py-1">
            <span class="text-white/30">FLOAT</span>
            <span class="font-bold text-white/70">{{ tier ? wear!.toFixed(3) : '—' }}</span>
          </span>
          <span class="flex flex-col items-center py-1" :class="hasStattrak && 'bg-[#f5902d]/10'">
            <span :class="hasStattrak ? 'text-[#f5902d]/70' : 'text-white/30'">ST™</span>
            <span class="font-bold" :class="hasStattrak ? 'text-[#f5902d]' : 'text-white/30'">{{ hasStattrak ? stattrak : 'off' }}</span>
          </span>
        </div>
        <div v-if="$slots.default" class="mt-auto">
          <slot />
        </div>
      </div>
    </div>
  </article>
</template>
