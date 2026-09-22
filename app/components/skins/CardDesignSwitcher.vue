<script setup lang="ts">
/** Temporary: floating picker for the header layout and the equipped-card style. */
const { design, setDesign } = useCardDesign()
const { hero, setHero } = useHeroDesign()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
    <div class="ltr pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/10 bg-ink-900/90 p-1.5 shadow-lift backdrop-blur-md">
      <span class="px-2 font-mono text-[10px] font-bold tracking-[.15em] text-white/40">HEADER</span>
      <button
        v-for="(d, i) in HERO_DESIGNS"
        :key="d.key"
        type="button"
        class="h-8 rounded-full px-3 text-[12px] font-semibold transition-colors"
        :class="hero === d.key ? 'bg-cyan-k text-ink-950' : 'text-white/60 hover:text-white'"
        @click="setHero(d.key)"
      >{{ i + 1 }} · {{ d.label }}</button>

      <span class="mx-1 h-6 w-px bg-white/10" />

      <span class="px-2 font-mono text-[10px] font-bold tracking-[.15em] text-white/40">EQUIPPED</span>
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
