<script setup lang="ts">
/** Icon-only pill under a card: plus to equip, sliders once the item is equipped. */
withDefaults(defineProps<{ active: boolean; label: string; icon: string; disabled?: boolean }>(), { disabled: false })
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :title="label"
    :aria-label="label"
    class="flex h-7 w-full items-center justify-center rounded-[7px] border text-[11.5px] font-semibold transition-all duration-200 disabled:opacity-50"
    :class="active
      ? 'border-brand-500/30 bg-[linear-gradient(90deg,rgb(249_96_15/.22),rgb(255_23_68/.16))] text-brand-300 hover:border-brand-500/55 hover:text-white'
      : 'border-white/10 bg-white/[.02] text-white/60 hover:border-brand-500/45 hover:bg-brand-500/8 hover:text-brand-300'"
  >
    <Icon :name="icon" class="size-4" />
  </button>
</template>
