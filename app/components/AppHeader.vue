<script setup lang="ts">
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const nav = [
  { to: '/', label: 'خانه' },
  { to: '/servers', label: 'سرورها' },
  { to: '/vip', label: 'VIP' },
  { to: '/skins', label: 'شخصی‌سازی' },
  { to: '/leaderboard', label: 'رنکینگ' },
  { to: '/rules', label: 'قوانین' },
]

const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (menuOpen.value = false))

const scrolled = ref(false)
if (import.meta.client) {
  const onScroll = () => (scrolled.value = window.scrollY > 8)
  onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300"
    :class="scrolled ? 'border-white/8 bg-ink-950/85 backdrop-blur-md' : 'border-transparent bg-ink-950/40'"
  >
    <div class="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-10">
      <NuxtLink to="/" class="shrink-0 rounded-sm" aria-label="KLARIS - خانه">
        <KlarisLogo />
      </NuxtLink>

      <nav class="hidden items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="group relative rounded-sm px-3 py-2 text-[14px] font-medium text-white/60 transition-colors hover:text-white"
          active-class="!text-white"
        >
          {{ item.label }}
          <span
            class="absolute inset-x-3 -bottom-[13px] h-px scale-x-0 bg-mint-500 transition-transform duration-300 ease-out-quint group-[.router-link-active]:scale-x-100"
          />
        </NuxtLink>
      </nav>

      <div class="ms-auto flex items-center gap-2">
        <!-- Mock signed-in player; real Steam OpenID comes with the backend. -->
        <button
          type="button"
          class="hidden items-center gap-2.5 rounded-md border border-white/8 bg-white/[.03] py-1.5 ps-1.5 pe-3 transition-colors hover:border-white/15 sm:flex"
        >
          <span class="grid size-7 place-items-center rounded-sm bg-gradient-to-br from-mint-500/30 to-cyan-k/20 text-[11px] font-black text-mint-300">L</span>
          <span class="flex flex-col items-start leading-tight">
            <span class="text-[13px] font-semibold text-white">Lucky</span>
            <span class="text-[10.5px] font-semibold text-gold-k">VIP · ۲۸ روز</span>
          </span>
          <Icon name="lucide:chevron-down" class="size-3.5 text-white/40" />
        </button>

        <Sheet v-model:open="menuOpen">
          <SheetTrigger as-child>
            <button type="button" class="grid size-10 place-items-center rounded-md border border-white/8 text-white/80 lg:hidden" aria-label="منو">
              <Icon name="lucide:menu" class="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" class="w-[84%] max-w-xs border-white/8 bg-ink-900 p-0 [&>button:last-child]:left-4 [&>button:last-child]:right-auto">
            <SheetTitle class="sr-only">منو</SheetTitle>
            <div class="border-b border-white/6 p-5"><KlarisLogo /></div>
            <nav class="flex flex-col p-3" aria-label="ناوبری موبایل">
              <NuxtLink
                v-for="item in nav"
                :key="item.to"
                :to="item.to"
                class="rounded-md px-3 py-3 text-[15px] font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                active-class="!bg-mint-500/10 !text-mint-300"
              >
                {{ item.label }}
              </NuxtLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
