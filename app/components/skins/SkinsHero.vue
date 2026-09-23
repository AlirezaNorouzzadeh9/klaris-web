<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

/**
 * Header of the loadout page: what this page is for, how the change reaches
 * the server, and the two actions (copy !wp, reset).
 */
const { resetAll, busy } = useLoadout()
const confirmOpen = ref(false)

/** The three things worth knowing before touching the grids. */
const notes = [
  { icon: 'lucide:users', title: 'جدا برای هر تیم', text: 'برای T و CT اسکین‌های متفاوت بگذار؛ هر کدام جداگانه ذخیره می‌شود.' },
  { icon: 'lucide:sliders-horizontal', title: 'تنظیم دقیق هر اسکین', text: 'کیفیت، پترن، نام‌گذاری، StatTrak، استیکر و charm را خودت مشخص کن.' },
  { icon: 'lucide:zap', title: 'اعمال فوری داخل بازی', text: 'بعد از ذخیره، در چت بازی !wp را بفرست تا بدون خروج از سرور تحویل بگیری.' },
]

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
    <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_85%_0%,rgb(249_96_15/.12),transparent_60%)]" />
    <div class="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

    <div class="mx-auto max-w-[1560px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div class="max-w-[680px] text-right">
          <p class="flex items-center gap-3 text-[11px] font-bold tracking-[0.3em] text-brand-500">
            <span class="h-px w-8 bg-brand-500/60" /> KLARIS · CS2
          </p>

          <h1 class="mt-4 text-[30px] leading-[1.3] font-black tracking-[-0.02em] text-white sm:text-[42px]">
            لوداوت
            <span class="bg-[linear-gradient(90deg,var(--color-brand-red),var(--color-brand-500))] bg-clip-text text-transparent">شخصی تو</span>
          </h1>

          <p class="mt-5 text-[14px] leading-9 text-white/65 sm:text-[15.5px]">
            اینجا ظاهر تو داخل سرورهای کلاریس ساخته می‌شود: اسکین هر اسلحه، چاقو، دستکش،
            ایجنت، موزیک MVP و پین. لازم نیست آیتم‌ها را در استیم داشته باشی — روی سرورهای ما
            هر چیزی را می‌توانی انتخاب کنی.
          </p>
          <p class="mt-3 text-[13px] leading-8 text-white/45 sm:text-[14px]">
            انتخاب‌هایت ذخیره می‌شود و روی هر سه سرور یکی است. برای دیدن تغییر، کافی است در چت بازی
            <span class="ltr rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-[12.5px] text-brand-400">!wp</span>
            را بفرستی.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="inline-flex h-11 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--color-brand-red),var(--color-brand-500))] px-4 text-[13px] font-bold text-white shadow-[0_12px_30px_-14px_var(--color-brand-red)] transition-opacity hover:opacity-90"
            @click="copyCommand"
          >
            <Icon name="lucide:copy" class="size-4" />
            کپی دستور
            <span class="ltr rounded-md bg-black/15 px-1.5 py-0.5 font-mono text-[12px]">!wp</span>
          </button>
          <button
            type="button"
            class="inline-flex h-11 items-center gap-2 rounded-xl border border-white/12 px-3.5 text-[12.5px] font-semibold text-white/55 transition-colors hover:border-red-k/50 hover:text-red-k"
            @click="confirmOpen = true"
          >
            <Icon name="lucide:rotate-ccw" class="size-4" />
            <span class="hidden sm:inline">ریست</span>
          </button>
        </div>
      </div>

      <ul class="mt-9 grid gap-4 sm:grid-cols-3 sm:gap-6">
        <li v-for="n in notes" :key="n.title" class="flex gap-3">
          <span class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-500">
            <Icon :name="n.icon" class="size-[18px]" />
          </span>
          <span>
            <span class="block text-[13.5px] font-bold text-white">{{ n.title }}</span>
            <span class="mt-1 block text-[12.5px] leading-6 text-white/45">{{ n.text }}</span>
          </span>
        </li>
      </ul>
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
