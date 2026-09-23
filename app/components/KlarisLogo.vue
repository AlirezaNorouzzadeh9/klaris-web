<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <span class="ltr inline-flex items-center gap-2.5 select-none" aria-label="KLARIS CS2">
    <svg viewBox="0 0 32 32" class="size-8 shrink-0" aria-hidden="true">
      <path d="M4 3h7v3H7v20h4v3H4z" fill="currentColor" class="text-white/25" />
      <path d="M28 3h-7v3h4v20h-4v3h7z" fill="currentColor" class="text-white/25" />
      <path d="M11 8h4v6.2L20.4 8h4.8l-6.3 7.4L25.6 24h-4.9l-4.6-6.1L15 19.2V24h-4z" class="fill-brand-500" />
    </svg>
    <span v-if="!compact" class="flex flex-col leading-none">
      <span class="text-[17px] font-black tracking-[0.28em] text-white">KLARIS</span>
      <span class="mt-1 font-mono text-[9.5px] font-bold tracking-[0.42em] text-brand-500/80">CS2 · COMMUNITY</span>
    </span>
  </span>
</template>
