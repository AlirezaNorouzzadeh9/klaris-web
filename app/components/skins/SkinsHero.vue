<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

const { configuredCount, resetAll, busy, status } = useLoadout()
const confirmOpen = ref(false)

async function copyCommand() {
  try {
    await navigator.clipboard.writeText('!wp')
    toast.success('کپی شد', { description: 'در چت بازی بنویس: !wp' })
  } catch {
    toast.error('کپی نشد')
  }
}

async function onReset() {
  if (await resetAll()) confirmOpen.value = false
}
</script>

<template>
  <section class="relative overflow-hidden border-b border-white/6">
    <div class="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    <div class="pointer-events-none absolute -top-40 start-[8%] size-[520px] rounded-full bg-mint-500/[.07] blur-[120px]" />

    <div class="relative mx-auto grid max-w-[1440px] gap-5 px-4 pt-6 pb-5 sm:gap-8 sm:px-6 sm:pt-10 sm:pb-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10 lg:pt-14">
      <div>
        <p class="ltr mb-2 inline-flex items-center gap-2 font-mono text-[10.5px] font-bold tracking-[0.3em] text-mint-500 sm:mb-3 sm:text-[11px]">
          <span class="h-px w-6 bg-mint-500/60" /> LOADOUT · CS2
        </p>
        <h1 class="text-[26px] font-black tracking-tight text-white sm:text-[40px]">شخصی‌سازی</h1>
        <p class="mt-2 max-w-xl text-[13.5px] leading-7 text-white/55 sm:mt-3 sm:text-[15px] sm:leading-8">
          اسکین، چاقو، دستکش، ایجنت و موزیک MVP را برای هر تیم جدا انتخاب کن.
          <span class="hidden sm:inline">انتخاب‌هایت در همهٔ سرورهای Klaris یکسان است.</span>
        </p>

        <button
          type="button"
          class="group mt-4 inline-flex max-w-full items-center gap-2.5 rounded-md border border-white/8 bg-ink-850/80 py-1.5 ps-1.5 pe-3 text-[12.5px] text-white/60 transition-colors hover:border-mint-500/40 sm:mt-5 sm:gap-3 sm:py-2 sm:ps-2 sm:pe-3.5 sm:text-[13px]"
          @click="copyCommand"
        >
          <span class="ltr shrink-0 rounded-sm bg-mint-500/12 px-2 py-1 font-mono text-[12px] font-bold text-mint-400">!wp</span>
          <span class="truncate">
            <span class="sm:hidden">بعد از ذخیره در چت بازی بنویس</span>
            <span class="hidden sm:inline">بعد از ذخیره، این را در چت بازی بنویس تا بدون خروج اعمال شود</span>
          </span>
          <Icon name="lucide:copy" class="size-3.5 shrink-0 text-white/30 transition-colors group-hover:text-mint-400" />
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-stretch sm:gap-2.5">
        <div class="min-w-0 rounded-lg border border-white/7 bg-ink-850/80 px-3 py-2.5 sm:min-w-[132px] sm:px-4 sm:py-3">
          <p class="truncate text-[11px] text-white/40 sm:text-[11.5px]">آیتم‌های فعال</p>
          <p class="mt-1 font-mono text-xl font-bold text-white sm:text-2xl">
            <span v-if="status === 'ready'">{{ configuredCount }}</span>
            <span v-else class="skeleton inline-block h-6 w-8 rounded-sm align-middle" />
          </p>
        </div>
        <div class="min-w-0 rounded-lg border border-white/7 bg-ink-850/80 px-3 py-2.5 sm:min-w-[132px] sm:px-4 sm:py-3">
          <p class="truncate text-[11px] text-white/40 sm:text-[11.5px]">همگام‌سازی</p>
          <p class="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-white sm:gap-2 sm:text-[14px]">
            <span class="relative flex size-2 shrink-0">
              <span class="absolute inset-0 animate-ping rounded-full bg-mint-500/60" />
              <span class="relative size-2 rounded-full bg-mint-500" />
            </span>
            <span class="truncate">همهٔ سرورها</span>
          </p>
        </div>

        <Dialog v-model:open="confirmOpen">
          <DialogTrigger as-child>
            <button
              type="button"
              class="flex min-w-0 flex-col items-start justify-center rounded-lg border border-white/7 bg-ink-850/80 px-3 py-2.5 text-start transition-colors hover:border-red-k/40 hover:bg-red-k/[.05] sm:min-w-[132px] sm:px-4 sm:py-3"
            >
              <span class="truncate text-[11px] text-white/40 sm:text-[11.5px]">پیش‌فرض</span>
              <span class="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-red-k sm:text-[14px]">
                <Icon name="lucide:rotate-ccw" class="size-4 shrink-0" /> ریست همه
              </span>
            </button>
          </DialogTrigger>
          <DialogContent class="border-white/10 bg-ink-900 sm:max-w-md">
            <DialogHeader class="text-start">
              <DialogTitle>همهٔ انتخاب‌ها ریست شود؟</DialogTitle>
              <DialogDescription class="leading-7">
                اسکین همهٔ اسلحه‌ها، چاقو، دستکش، ایجنت، موزیک و پین برای هر دو تیم به حالت پیش‌فرض بازی برمی‌گردد. این کار قابل برگشت نیست.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter class="gap-2 sm:justify-start">
              <Button variant="destructive" :disabled="busy === 'reset'" @click="onReset">
                <Icon v-if="busy === 'reset'" name="lucide:loader-2" class="animate-spin" />
                بله، ریست کن
              </Button>
              <DialogClose as-child>
                <Button variant="ghost">انصراف</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </section>
</template>
