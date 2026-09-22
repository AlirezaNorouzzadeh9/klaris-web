<script setup lang="ts">
defineProps<{ query: string }>()
defineEmits<{ clear: [] }>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 px-6 py-16 text-center">
    <Icon name="lucide:search-x" class="size-8 text-white/20" />
    <p class="text-white/60">
      <template v-if="query.trim()">برای «<span class="ltr">{{ query.trim() }}</span>» چیزی پیدا نشد.</template>
      <template v-else>موردی برای نمایش نیست.</template>
    </p>
    <p v-if="query.trim()" class="text-[13px] text-white/35">نام انگلیسی اسکین را امتحان کن؛ مثلاً Fade یا Dragon Lore.</p>
    <button v-if="query.trim()" type="button" class="mt-1 text-[13px] font-semibold text-mint-400 hover:underline" @click="$emit('clear')">
      پاک کردن جستجو
    </button>
  </div>
</template>
