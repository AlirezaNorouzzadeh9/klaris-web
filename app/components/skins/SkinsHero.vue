<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { CATEGORIES } from '~/data/weapons'

/**
 * Loadout console: a bordered panel with the page title, a live summary of
 * what is equipped per category, and the two things a player does here —
 * copy !wp and reset. No artwork; the grids below are the colourful part.
 */
const { loadout, configuredCount, resetAll, busy, status } = useLoadout()
const confirmOpen = ref(false)
const ready = computed(() => status.value === 'ready')

/** One dot per category, lit when that category has something equipped. */
const slots = computed(() => {
  const l = loadout.value
  const defs = new Set([...Object.keys(l.skins[2]), ...Object.keys(l.skins[3])].map(Number))
  const has = (test: boolean) => test
  return CATEGORIES.map((cat) => {
    switch (cat.key) {
      case 'skins': return { ...cat, on: has([...defs].some(d => d < 500)) }
      case 'knives': return { ...cat, on: has(l.knife[2] !== null || l.knife[3] !== null) }
      case 'gloves': return { ...cat, on: has(l.gloves[2] !== null || l.gloves[3] !== null) }
      case 'agents': return { ...cat, on: has(l.agents[2] !== null || l.agents[3] !== null || l.models[2] !== null || l.models[3] !== null) }
      case 'music': return { ...cat, on: has(l.music[2] !== null || l.music[3] !== null) }
      default: return { ...cat, on: has(l.pins[2] !== null || l.pins[3] !== null) }
    }
  })
})

async function copyCommand() {
  try {
    await navigator.clipboard.writeText('!wp')
    toast.success('کپی شد', { description: 'حالا در چت بازی دستور !wp را بفرست.' })
  } catch {
    toast.error('کپی انجام نشد')
  }
}

async function onReset() {
  if (await resetAll()) confirmOpen.value = false
}
</script>

<template>
  <section class="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-10">
    <div class="relative isolate overflow-hidden rounded-2xl border border-white/8 bg-ink-900">
      <!-- panel skin: mint corner light, diagonal hatching, hairline top edge -->
      <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_120%_at_100%_0%,rgb(46_232_156/.12),transparent_60%)]" />
      <div class="pointer-events-none absolute inset-0 -z-10 opacity-[.07] [background-image:repeating-linear-gradient(135deg,white_0_1px,transparent_1px_9px)]" />
      <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-mint-500/60 to-transparent" />

      <div class="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10 lg:p-8">
        <!-- title -->
        <div>
          <div class="flex items-center gap-2.5">
            <span class="grid size-9 shrink-0 place-items-center rounded-xl border border-mint-500/25 bg-mint-500/10 text-mint-400">
              <Icon name="lucide:layers" class="size-[18px]" />
            </span>
            <div>
              <p class="text-[10.5px] font-bold tracking-[0.28em] text-mint-400">KLARIS · CS2</p>
              <h1 class="text-[22px] leading-tight font-black text-white sm:text-[26px]">لوداوت من</h1>
            </div>
          </div>

          <p class="mt-3.5 max-w-[620px] text-[13px] leading-7 text-white/50 sm:text-[14px]">
            اسکین، چاقو، دستکش، ایجنت و موسیقی MVP هر تیم را جدا انتخاب کن. انتخاب‌هایت روی همه‌ی سرورهای کلاریس یکی است.
          </p>

          <!-- category dots -->
          <ul class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <li v-for="s in slots" :key="s.key" class="flex items-center gap-1.5 text-[12px]">
              <span
                class="size-1.5 rounded-full transition-colors duration-500"
                :class="ready && s.on ? 'bg-mint-400 shadow-[0_0_8px_var(--color-mint-500)]' : 'bg-white/15'"
              />
              <span :class="ready && s.on ? 'text-white/70' : 'text-white/30'">{{ s.label }}</span>
            </li>
          </ul>
        </div>

        <!-- summary + actions -->
        <div class="flex flex-col gap-3 lg:w-[300px]">
          <div class="flex items-stretch gap-2.5">
            <div class="flex-1 rounded-xl border border-white/8 bg-ink-950/60 px-4 py-3">
              <p class="text-[11px] text-white/40">آیتم انتخاب‌شده</p>
              <p class="ltr mt-1 font-mono text-2xl leading-none font-bold text-white">
                <span v-if="ready">{{ configuredCount }}</span>
                <span v-else class="skeleton inline-block h-6 w-8 rounded-sm align-middle" />
              </p>
            </div>
            <div class="flex flex-1 flex-col justify-center rounded-xl border border-white/8 bg-ink-950/60 px-4 py-3">
              <p class="text-[11px] text-white/40">وضعیت</p>
              <p class="mt-1.5 flex items-center gap-2 text-[12.5px] font-semibold text-white">
                <span class="relative flex size-2 shrink-0">
                  <span class="absolute inset-0 animate-ping rounded-full bg-mint-500/60" />
                  <span class="relative size-2 rounded-full bg-mint-500" />
                </span>
                همه‌ی سرورها
              </p>
            </div>
          </div>

          <button
            type="button"
            class="group flex h-11 items-center justify-between rounded-xl bg-mint-500 px-4 text-[13px] font-bold text-ink-950 shadow-[0_12px_30px_-14px_var(--color-mint-500)] transition-colors hover:bg-mint-400"
            @click="copyCommand"
          >
            <span class="flex items-center gap-2">
              <Icon name="lucide:copy" class="size-4" />
              کپی دستور
            </span>
            <span class="ltr rounded-md bg-ink-950/15 px-2 py-0.5 font-mono text-[12px]">!wp</span>
          </button>

          <div class="flex items-center justify-between gap-3 text-[12px]">
            <p class="text-white/35">بدون ری‌کانکت اعمال می‌شود.</p>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 font-semibold text-red-k/80 transition-colors hover:text-red-k"
              @click="confirmOpen = true"
            >
              <Icon name="lucide:rotate-ccw" class="size-3.5" />
              ریست لوداوت
            </button>
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:open="confirmOpen">
      <DialogContent dir="rtl" class="border-white/10 bg-ink-900 sm:max-w-md">
        <DialogHeader class="text-start">
          <DialogTitle>لوداوت ریست شود؟</DialogTitle>
          <DialogDescription class="leading-7">
            همه‌ی انتخاب‌های اسکین، چاقو، دستکش، ایجنت، موسیقی و پین برای هر دو تیم به حالت پیش‌فرض برمی‌گردد. این کار برگشت‌پذیر نیست.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:justify-end">
          <Button variant="destructive" :disabled="busy === 'reset'" @click="onReset">
            <Icon v-if="busy === 'reset'" name="lucide:loader-2" class="animate-spin" />
            ریست همه‌چیز
          </Button>
          <DialogClose as-child><Button variant="ghost">انصراف</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>
