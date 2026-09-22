<script setup lang="ts">
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { wearTierOf } from '~/data/weapons'

/**
 * Pseudo-3D inspect view for any catalog render. The flat image is tilted in
 * perspective (pointer position on desktop, drag on touch), zoomed with the
 * wheel / pinch / buttons, lit by a sheen that follows the angle, and mirrored
 * onto the floor. With no input it sways gently, like the in-game inspect.
 */
const { item, open } = useInspect()

const MAX_Y = 24 // degrees left / right
const MAX_X = 16 // degrees up / down
const MIN_ZOOM = 1
const MAX_ZOOM = 3

const stage = ref<HTMLElement>()
const model = ref<HTMLElement>()
const sheen = ref<HTMLElement>()
const failed = ref(false)
const zoomLabel = ref(1)
const isTouch = ref(false)

// target values set by input; current values chase them every frame
const target = { rx: 0, ry: 0, zoom: 1, ox: 50, oy: 50 }
const current = { rx: 0, ry: 0, zoom: 1, ox: 50, oy: 50 }
let lastInput = 0
let frame = 0
let reduced = false

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function reset() {
  Object.assign(target, { rx: 0, ry: 0, zoom: 1, ox: 50, oy: 50 })
  lastInput = 0
}

function setZoom(z: number) {
  target.zoom = clamp(z, MIN_ZOOM, MAX_ZOOM)
  if (target.zoom === 1) Object.assign(target, { ox: 50, oy: 50 })
  lastInput = performance.now()
}

function tick(now: number) {
  // idle sway once nobody has touched the view for a moment
  if (!reduced && now - lastInput > 1600 && target.zoom === 1) {
    const t = now / 1000
    target.ry = Math.sin(t * 0.55) * 11
    target.rx = Math.cos(t * 0.42) * 4
  }
  const k = reduced ? 1 : 0.11
  current.rx += (target.rx - current.rx) * k
  current.ry += (target.ry - current.ry) * k
  current.zoom += (target.zoom - current.zoom) * k
  current.ox += (target.ox - current.ox) * k
  current.oy += (target.oy - current.oy) * k

  if (model.value) {
    model.value.style.transformOrigin = `${current.ox}% ${current.oy}%`
    model.value.style.transform
      = `rotateX(${current.rx.toFixed(2)}deg) rotateY(${current.ry.toFixed(2)}deg) scale(${current.zoom.toFixed(3)})`
  }
  if (sheen.value) {
    // light sweeps across the surface as the model turns
    const x = 50 + (current.ry / MAX_Y) * 45
    const y = 40 - (current.rx / MAX_X) * 35
    sheen.value.style.backgroundPosition = `${x}% ${y}%`
  }
  zoomLabel.value = Math.round(current.zoom * 10) / 10
  frame = requestAnimationFrame(tick)
}

// ---- input ----
const pointers = new Map<number, { x: number; y: number }>()
let pinchStart = 0
let zoomAtPinch = 1

function onPointerMove(e: PointerEvent) {
  const el = stage.value
  if (!el) return
  const r = el.getBoundingClientRect()
  lastInput = performance.now()

  if (e.pointerType === 'mouse') {
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2
    target.ry = clamp(nx, -1, 1) * MAX_Y
    target.rx = clamp(-ny, -1, 1) * MAX_X
    // zoom follows the cursor, like a loupe
    target.ox = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100)
    target.oy = clamp(((e.clientY - r.top) / r.height) * 100, 0, 100)
    return
  }

  const prev = pointers.get(e.pointerId)
  if (!prev) return
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (pointers.size >= 2) {
    const [a, b] = [...pointers.values()]
    const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y)
    if (pinchStart) setZoom(zoomAtPinch * (dist / pinchStart))
    return
  }
  // one finger: drag to turn the model
  target.ry = clamp(target.ry + (e.clientX - prev.x) * 0.35, -MAX_Y, MAX_Y)
  target.rx = clamp(target.rx - (e.clientY - prev.y) * 0.3, -MAX_X, MAX_X)
}

function onPointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse') return
  isTouch.value = true
  stage.value?.setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    pinchStart = Math.hypot(a!.x - b!.x, a!.y - b!.y)
    zoomAtPinch = target.zoom
  }
  lastInput = performance.now()
}

function onPointerUp(e: PointerEvent) {
  pointers.delete(e.pointerId)
  if (pointers.size < 2) pinchStart = 0
}

function onPointerLeave(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  target.rx = 0
  target.ry = 0
  lastInput = performance.now() - 800 // resume the sway a little sooner
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  setZoom(target.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15))
}

function onKey(e: KeyboardEvent) {
  const step = 6
  if (e.key === 'ArrowLeft') target.ry = clamp(target.ry - step, -MAX_Y, MAX_Y)
  else if (e.key === 'ArrowRight') target.ry = clamp(target.ry + step, -MAX_Y, MAX_Y)
  else if (e.key === 'ArrowUp') target.rx = clamp(target.rx + step, -MAX_X, MAX_X)
  else if (e.key === 'ArrowDown') target.rx = clamp(target.rx - step, -MAX_X, MAX_X)
  else if (e.key === '+' || e.key === '=') setZoom(target.zoom * 1.25)
  else if (e.key === '-') setZoom(target.zoom / 1.25)
  else if (e.key === '0') reset()
  else return
  e.preventDefault()
  lastInput = performance.now()
}

// wheel must be non-passive to stop the page scrolling behind the dialog
watch(stage, (el, old) => {
  old?.removeEventListener('wheel', onWheel)
  el?.addEventListener('wheel', onWheel, { passive: false })
})

