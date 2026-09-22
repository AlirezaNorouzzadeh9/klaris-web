<script setup lang="ts">
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const nav = [
  { to: '/', label: 'خانه' },
  { to: '/servers', label: 'سرورها' },
  { to: '/vip', label: 'VIP', ltr: true },
  { to: '/store', label: 'فروشگاه' },
  { to: '/skins', label: 'شخصی‌سازی' },
  { to: '/leaderboard', label: 'رنکینگ' },
  { to: '/rules', label: 'قوانین' },
]

const menuOpen = ref(false)
const route = useRoute()
const scrolled = ref(false)

watch(() => route.fullPath, () => (menuOpen.value = false))

if (import.meta.client) {
  const onScroll = () => (scrolled.value = window.scrollY > 12)
  onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
}
</script>

<template>
  <!-- floating bar: a rounded panel over the page rather than a full-width strip -->
  <header class="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
    <div
      class="mx-auto flex h-16 max-w-[1440px] items-center gap-3 rounded-2xl border px-3 transition-all duration-300 sm:px-4 lg:gap-6"
      :class="scrolled
        ? 'border-white/12 bg-ink-950/92 shadow-[0_18px_50px_-24px_rgb(0_0_0/.95)] backdrop-blur-xl'
        : 'border-white/8 bg-ink-950/70 backdrop-blur-lg'"
    >
      <NuxtLink to="/" class="shrink-0 rounded-md transition-opacity hover:opacity-85 focus-visible:outline-none" aria-label="KLARIS - خانه">
        <KlarisLogo />
      </NuxtLink>

      <nav class="hidden items-center gap-0.5 lg:flex" aria-label="ناوبری اصلی">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="relative inline-flex h-9 items-center rounded-lg px-3 text-[13.5px] font-medium text-white/55 transition-colors hover:text-white"
          active-class="!text-mint-300"
        >
          <span :class="item.ltr ? 'ltr' : ''">{{ item.label }}</span>
          <span class="absolute inset-x-3 -bottom-2 h-0.5 scale-x-0 rounded-full bg-mint-400 transition-transform duration-300 ease-out-quint group-[.router-link-active]:scale-x-100 [.router-link-active_&]:scale-x-100" />
        </NuxtLink>
      </nav>

      <div class="ms-auto flex items-center gap-2">
        <button type="button" class="hidden size-10 place-items-center rounded-xl text-white/60 transition-colors hover:bg-white/5 hover:text-white sm:grid" aria-label="جستجو">
          <Icon name="lucide:search" class="size-[18px]" />
        </button>

        <button type="button" class="relative hidden size-10 place-items-center rounded-xl text-white/60 transition-colors hover:bg-white/5 hover:text-white sm:grid" aria-label="سبد خرید">
          <Icon name="lucide:shopping-cart" class="size-[18px]" />
          <span class="absolute top-1.5 right-1.5 size-2 rounded-full bg-gold-k" />
        </button>

        <button type="button" class="inline-flex h-10 items-center gap-2 rounded-xl bg-mint-500 px-3.5 text-[13px] font-bold text-ink-950 shadow-[0_10px_26px_-14px_var(--color-mint-500)] transition-colors hover:bg-mint-400 sm:px-4">
          <Icon name="simple-icons:steam" class="size-4" />
          <span class="hidden sm:inline">ورود با Steam</span>
        </button>

        <Sheet v-model:open="menuOpen">
          <SheetTrigger as-child>
            <button type="button" class="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-white/80 transition-colors hover:border-mint-500/35 hover:text-mint-300 lg:hidden" aria-label="باز کردن منو">
              <Icon name="lucide:menu" class="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" class="w-[88%] max-w-sm border-white/10 bg-ink-900 p-0 [&>button:last-child]:left-4 [&>button:last-child]:right-auto">
            <SheetTitle class="sr-only">منوی اصلی</SheetTitle>
            <div class="border-b border-white/8 bg-white/[.02] p-5"><KlarisLogo /></div>
            <nav class="flex flex-col gap-1 p-4" aria-label="ناوبری موبایل">
              <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" class="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white" active-class="!bg-mint-500/10 !text-mint-300">
                <span :class="item.ltr ? 'ltr' : ''">{{ item.label }}</span>
                <Icon name="lucide:arrow-up-left" class="size-4 opacity-35" />
              </NuxtLink>
            </nav>
            <div class="mx-4 mt-2 rounded-xl border border-white/8 bg-white/[.025] p-3">
              <div class="flex items-center gap-2.5">
                <span class="grid size-8 place-items-center rounded-lg bg-mint-500/15 text-xs font-black text-mint-300">L</span>
                <div class="leading-tight"><p class="text-sm font-semibold text-white">Lucky</p><p class="mt-1 text-[10px] text-gold-k">VIP · ۲۸ روز</p></div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
