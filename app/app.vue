<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <!-- dir="auto": each toast follows its own text, so English messages keep their punctuation -->
  <Toaster position="bottom-left" dir="auto" rich-colors :toast-options="{ class: 'font-sans' }" />
</template>
