<script setup lang="ts">
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { wearTierOf } from '~/data/weapons'

/**
 * Pseudo-3D inspect view for any catalog render. Drag (mouse or finger) spins
 * the item all the way round and it keeps the angle you leave it at, with a
 * little inertia; wheel / pinch / double-click / buttons zoom toward the
 * pointer. A sheen follows the angle across the front face.
 * Left alone for a few seconds it turns slowly, like a shop turntable.
 */
const { item, open } = useInspect()

const MAX_X = 22 // degrees up / down; left / right spins freely
const MIN_ZOOM = 1
const MAX_ZOOM = 3
const IDLE_MS = 4000
const TURNTABLE_DEG_PER_S = 24
const DRAG_Y = 0.45 // degrees per pixel
const DRAG_X = 0.3

/**
 * The render is stacked into thin layers to fake thickness: seen edge-on the
 * darkened middle layers read as the item's body instead of a paper-thin line,
 * and the back layer shows the (mirrored) render when the item faces away.
 */
const LAYER_COUNT = 12
const DEPTH_PX = 18
const layers = Array.from({ length: LAYER_COUNT }, (_, i) => {
  const z = -DEPTH_PX / 2 + (i * DEPTH_PX) / (LAYER_COUNT - 1)
  const face = i === 0 || i === LAYER_COUNT - 1
  return { z, face, front: i === LAYER_COUNT - 1 }
})

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
  // face front again by the shortest way, not by unwinding every spin
  const front = Math.round(current.ry / 360) * 360
  Object.assign(target, { rx: 0, ry: front, zoom: 1, ox: 50, oy: 50 })
  velocity.x = velocity.y = 0
  lastInput = performance.now()
}

function setZoom(z: number) {
  target.zoom = clamp(z, MIN_ZOOM, MAX_ZOOM)
  if (target.zoom === 1) Object.assign(target, { ox: 50, oy: 50 })
  lastInput = performance.now()
}

let lastFrame = 0

function tick(now: number) {
  // frame-rate independent step (1 = one 60 Hz frame), capped after a stall
  const step = lastFrame ? Math.min((now - lastFrame) / 16.67, 4) : 1
  lastFrame = now

  if (!dragging && (velocity.x || velocity.y)) {
    // coast after a flick; a hard flick spins a few times
    target.ry += velocity.x * step
    target.rx = clamp(target.rx + velocity.y * step, -MAX_X, MAX_X)
    const decay = 0.94 ** step
    velocity.x *= decay
    velocity.y *= decay
    if (Math.abs(velocity.x) < 0.02 && Math.abs(velocity.y) < 0.02) velocity.x = velocity.y = 0
  }
  else if (!reduced && !dragging && now - lastInput > IDLE_MS && target.zoom === 1) {
    // idle: slow turntable, levelling out the vertical tilt
    target.ry += (TURNTABLE_DEG_PER_S / 60) * step
    target.rx += (0 - target.rx) * 0.05 * step
  }
  const k = reduced ? 1 : 1 - 0.86 ** step
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
    // light sweeps across the face as the model turns
    const x = 50 + Math.sin((current.ry * Math.PI) / 180) * 45
    const y = 40 - (current.rx / MAX_X) * 35
    sheen.value.style.backgroundPosition = `${x}% ${y}%`
  }
  zoomLabel.value = Math.round(current.zoom * 10) / 10
  frame = requestAnimationFrame(tick)
}

// ---- input: drag to turn (mouse and touch), two fingers to pinch ----
const pointers = new Map<number, { x: number; y: number }>()
const velocity = { x: 0, y: 0 }
let dragging = false
let pinchStart = 0
let zoomAtPinch = 1

/** Zoom toward a screen point, like a loupe. */
function aimAt(clientX: number, clientY: number) {
  const r = stage.value?.getBoundingClientRect()
  if (!r) return
  target.ox = clamp(((clientX - r.left) / r.width) * 100, 0, 100)
  target.oy = clamp(((clientY - r.top) / r.height) * 100, 0, 100)
}

function onPointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  if (e.pointerType !== 'mouse') isTouch.value = true
  stage.value?.setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  dragging = true
  velocity.x = velocity.y = 0
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    pinchStart = Math.hypot(a!.x - b!.x, a!.y - b!.y)
    zoomAtPinch = target.zoom
  }
  lastInput = performance.now()
}

