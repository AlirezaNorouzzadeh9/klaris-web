<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

/**
 * Page title row: the name of the page on one side, the two actions on the
 * other, a hairline under it. No panel, no counters — the grids below do the
 * talking.
 */
const { resetAll, busy } = useLoadout()
const confirmOpen = ref(false)

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
  <section class="mx-auto max-w-[1440px] px-4 pt-7 sm:px-6 lg:px-10">
    <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-white/8 pb-5">
      <div class="flex items-center gap-3.5">
        <span class="h-11 w-[3px] rounded-full bg-gradient-to-b from-mint-400 to-cyan-k" />
        <div>
          <h1 class="text-[24px] leading-none font-black text-white sm:text-[28px]">لوداوت من</h1>
          <p class="mt-2 text-[12.5px] text-white/45 sm:text-[13px]">
            اسکین، چاقو، دستکش، ایجنت و موسیقی هر تیم را جدا انتخاب کن.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex h-10 items-center gap-2 rounded-lg border border-mint-500/30 bg-mint-500/10 px-3.5 text-[12.5px] font-bold text-mint-300 transition-colors hover:border-mint-500/60 hover:bg-mint-500/15"
          @click="copyCommand"
        >
          <Icon name="lucide:copy" class="size-4" />
          کپی
          <span class="ltr font-mono text-[12px]">!wp</span>
        </button>
        <button
          type="button"
          class="grid size-10 place-items-center rounded-lg border border-white/10 text-white/45 transition-colors hover:border-red-k/50 hover:text-red-k"
          title="ریست لوداوت"
          aria-label="ریست لوداوت"
          @click="confirmOpen = true"
        >
          <Icon name="lucide:rotate-ccw" class="size-4" />
        </button>
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
