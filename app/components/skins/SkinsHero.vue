<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

/**
 * Header of the skin settings page: what you can do here, the VIP-only
 * collection, the three steps, and the two actions (copy !wp, reset).
 */
const { resetAll, busy } = useLoadout()
const confirmOpen = ref(false)

/** How the page works, in the order you use it. */
const steps = [
  { n: '۱', icon: 'lucide:mouse-pointer-click', title: 'انتخاب کن', text: 'از بین بیش از ۱۴۰۰ اسکین، چاقو، دستکش، ایجنت، موزیک و پین.' },
  { n: '۲', icon: 'lucide:sliders-horizontal', title: 'تنظیمش کن', text: 'کیفیت، پترن، نام‌گذاری، StatTrak، استیکر و charm را خودت مشخص کن.' },
  { n: '۳', icon: 'lucide:zap', title: 'تحویل بگیر', text: 'در چت بازی !wp را بفرست تا همان لحظه و بدون خروج از سرور اعمال شود.' },
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
      <div class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
        <div class="max-w-[680px] text-right">
          <p class="flex items-center gap-3 text-[11px] font-bold tracking-[0.3em] text-brand-500">
            <span class="h-px w-8 bg-brand-500/60" /> KLARIS · CS2
          </p>

          <h1 class="mt-4 text-[30px] leading-[1.3] font-black tracking-[-0.02em] text-white sm:text-[42px]">
            تنظیمات
            <span class="bg-[linear-gradient(90deg,var(--color-brand-red),var(--color-brand-500))] bg-clip-text text-transparent">اسکین</span>
          </h1>

          <p class="mt-5 text-[14px] leading-9 text-white/65 sm:text-[15.5px]">
            اسکین‌هایی که دوست داری را همین‌جا انتخاب کن تا داخل سرورهای کلاریس دستت باشد —
            لازم نیست آن آیتم را در استیم داشته باشی.
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

      <!-- the VIP-only collection: the one thing that is not in the game itself -->
      <div class="mt-8 flex flex-col gap-4 rounded-2xl border border-gold-k/20 bg-[linear-gradient(90deg,rgb(255_215_0/.07),transparent_65%)] p-5 sm:flex-row sm:items-center sm:gap-6">
        <span class="grid size-11 shrink-0 place-items-center rounded-xl border border-gold-k/25 bg-gold-k/10 text-gold-k">
          <Icon name="lucide:crown" class="size-5" />
        </span>
        <div class="min-w-0 flex-1 text-right">
          <p class="text-[15px] font-bold text-white">فراتر از اسکین‌های خود بازی</p>
          <p class="mt-1.5 text-[13px] leading-7 text-white/50">
            جدا از تمام اسکین‌های رسمی CS2، کلاریس یک مجموعه‌ی اختصاصی هم دارد:
            مدل‌های ویژه‌ای که فقط روی سرورهای ما پیدا می‌شوند. دسترسی به آن‌ها با VIP باز می‌شود.
          </p>
        </div>
        <NuxtLink
          to="/vip"
          class="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gold-k px-4 text-[13px] font-bold text-ink-950 transition-opacity hover:opacity-90"
        >
          تهیه VIP
          <Icon name="lucide:arrow-left" class="size-4" />
        </NuxtLink>
      </div>

      <!-- three steps, in the order you use the page -->
      <ol class="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
        <li v-for="s in steps" :key="s.n" class="flex gap-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg border border-brand-500/20 bg-brand-500/10 text-[13px] font-black text-brand-500">{{ s.n }}</span>
          <span>
            <span class="flex items-center gap-1.5 text-[13.5px] font-bold text-white">
              <Icon :name="s.icon" class="size-4 text-white/40" />
              {{ s.title }}
            </span>
            <span class="mt-1 block text-[12.5px] leading-6 text-white/45">{{ s.text }}</span>
          </span>
        </li>
      </ol>

      <p class="mt-6 text-[12.5px] text-white/35">
        برای T و CT انتخاب‌های جدا بگذار. تنظیماتت روی هر سه سرور یکی است.
      </p>
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
