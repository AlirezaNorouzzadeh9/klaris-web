<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

/**
 * Cinematic page header: everything centred on a dark stage — kicker, title,
 * blurb, then the copy-!wp and reset buttons with the equipped / sync chips.
 */
const { configuredCount, resetAll, busy, status } = useLoadout()
const confirmOpen = ref(false)

async function copyCommand() {
  try {
    await navigator.clipboard.writeText('!wp')
    toast.success('کپی شد', { description: 'توی چت بازی !wp رو بفرست.' })
  } catch {
    toast.error('کپی نشد')
  }
}

async function onReset() {
  if (await resetAll()) confirmOpen.value = false
}

const equipped = computed(() => (status.value === 'ready' ? String(configuredCount.value) : '–'))
</script>

<template>
  <section class="relative overflow-hidden border-b border-white/6">
    <!-- stage: grid, a glow above the title and a soft floor light -->
    <div class="bg-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
    <div class="pointer-events-none absolute -top-[220px] left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-mint-500/[.07] blur-[140px]" />
    <div class="pointer-events-none absolute inset-x-0 -bottom-24 h-48 bg-[radial-gradient(60%_100%_at_50%_100%,rgb(46_232_156/.08),transparent_70%)]" />

    <div class="relative mx-auto max-w-[1440px] px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-10">
      <p class="inline-flex items-center gap-2.5 text-[11px] font-bold tracking-[0.32em] text-mint-500">
        <span class="h-px w-5 bg-mint-500/50" /> CS2 · LOADOUT <span class="h-px w-5 bg-mint-500/50" />
      </p>

      <h1 class="mt-3 text-[34px] leading-tight font-black tracking-[-0.02em] text-white drop-shadow-[0_6px_30px_rgb(46_232_156/.15)] sm:text-[52px]">لودات</h1>

      <p class="mx-auto mt-3 max-w-[640px] text-[13.5px] leading-8 text-white/55 sm:text-[15px]">
        برای هر تیم اسکین، چاقو، دستکش، ایجنت و موزیک MVP انتخاب کن.
        <span class="hidden sm:inline">لودات تو روی همه‌ی سرورهای کلاریس یکیه.</span>
      </p>

      <!-- actions -->
      <div class="mt-7 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          class="inline-flex h-10 items-center gap-2 rounded-lg bg-mint-500 px-4 text-[13px] font-bold text-ink-950 shadow-[0_10px_26px_-12px_var(--color-mint-500)] transition-colors hover:bg-mint-400"
          @click="copyCommand"
        >
          <Icon name="lucide:copy" class="size-4" />
          کپی <span class="ltr font-mono">!wp</span>
        </button>
        <button
          type="button"
          class="inline-flex h-10 items-center gap-2 rounded-lg border border-red-k/35 px-4 text-[13px] font-semibold text-red-k/90 transition-colors hover:border-red-k/70 hover:text-red-k"
          @click="confirmOpen = true"
        >
          <Icon name="lucide:rotate-ccw" class="size-4" />
          ریست لودات
        </button>
      </div>

      <!-- state chips -->
      <div class="mt-5 flex flex-wrap items-center justify-center gap-2 text-[12px] text-white/45">
        <span class="inline-flex h-8 items-center gap-2 rounded-full border border-white/8 bg-ink-900/60 px-3.5">
          ست‌شده <span class="ltr font-mono font-bold text-white">{{ equipped }}</span>
        </span>
        <span class="inline-flex h-8 items-center gap-2 rounded-full border border-white/8 bg-ink-900/60 px-3.5">
          <span class="relative flex size-2">
            <span class="absolute inset-0 animate-ping rounded-full bg-mint-500/60" />
            <span class="relative size-2 rounded-full bg-mint-500" />
          </span>
          روی همه‌ی سرورها
        </span>
        <span class="inline-flex h-8 items-center gap-2 rounded-full border border-white/8 bg-ink-900/60 px-3.5">
          <span class="ltr rounded-full bg-mint-500/12 px-2 py-[3px] font-mono text-[11.5px] font-bold text-mint-400">!wp</span>
          بدون ری‌کانکت اعمال می‌شه
        </span>
      </div>
    </div>

    <Dialog v-model:open="confirmOpen">
      <DialogContent dir="rtl" class="border-white/10 bg-ink-900 sm:max-w-md">
        <DialogHeader class="text-start">
          <DialogTitle>کل لودات ریست بشه؟</DialogTitle>
          <DialogDescription class="leading-7">
            همه‌ی اسکین‌ها، چاقو، دستکش، ایجنت، موزیک کیت و پین برای هر دو تیم به حالت پیش‌فرض بازی برمی‌گردن. این کار برگشت‌پذیر نیست.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:justify-end">
          <Button variant="destructive" :disabled="busy === 'reset'" @click="onReset">
            <Icon v-if="busy === 'reset'" name="lucide:loader-2" class="animate-spin" />
            ریست همه چیز
          </Button>
          <DialogClose as-child>
            <Button variant="ghost">انصراف</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>
