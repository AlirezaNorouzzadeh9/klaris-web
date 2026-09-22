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
    <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(270deg,rgb(7_9_12/.15)_0%,rgb(7_9_12/.72)_45%,rgb(7_9_12/.96)_100%)]" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
    <div class="bg-grid pointer-events-none absolute inset-0 opacity-15 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

    <div class="relative mx-auto max-w-[1440px] px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-14 lg:px-10 lg:pt-24 lg:pb-16">
      <div class="max-w-[620px] text-right">
        <p class="flex items-center gap-3 text-[11px] font-bold tracking-[0.3em] text-mint-400">
          <span class="h-px w-8 bg-mint-500/60" /> COUNTER STRIKE 2
        </p>

        <h1 class="mt-5 text-[32px] leading-[1.3] font-black tracking-[-0.02em] text-white sm:text-[46px] lg:text-[52px]">
          کامیونیتی حرفه‌ای
          <span class="mt-1 block text-mint-400 drop-shadow-[0_6px_28px_rgb(46_232_156/.35)]">برای گیمرهای واقعی</span>
        </h1>

        <p class="mt-5 max-w-[520px] text-[13.5px] leading-8 text-white/60 sm:text-[15px]">
          سرورهای پایدار، رقابت‌های جذاب و تجربه‌ای متفاوت در دنیای CS2.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/servers"
            class="inline-flex h-12 items-center gap-2.5 rounded-xl bg-mint-500 px-6 text-[14px] font-bold text-ink-950 shadow-[0_14px_34px_-14px_var(--color-mint-500)] transition-colors hover:bg-mint-400"
          >
            شروع بازی
            <Icon name="lucide:play" class="size-4" />
          </NuxtLink>
          <NuxtLink
            to="/servers"
            class="inline-flex h-12 items-center gap-2.5 rounded-xl border border-white/12 bg-white/[.03] px-5 text-[14px] font-semibold text-white/75 backdrop-blur-sm transition-colors hover:border-mint-500/40 hover:text-white"
          >
            مشاهده سرورها
            <Icon name="lucide:gamepad-2" class="size-4" />
          </NuxtLink>
        </div>
      </div>

      <!-- stats bar -->
      <div class="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[.06] backdrop-blur-md sm:mt-16 lg:grid-cols-4">
        <div
          v-for="s in stats"
          :key="s.label"
          class="flex items-center gap-3 bg-ink-950/80 px-5 py-4"
        >
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-mint-500/10 text-mint-400">
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
