<script setup lang="ts">
import type { TeamId } from '~/types/skins'

const props = withDefaults(defineProps<{
  image: string
  title: string
  /** Small mono caption above the stage, e.g. the weapon or kit type. */
  caption?: string
  /** Sides this item is equipped on; empty = not equipped. */
  activeTeams?: TeamId[]
  /** Tone of the stage glow; defaults to mint when equipped. */
  glow?: string
  /** Shown dimmed when `image` is missing upstream (some new finishes have no render). */
  fallback?: string
  interactive?: boolean
  stageClass?: string
}>(), {
  caption: '',
  activeTeams: () => [],
  glow: '',
  fallback: '',
  interactive: true,
  stageClass: 'h-[150px]',
})

defineEmits<{ select: [] }>()

const active = computed(() => props.activeTeams.length > 0)
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
    class="group relative flex flex-col overflow-hidden rounded-lg border bg-ink-850 shadow-card transition-[border-color,transform,box-shadow] duration-300 ease-out-quint"
    :class="[
      active ? 'border-mint-500/40' : 'border-white/[.07] hover:border-white/15',
      interactive && 'hover:-translate-y-0.5 hover:shadow-lift',
    ]"
  >
    <!-- caption strip -->
    <div class="flex h-8 items-center justify-between gap-2 border-b border-white/[.05] px-3">
      <span class="ltr truncate font-mono text-[10.5px] font-bold uppercase tracking-wider text-white/40">{{ caption }}</span>
      <span v-if="active" class="flex shrink-0 items-center gap-1">
        <span
          v-for="t in activeTeams"
          :key="t"
          class="ltr rounded-xs px-1.5 py-px font-mono text-[9.5px] font-bold"
          :class="t === 2 ? 'bg-side-t/15 text-side-t' : 'bg-side-ct/15 text-side-ct'"
        >{{ t === 2 ? 'T' : 'CT' }}</span>
      </span>
    </div>

    <!-- stage -->
    <button
      type="button"
      class="relative isolate block w-full overflow-hidden outline-none"
      :class="[stageClass, interactive ? 'cursor-pointer' : 'cursor-default']"
      :tabindex="interactive ? 0 : -1"
      :aria-label="title"
      @click="interactive && $emit('select')"
    >
      <span class="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      <span
        class="absolute left-1/2 top-1/2 -z-10 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-opacity duration-500"
        :class="active ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'"
        :style="{ background: glow || (active ? 'rgb(46 232 156 / .22)' : 'rgb(255 255 255 / .06)') }"
      />
      <!-- corner brackets -->
      <span
        v-for="corner in ['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r']"
        :key="corner"
        class="absolute size-2.5 transition-all duration-300"
        :class="[corner, active ? 'border-mint-500/70' : 'border-white/0 group-hover:border-white/25']"
      />
      <span v-if="!loaded && !failed" class="skeleton absolute inset-8 rounded-md" />
      <img
        v-if="image && !failed"
        ref="img"
        :src="image"
        :alt="title"
        loading="lazy"
        decoding="async"
        class="relative mx-auto h-full w-[82%] object-contain py-3 drop-shadow-[0_10px_14px_rgb(0_0_0/.7)] transition-[transform,opacity] duration-500 ease-out-quint"
        :class="[loaded ? 'opacity-100' : 'opacity-0', interactive && 'group-hover:scale-[1.06]']"
        @load="loaded = true"
        @error="failed = true"
      >
      <span v-else-if="fallback" class="relative grid h-full place-items-center">
        <img :src="fallback" alt="" class="h-full w-[82%] object-contain py-3 opacity-25 grayscale">
        <span class="absolute bottom-2 rounded-xs bg-ink-950/80 px-1.5 py-0.5 text-[10px] text-white/45">بدون تصویر</span>
      </span>
      <span v-else class="grid h-full place-items-center text-white/15">
        <Icon name="lucide:image-off" class="size-7" />
      </span>
    </button>

    <!-- body -->
    <div class="flex flex-1 flex-col gap-2 px-3 pt-2.5 pb-3">
      <h3 class="ltr line-clamp-1 text-start text-[13px] font-bold text-white/90" :title="title">{{ title }}</h3>
      <div v-if="$slots.meta" class="ltr flex flex-wrap items-center justify-end gap-1.5">
        <slot name="meta" />
      </div>
      <div v-if="$slots.default" class="mt-auto pt-1">
        <slot />
      </div>
    </div>
  </article>
</template>
