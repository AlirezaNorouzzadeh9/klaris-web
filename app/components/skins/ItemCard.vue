<script setup lang="ts">
import type { TeamId } from '~/types/skins'
import { wearTierOf } from '~/data/weapons'

/**
 * Item card in one of four designs (picked with useCardDesign while we
 * compare): 1 Dossier, 2 Frame, 3 Poster, 4 Minimal. All show the render,
 * weapon / paint id, name, float and the action slot; equipped cards take the
 * accent colour, StatTrak (set in skin settings) shows as a ribbon or chip.
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
  titleLines: 1,
})

const emit = defineEmits<{ select: [] }>()

const { design } = useCardDesign()

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
    class="group relative flex flex-col overflow-hidden transition-[border-color,transform,box-shadow,background-color] duration-300 ease-out-quint"
    :class="[
      {
        // 1 · Dossier
        'rounded-xl border bg-ink-850': design === 'a',
        // 2 · Frame: the render sits in an inset frame, like a trading card
        'rounded-2xl border bg-ink-900 p-2': design === 'b',
        // 3 · Poster: full-bleed colour with the weapon name as a watermark
        'rounded-xl border bg-ink-900': design === 'c',
        // 4 · Minimal: no chrome until hover
        'rounded-xl border bg-white/[.015]': design === 'd',
      },
      active
        ? 'border-[color-mix(in_oklab,var(--accent)_45%,transparent)] shadow-[0_14px_34px_-20px_var(--accent)]'
        : design === 'd'
          ? 'border-transparent hover:border-white/10 hover:bg-white/[.03]'
          : 'border-white/7 hover:border-[color-mix(in_oklab,var(--accent)_35%,transparent)] hover:shadow-lift',
      interactive && 'hover:-translate-y-0.5',
    ]"
    :style="{ '--accent': accent }"
  >
    <!-- accent edge along the top for equipped items -->
    <span v-if="active && (design === 'a' || design === 'c')" class="absolute inset-x-0 top-0 z-[5] h-[3px] bg-[var(--accent)]" />

    <!-- StatTrak corner ribbon -->
    <span v-if="hasStattrak && (design === 'a' || design === 'c')" class="pointer-events-none absolute top-0 right-0 z-[5] size-16 overflow-hidden">
      <span class="absolute top-[11px] -right-5 w-24 rotate-45 bg-[#f5902d] py-0.5 text-center font-mono text-[9px] font-bold tracking-[.14em] text-[#1a0f02]">ST™</span>
    </span>

    <!-- ───────── stage ───────── -->
    <button
      type="button"
      class="relative isolate block w-full shrink-0 overflow-hidden outline-none"
      :class="[
        stageClass,
        interactive ? 'cursor-pointer' : 'cursor-default',
        design === 'b' && 'rounded-xl bg-black/30 ring-1 ring-white/6 ring-inset',
        design === 'c'
          ? 'bg-[linear-gradient(150deg,color-mix(in_oklab,var(--accent)_30%,transparent),transparent_65%)]'
          : 'bg-[radial-gradient(90%_85%_at_50%_40%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_70%)]',
      ]"
      :tabindex="interactive ? 0 : -1"
      :aria-label="title"
      @click="select"
    >
      <span
        class="absolute left-1/2 top-[44%] -z-10 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[30px]"
        :style="{ background: glow || `color-mix(in oklab, var(--accent) ${active ? 26 : 12}%, transparent)` }"
      />
      <!-- 3: weapon name as a big watermark behind the render -->
      <span
        v-if="design === 'c' && kicker"
        class="ltr pointer-events-none absolute inset-x-0 top-1 -z-10 truncate px-2 text-left text-[46px] leading-none font-black tracking-tight text-white/[.05] uppercase"
      >{{ kicker }}</span>
      <!-- 2: corner ticks inside the frame -->
      <template v-if="design === 'b'">
        <span class="absolute top-2 left-2 size-2.5 border-t border-l border-[color-mix(in_oklab,var(--accent)_60%,transparent)]" />
        <span class="absolute right-2 bottom-2 size-2.5 border-r border-b border-[color-mix(in_oklab,var(--accent)_60%,transparent)]" />
      </template>

      <span v-if="!loaded && !failed && image" class="skeleton absolute inset-x-6 top-4 bottom-12 rounded-lg" />
      <img
        v-if="image && !failed"
        ref="img"
        :src="image"
        :alt="title"
        loading="lazy"
        decoding="async"
        class="relative mx-auto block object-contain drop-shadow-[0_12px_14px_rgb(0_0_0/.65)] transition-[transform,opacity] duration-500 ease-out-quint"
        :class="[
          loaded ? 'opacity-100' : 'opacity-0',
          interactive && 'group-hover:scale-[1.05]',
          design === 'a' ? 'h-[86%] w-[92%] pt-1.5' : design === 'c' ? 'h-[80%] w-[94%] pt-5' : 'h-full w-[88%] py-3',
        ]"
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

      <!-- 1: name + float over the stage's lower edge -->
      <span v-if="design === 'a'" class="ltr absolute inset-x-0 bottom-0 flex items-end gap-2 bg-gradient-to-t from-ink-850 from-5% via-ink-850/55 to-transparent px-3 pt-[26px] pb-2 text-left">
        <span class="min-w-0 flex-1">
          <span class="block truncate font-mono text-[9.5px] font-bold tracking-[.18em] text-[color-mix(in_oklab,var(--accent)_55%,white_30%)] uppercase">
            {{ kicker }}<template v-if="kicker && code"> · </template>{{ code }}
          </span>
          <span class="block text-[14.5px] font-bold text-white" :class="titleClass" :title="title">{{ title }}</span>
        </span>
        <span class="shrink-0 font-mono text-[17px] leading-none font-bold" :style="{ color: tier ? tier.color : 'rgb(255 255 255 / .25)' }">{{ floatText }}</span>
      </span>
    </button>

    <!-- sides (+ StatTrak where there is no ribbon) -->
    <span
      v-if="active"
      class="ltr pointer-events-none absolute z-[6] flex gap-[3px]"
      :class="hasStattrak && (design === 'a' || design === 'c') ? 'top-2 right-14' : design === 'b' ? 'top-4 right-4' : 'top-2 right-2'"
    >
      <span
        v-if="hasStattrak && (design === 'b' || design === 'd')"
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
      class="absolute z-[6] grid size-7 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-white/60 opacity-0 backdrop-blur-sm transition-[opacity,color,border-color] duration-200 group-hover:opacity-100 hover:border-mint-500/50 hover:text-mint-300 focus-visible:opacity-100 pointer-coarse:opacity-100"
      :class="design === 'b' ? 'top-4 left-4' : 'top-2 left-2.5'"
      aria-label="Inspect"
      title="Inspect"
      @click="openInspect"
    >
      <Icon name="lucide:scan-eye" class="size-3.5" />
    </button>

    <!-- ───────── 2 · Frame: labels under the frame ───────── -->
    <button v-if="design === 'b'" type="button" class="ltr flex items-end gap-2 px-1.5 pt-2.5 text-left outline-none" tabindex="-1" @click="select">
      <span class="min-w-0 flex-1">
        <span class="block truncate text-[11.5px] font-semibold text-white/45">
          {{ kicker }}<template v-if="kicker && code"> · </template><span class="font-mono text-white/30">{{ code }}</span>
        </span>
        <span class="block text-[14.5px] font-bold text-white" :class="titleClass" :title="title">{{ title }}</span>
      </span>
      <span
        v-if="tier"
        class="shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-bold"
        :style="{ color: tier.color, borderColor: `${tier.color}40`, background: `${tier.color}14` }"
      >{{ tier.short }} {{ floatText }}</span>
    </button>

    <!-- ───────── 3 · Poster: glass plate over the stage's lower edge ───────── -->
    <div v-if="design === 'c'" class="ltr relative z-[4] mx-2 -mt-9 mb-2 flex flex-1 flex-col gap-2 rounded-lg border border-white/8 bg-ink-950/65 p-2.5 backdrop-blur-md">
      <button type="button" class="flex items-end gap-2 text-left outline-none" tabindex="-1" @click="select">
        <span class="min-w-0 flex-1">
          <span class="block truncate font-mono text-[9.5px] font-bold tracking-[.14em] text-[color-mix(in_oklab,var(--accent)_55%,white_30%)] uppercase">{{ code || kicker }}</span>
          <span class="block text-[14px] font-bold text-white" :class="titleClass" :title="title">{{ title }}</span>
        </span>
        <span class="shrink-0 font-mono text-[15px] leading-none font-bold" :style="{ color: tier ? tier.color : 'rgb(255 255 255 / .25)' }">{{ floatText }}</span>
      </button>
      <div v-if="$slots.default" class="mt-auto">
        <slot />
      </div>
    </div>

    <!-- ───────── 4 · Minimal: centred labels ───────── -->
    <button v-if="design === 'd'" type="button" class="ltr flex flex-col items-center px-3 pt-1 text-center outline-none" tabindex="-1" @click="select">
      <span class="max-w-full text-[14px] font-bold text-white" :class="titleClass" :title="title">{{ title }}</span>
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

    <!-- actions (1, 2, 4) -->
    <div
      v-if="design !== 'c' && $slots.default"
      class="ltr mt-auto"
      :class="[
        design === 'a' ? 'px-[11px] pt-2.5 pb-[11px]' : design === 'b' ? 'px-0.5 pt-2.5' : 'px-3 pt-2.5 pb-3',
        design === 'd' && !active && 'transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 pointer-coarse:opacity-100',
      ]"
    >
      <slot />
    </div>
  </article>
</template>