watch(open, (isOpen) => {
  cancelAnimationFrame(frame)
  if (!isOpen) return
  failed.value = false
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  isTouch.value = window.matchMedia('(pointer: coarse)').matches
  reset()
  Object.assign(current, target)
  frame = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(frame))

const tier = computed(() => (item.value?.wear === undefined ? null : wearTierOf(item.value.wear)))
const src = computed(() => (failed.value ? item.value?.fallback : item.value?.image) ?? '')
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      dir="ltr"
      :show-close-button="false"
      class="flex h-dvh w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-ink-950 p-0 sm:h-[min(88dvh,780px)] sm:w-[min(calc(100vw-3rem),1100px)] sm:max-w-none sm:rounded-2xl sm:border sm:border-white/8"
      @open-auto-focus.prevent
      @keydown="onKey"
    >
      <template v-if="item">
        <!-- top bar -->
        <div class="z-10 flex shrink-0 items-center gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
          <div class="min-w-0 flex-1">
            <p v-if="item.kicker" class="truncate font-mono text-[10.5px] font-bold tracking-[.12em] text-white/35 uppercase">{{ item.kicker }}</p>
            <DialogTitle class="truncate text-lg font-black text-white sm:text-2xl">{{ item.title }}</DialogTitle>
            <DialogDescription class="sr-only">Inspect view. Move the pointer or drag to tilt, scroll or pinch to zoom.</DialogDescription>
          </div>
          <span
            v-if="tier"
            class="hidden shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold sm:inline"
            :style="{ background: `${tier.color}1f`, color: tier.color }"
          >{{ tier.label }} · {{ item.wear!.toFixed(4) }}</span>
          <DialogClose
            class="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/25 hover:text-white"
            aria-label="Close"
          >
            <Icon name="lucide:x" class="size-5" />
          </DialogClose>
        </div>

        <!-- stage -->
        <div
          ref="stage"
          class="relative isolate min-h-0 flex-1 cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing sm:cursor-crosshair"
          tabindex="0"
          aria-label="Inspect stage"
          @pointermove="onPointerMove"
          @pointerdown="onPointerDown"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @pointerleave="onPointerLeave"
          @dblclick="target.zoom > 1 ? setZoom(1) : setZoom(2)"
        >
          <!-- lighting: key light from above, cool rim, floor pool -->
          <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_50%_38%,rgb(46_232_156/.10),transparent_70%)]" />
          <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_40%_30%_at_80%_20%,rgb(63_210_242/.06),transparent_70%)]" />
          <div class="bg-grid pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 opacity-60 [mask-image:linear-gradient(to_top,black,transparent)] [transform:perspective(600px)_rotateX(62deg)] origin-bottom" />
          <div class="pointer-events-none absolute bottom-[16%] left-1/2 -z-10 h-10 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-2xl" />

          <div class="absolute inset-0 grid place-items-center [perspective:1200px]">
            <div ref="model" class="relative w-[min(78%,760px)] will-change-transform [transform-style:preserve-3d]">
              <img
                :src="src"
                :alt="item.title"
                draggable="false"
                class="relative block aspect-[4/3] w-full object-contain drop-shadow-[0_30px_40px_rgb(0_0_0/.7)]"
                :class="failed && 'opacity-30 grayscale'"
                @error="failed = true"
              >
              <!-- sheen masked to the render's own shape -->
              <div
                ref="sheen"
                class="pointer-events-none absolute inset-0 mix-blend-soft-light"
                :style="{
                  backgroundImage: 'linear-gradient(115deg, transparent 30%, rgb(255 255 255 / .55) 48%, transparent 64%)',
                  backgroundSize: '260% 260%',
                  maskImage: `url(${src})`,
                  WebkitMaskImage: `url(${src})`,
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                }"
              />
              <!-- floor reflection -->
              <img
                :src="src"
                alt=""
                aria-hidden="true"
                draggable="false"
                class="pointer-events-none absolute inset-x-0 top-full block aspect-[4/3] w-full -scale-y-100 object-contain opacity-[.14] blur-[1px] [mask-image:linear-gradient(to_top,black,transparent_45%)]"
              >
            </div>
          </div>
        </div>

        <!-- controls -->
        <div class="z-10 flex shrink-0 items-center justify-between gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-5">
          <p class="text-[12px] text-white/35">
            <template v-if="isTouch">Drag to turn · pinch to zoom</template>
            <template v-else>Move to tilt · scroll to zoom · double-click to magnify</template>
          </p>
          <div class="flex items-center gap-1 rounded-full border border-white/10 bg-ink-900/80 p-1">
            <button type="button" class="grid size-8 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-30" :disabled="zoomLabel <= MIN_ZOOM" aria-label="Zoom out" @click="setZoom(target.zoom / 1.25)">
              <Icon name="lucide:minus" class="size-4" />
            </button>
            <span class="w-11 text-center font-mono text-[12px] text-white/70">{{ zoomLabel.toFixed(1) }}×</span>
            <button type="button" class="grid size-8 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-30" :disabled="zoomLabel >= MAX_ZOOM" aria-label="Zoom in" @click="setZoom(target.zoom * 1.25)">
              <Icon name="lucide:plus" class="size-4" />
            </button>
            <span class="mx-0.5 h-5 w-px bg-white/10" />
            <button type="button" class="grid size-8 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/8 hover:text-white" aria-label="Reset view" @click="reset">
              <Icon name="lucide:rotate-ccw" class="size-4" />
            </button>
          </div>
        </div>
      </template>
    </DialogContent>
  </Dialog>
</template>
