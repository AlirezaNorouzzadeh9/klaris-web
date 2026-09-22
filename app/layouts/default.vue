<template>
  <div class="relative flex min-h-dvh flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <footer class="border-t border-white/6 py-8">
      <div class="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 text-[13px] text-white/40 sm:flex-row sm:px-6 lg:px-10">
        <KlarisLogo compact />
        <p>KLARIS وابسته به Valve Corporation نیست.</p>
      </div>
    </footer>
  </div>
</template>
