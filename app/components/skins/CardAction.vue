<script setup lang="ts">
/** The pill button at the bottom of a skin card: "select" when idle, settings / active when equipped. */
withDefaults(defineProps<{ active: boolean; label: string; icon: string; disabled?: boolean }>(), { disabled: false })
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="flex h-[30px] w-full items-center justify-center gap-[5px] rounded-full text-[11.5px] font-semibold transition-colors disabled:opacity-50"
    :class="active
      ? 'bg-mint-500/12 text-mint-300 hover:bg-mint-500/18'
      : 'border border-white/10 text-white/55 hover:border-mint-500/45 hover:text-mint-300'"
  >
    <Icon :name="icon" class="size-[13px]" />
    {{ label }}
  </button>
</template>