function onPointerMove(e: PointerEvent) {
  const prev = pointers.get(e.pointerId)
  if (!prev) return
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  lastInput = performance.now()

  if (pointers.size >= 2) {
    const [a, b] = [...pointers.values()]
    if (pinchStart) {
      aimAt((a!.x + b!.x) / 2, (a!.y + b!.y) / 2)
      setZoom(zoomAtPinch * (Math.hypot(a!.x - b!.x, a!.y - b!.y) / pinchStart))
    }
    return
  }

  const dy = (e.clientX - prev.x) * DRAG_Y
  const dx = -(e.clientY - prev.y) * DRAG_X
  target.ry += dy // no limit: spins all the way round
  target.rx = clamp(target.rx + dx, -MAX_X, MAX_X)
  // remember the last flick for inertia
  velocity.x = dy * 0.6
  velocity.y = dx * 0.6
}

function onPointerUp(e: PointerEvent) {
  pointers.delete(e.pointerId)
  if (pointers.size < 2) pinchStart = 0
  if (!pointers.size) {
    dragging = false
    lastInput = performance.now()
  }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  aimAt(e.clientX, e.clientY)
  setZoom(target.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15))
}

function onDoubleClick(e: MouseEvent) {
  aimAt(e.clientX, e.clientY)
  setZoom(target.zoom > 1 ? 1 : 2)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') target.ry -= 15
  else if (e.key === 'ArrowRight') target.ry += 15
  else if (e.key === 'ArrowUp') target.rx = clamp(target.rx + 6, -MAX_X, MAX_X)
  else if (e.key === 'ArrowDown') target.rx = clamp(target.rx - 6, -MAX_X, MAX_X)
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
  Object.assign(current, { rx: 0, ry: 0, zoom: 1, ox: 50, oy: 50 })
  reset()
  lastFrame = 0
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
            <DialogDescription class="sr-only">Inspect view. Drag or use the arrow keys to rotate; scroll, pinch or use plus and minus to zoom.</DialogDescription>
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
          class="relative isolate min-h-0 flex-1 cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing"
          tabindex="0"
          aria-label="Inspect stage"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @dblclick="onDoubleClick"
        >
          <!-- lighting: key light from above, cool rim, floor pool -->
          <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_50%_38%,rgb(46_232_156/.10),transparent_70%)]" />
          <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_40%_30%_at_80%_20%,rgb(63_210_242/.06),transparent_70%)]" />
          <div class="bg-grid pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 opacity-60 [mask-image:linear-gradient(to_top,black,transparent)] [transform:perspective(600px)_rotateX(62deg)] origin-bottom" />
          <div class="pointer-events-none absolute bottom-[16%] left-1/2 -z-10 h-10 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-2xl" />

          <div class="absolute inset-0 grid place-items-center [perspective:1200px]">
            <div ref="model" class="relative aspect-[4/3] w-[min(78%,760px)] will-change-transform [transform-style:preserve-3d]">
              <!-- stacked layers: two faces plus a darkened body between them -->
              <img
                v-for="(layer, i) in layers"
                :key="i"
                :src="src"
                :alt="layer.front ? item.title : ''"
                :aria-hidden="!layer.front"
                draggable="false"
                class="absolute inset-0 block size-full object-contain"
                :class="[
                  layer.front && 'drop-shadow-[0_30px_40px_rgb(0_0_0/.7)]',
                  !layer.face && 'brightness-[.3] saturate-50',
                  failed && 'opacity-30 grayscale',
                ]"
                :style="{ transform: `translateZ(${layer.z}px)` }"
                @error="layer.front && (failed = true)"
              >
              <!-- sheen on the front face only, masked to the render's own shape -->
              <div
                ref="sheen"
                class="pointer-events-none absolute inset-0 mix-blend-soft-light [backface-visibility:hidden]"
                :style="{
                  transform: `translateZ(${DEPTH_PX / 2 + 0.5}px)`,
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
            </div>
          </div>
        </div>

        <!-- controls -->
        <div class="z-10 flex shrink-0 items-center justify-between gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-5">
          <p class="text-[12px] text-white/35">
            <template v-if="isTouch">Drag to spin · pinch to zoom</template>
            <template v-else>Drag to spin · scroll to zoom · double-click to magnify</template>
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
