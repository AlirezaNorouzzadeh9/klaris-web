<script setup lang="ts">
/** Grid heading: title and count on the start side, pill search on the end side (desktop only). */
defineProps<{ title: string; placeholder: string }>()
const query = defineModel<string>('query', { required: true })
</script>

<template>
  <div class="mb-3.5 flex items-end justify-between gap-4">
    <div class="min-w-0">
      <h2 class="text-lg font-black text-white sm:text-xl">{{ title }}</h2>
      <p class="mt-[3px] text-[12.5px] text-white/40"><slot /></p>
    </div>
    <SkinsSearchBar v-model="query" size="md" class="hidden w-[340px] shrink-0 lg:block" :placeholder="placeholder" />
  </div>
</template>
