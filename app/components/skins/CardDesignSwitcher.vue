<script setup lang="ts">
/** Temporary: floating picker to compare the item-card designs on the real grid. */
const { design, setDesign } = useCardDesign()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
    <div class="ltr pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-ink-900/90 p-1 shadow-lift backdrop-blur-md">
      <span class="hidden px-2.5 font-mono text-[10px] font-bold tracking-[.15em] text-white/40 sm:block">CARD</span>
      <button
        v-for="(d, i) in CARD_DESIGNS"
        :key="d.key"
        type="button"
        class="h-8 rounded-full px-3 text-[12px] font-semibold transition-colors"
        :class="design === d.key ? 'bg-mint-500 text-ink-950' : 'text-white/60 hover:text-white'"
        @click="setDesign(d.key)"
      >{{ i + 1 }} · {{ d.label }}</button>
    </div>
  </div>
</template>
