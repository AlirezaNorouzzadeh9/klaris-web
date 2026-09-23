<script setup lang="ts">
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const nav = [
  { to: '/', label: 'خانه' },
  { to: '/servers', label: 'سرورها' },
  { to: '/vip', label: 'VIP', ltr: true },
  { to: '/store', label: 'فروشگاه' },
  { to: '/skins', label: 'تنظیمات اسکین' },
  { to: '/leaderboard', label: 'رنکینگ' },
  { to: '/rules', label: 'قوانین' },
]

const menuOpen = ref(false)
const route = useRoute()

watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <!-- one flat bar across the top, like the arena sites: nav, player search, sign in -->
  <header class="sticky top-0 z-40 border-b border-white/8 bg-ink-950/95 backdrop-blur-md">
    <div class="mx-auto flex h-14 max-w-[1560px] items-center gap-4 px-4 sm:px-6 lg:gap-7 lg:px-8">
      <NuxtLink to="/" class="shrink-0 rounded-md transition-opacity hover:opacity-85 focus-visible:outline-none" aria-label="KLARIS - خانه">
        <KlarisLogo compact />
      </NuxtLink>

      <nav class="hidden items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="inline-flex h-8 items-center rounded-md px-2.5 text-[13px] font-medium text-white/60 transition-colors hover:text-white"
          active-class="!text-brand-500"
        >
          <span :class="item.ltr ? 'ltr' : ''">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="ms-auto flex items-center gap-2.5">
        <div class="relative hidden md:block">
          <Icon name="lucide:search" class="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            placeholder="جستجوی بازیکن…"
            aria-label="جستجوی بازیکن"
            class="h-9 w-56 rounded-lg border border-white/10 bg-ink-900 ps-9 pe-3 text-[12.5px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand-500/60 [&::-webkit-search-cancel-button]:appearance-none"
          >
        </div>

        <span class="hidden items-center gap-1.5 text-[11.5px] text-white/40 lg:flex">
          <span class="size-2 rounded-full bg-green-k" />
          آنلاین
        </span>

        <button
          type="button"
          class="inline-flex h-9 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--color-brand-red),var(--color-brand-500))] px-4 text-[12.5px] font-bold text-white shadow-[0_8px_22px_-12px_var(--color-brand-red)] transition-opacity hover:opacity-90"
        >
          <Icon name="simple-icons:steam" class="size-4" />
          <span class="hidden sm:inline">ورود</span>
        </button>

        <Sheet v-model:open="menuOpen">
          <SheetTrigger as-child>
            <button type="button" class="grid size-9 place-items-center rounded-lg border border-white/10 text-white/75 transition-colors hover:border-brand-500/45 hover:text-brand-500 lg:hidden" aria-label="باز کردن منو">
              <Icon name="lucide:menu" class="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" class="w-[88%] max-w-sm border-white/10 bg-ink-900 p-0 [&>button:last-child]:left-4 [&>button:last-child]:right-auto">
            <SheetTitle class="sr-only">منوی اصلی</SheetTitle>
            <div class="border-b border-white/8 bg-white/[.02] p-5"><KlarisLogo /></div>
            <nav class="flex flex-col gap-1 p-4" aria-label="ناوبری موبایل">
              <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" class="flex items-center justify-between rounded-lg px-4 py-3.5 text-[15px] font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white" active-class="!bg-brand-500/10 !text-brand-500">
                <span :class="item.ltr ? 'ltr' : ''">{{ item.label }}</span>
                <Icon name="lucide:arrow-up-left" class="size-4 opacity-35" />
              </NuxtLink>
            </nav>
            <div class="mx-4 mt-2 rounded-lg border border-white/8 bg-white/[.025] p-3">
              <div class="flex items-center gap-2.5">
                <span class="grid size-8 place-items-center rounded-lg bg-brand-500/15 text-xs font-black text-brand-400">L</span>
                <div class="leading-tight"><p class="text-sm font-semibold text-white">Lucky</p><p class="mt-1 text-[10px] text-gold-k">VIP · ۲۸ روز</p></div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
