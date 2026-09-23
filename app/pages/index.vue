<script setup lang="ts">
useSeoMeta({
  title: 'کلاریس · کامیونیتی CS2',
  description: 'سرورهای پابلیک و رقابتی CS2 با پینگ پایین، رنکینگ و شخصی‌سازی کامل لوداوت.',
})

/** Live numbers land here once the API exists; these are the mock values. */
const stats = [
  { icon: 'lucide:server', value: '۳', label: 'سرور فعال' },
  { icon: 'lucide:users', value: '۴۲۱', label: 'بازیکن آنلاین' },
  { icon: 'lucide:map', value: '۱۲', label: 'مپ مختلف' },
  { icon: 'lucide:activity', value: '28ms', label: 'میانگین پینگ', ltr: true },
]

/** What the community actually offers, said in one line each. */
const highlights = [
  { icon: 'lucide:gauge', title: 'پینگ پایین', text: 'سرورها داخل ایران میزبانی می‌شوند، پس بدون لگ و قطعی بازی می‌کنی.' },
  { icon: 'lucide:paintbrush', title: 'شخصی‌سازی کامل', text: 'اسکین، چاقو، دستکش، ایجنت، استیکر و موزیک MVP را خودت انتخاب کن.' },
  { icon: 'lucide:trophy', title: 'رنک و آمار', text: 'کیل، دث، دقت و امتیازت ذخیره می‌شود و جایگاهت را بین بقیه می‌بینی.' },
]
</script>

<template>
  <section class="relative isolate overflow-hidden">
    <!-- artwork -->
    <img
      src="/img/hero-home.webp"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 size-full object-cover object-center"
    >
    <!-- the text side stays readable: dark from the right, lighter over the artwork -->
    <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(270deg,rgb(17_19_23/.2)_0%,rgb(17_19_23/.74)_45%,rgb(17_19_23/.97)_100%)]" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink-950 to-transparent" />
    <div class="bg-grid pointer-events-none absolute inset-0 opacity-15 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

    <div class="relative mx-auto flex min-h-[calc(100dvh-56px)] max-w-[1560px] flex-col justify-center px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div class="max-w-[680px] text-right">
        <p class="flex items-center gap-3 text-[11px] font-bold tracking-[0.3em] text-brand-500">
          <span class="h-px w-8 bg-brand-500/60" /> COUNTER STRIKE 2
        </p>

        <h1 class="mt-5 text-[34px] leading-[1.28] font-black tracking-[-0.02em] text-white sm:text-[50px] lg:text-[58px]">
          کامیونیتی حرفه‌ای
          <span class="mt-1 block bg-[linear-gradient(90deg,var(--color-brand-red),var(--color-brand-500))] bg-clip-text text-transparent">برای گیمرهای واقعی</span>
        </h1>

        <p class="mt-6 max-w-[600px] text-[14px] leading-9 text-white/65 sm:text-[16px]">
          کلاریس یک کامیونیتی ایرانی CS2 است: چند سرور پابلیک و رقابتی با پینگ پایین،
          رنکینگ زنده‌ی بازیکن‌ها و یک پنل کامل برای شخصی‌سازی لوداوت.
        </p>
        <p class="mt-3 max-w-[600px] text-[13px] leading-8 text-white/45 sm:text-[14.5px]">
          با اکانت استیم وارد شو، اسکین و چاقو و دستکشت را انتخاب کن و همان لحظه داخل بازی
          با دستور <span class="ltr rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-[12.5px] text-brand-400">!wp</span>
          تحویلش بگیر — بدون خروج از سرور.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/servers"
            class="inline-flex h-12 items-center gap-2.5 rounded-xl bg-[linear-gradient(135deg,var(--color-brand-red),var(--color-brand-500))] px-6 text-[14px] font-bold text-white shadow-[0_14px_34px_-14px_var(--color-brand-red)] transition-opacity hover:opacity-90"
          >
            شروع بازی
            <Icon name="lucide:play" class="size-4" />
          </NuxtLink>
          <NuxtLink
            to="/skins"
            class="inline-flex h-12 items-center gap-2.5 rounded-xl border border-white/12 bg-white/[.04] px-5 text-[14px] font-semibold text-white/80 backdrop-blur-sm transition-colors hover:border-brand-500/45 hover:text-white"
          >
            شخصی‌سازی لوداوت
            <Icon name="lucide:paintbrush" class="size-4" />
          </NuxtLink>
        </div>

        <!-- what you get, in three lines -->
        <ul class="mt-10 grid gap-4 sm:grid-cols-3">
          <li v-for="h in highlights" :key="h.title" class="flex gap-3">
            <span class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-500">
              <Icon :name="h.icon" class="size-[18px]" />
            </span>
            <span>
              <span class="block text-[13.5px] font-bold text-white">{{ h.title }}</span>
              <span class="mt-1 block text-[12.5px] leading-6 text-white/45">{{ h.text }}</span>
            </span>
          </li>
        </ul>
      </div>

      <!-- stats bar -->
      <div class="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[.06] backdrop-blur-md sm:mt-14 lg:grid-cols-4">
        <div
          v-for="s in stats"
          :key="s.label"
          class="flex items-center gap-3 bg-ink-950/85 px-5 py-4"
        >
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
            <Icon :name="s.icon" class="size-5" />
          </span>
          <span class="min-w-0">
            <span class="block text-[20px] font-black text-white" :class="s.ltr && 'ltr'">{{ s.value }}</span>
            <span class="block truncate text-[12px] text-white/45">{{ s.label }}</span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
