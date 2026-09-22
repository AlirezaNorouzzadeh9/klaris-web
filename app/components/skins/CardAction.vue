<script setup lang="ts">
/** The pill button at the bottom of a skin card: "select" when idle, settings / active when equipped. */
withDefaults(defineProps<{ active: boolean; label: string; icon: string; disabled?: boolean }>(), { disabled: false })
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="flex h-7 w-full items-center justify-center gap-1.5 rounded-[7px] text-[11.5px] font-semibold transition-colors disabled:opacity-50"
    :class="active
      ? 'border border-mint-500/30 bg-[linear-gradient(90deg,rgb(46_232_156/.2),rgb(63_210_242/.14))] text-mint-300 hover:border-mint-500/55 hover:text-white'
      : 'border border-white/10 bg-white/[.02] text-white/60 hover:border-mint-500/45 hover:bg-mint-500/8 hover:text-mint-300'"
  >
    <Icon :name="icon" class="size-[13px]" />
    {{ label }}
  </button>
</template>
