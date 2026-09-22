<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

const { configuredCount, resetAll, busy, status } = useLoadout()
const confirmOpen = ref(false)

const equipped = computed(() => (status.value === 'ready' ? String(configuredCount.value) : '—'))

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
  <section class="relative isolate overflow-hidden border-b border-white/8">
    <img
      src="/img/hero-loadout.webp"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 size-full object-cover object-center opacity-45"
    >
    <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(7_9_12/.98)_0%,rgb(7_9_12/.72)_45%,rgb(7_9_12/.86)_100%)]" />
    <div class="bg-grid pointer-events-none absolute inset-0 opacity-15 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
    <div class="pointer-events-none absolute -top-52 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-mint-500/[.08] blur-[150px]" />

    <div class="relative mx-auto grid max-w-[1440px] items-center gap-8 px-4 py-9 sm:px-6 sm:py-12 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-10 lg:py-14">
      <div class="text-right">
        <div class="mb-4 flex items-center justify-end gap-2 text-[11px] font-bold tracking-[0.24em] text-mint-400">
          <span>CS2 · LOADOUT</span>
          <span class="h-px w-8 bg-mint-500/60" />
        </div>

        <h1 class="text-[36px] leading-none font-black tracking-[-0.03em] text-white sm:text-[52px]">لوداوت شخصی تو</h1>
        <p class="mt-4 max-w-[560px] ms-auto text-[13.5px] leading-8 text-white/60 sm:text-[15px]">
          اسکین، چاقو، دستکش، ایجنت و موسیقی MVP مورد علاقه‌ات را انتخاب کن و در همه‌ی سرورهای کلاریس همراهت داشته باش.
        </p>

        <div class="mt-7 flex flex-wrap items-center justify-end gap-2.5">
          <button type="button" class="inline-flex h-11 items-center gap-2 rounded-lg bg-mint-500 px-5 text-[13px] font-bold text-ink-950 shadow-[0_10px_28px_-12px_var(--color-mint-500)] transition-colors hover:bg-mint-400" @click="copyCommand">
            <Icon name="lucide:copy" class="size-4" />
            کپی دستور <span class="ltr font-mono">!wp</span>
          </button>
          <button type="button" class="inline-flex h-11 items-center gap-2 rounded-lg border border-white/12 bg-white/[.03] px-4 text-[13px] font-semibold text-white/65 transition-colors hover:border-red-k/55 hover:text-red-k" @click="confirmOpen = true">
            <Icon name="lucide:rotate-ccw" class="size-4" />
            ریست لوداوت
          </button>
        </div>
      </div>

      <div class="order-first flex items-center justify-end gap-3 lg:order-none lg:flex-col lg:items-stretch lg:gap-2.5">
        <div class="rounded-xl border border-white/10 bg-ink-900/75 px-4 py-3 backdrop-blur-md lg:min-w-[190px]">
          <div class="flex items-center justify-between gap-6">
            <span class="text-[11px] text-white/45">آیتم‌های انتخاب‌شده</span>
            <span class="ltr font-mono text-xl font-bold text-white">{{ equipped }}</span>
          </div>
        </div>
        <div class="hidden items-center gap-2 rounded-xl border border-white/10 bg-ink-900/65 px-4 py-3 text-[11px] text-white/50 backdrop-blur-md sm:flex lg:min-w-[190px]">
          <span class="relative flex size-2 shrink-0"><span class="absolute inset-0 animate-ping rounded-full bg-mint-500/60" /><span class="relative size-2 rounded-full bg-mint-500" /></span>
          فعال روی همه‌ی سرورها
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
