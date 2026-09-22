<script setup lang="ts">
import type { CategoryKey } from '~/types/skins'
import { CATEGORIES } from '~/data/weapons'

useSeoMeta({
  title: 'شخصی‌سازی',
  description: 'اسکین اسلحه، چاقو، دستکش، ایجنت، موزیک MVP و پین خود را در سرورهای Klaris انتخاب کن.',
})

const route = useRoute()
const router = useRouter()
const keys = CATEGORIES.map(c => c.key)

const category = computed<CategoryKey>({
  get: () => (keys.includes(route.query.tab as CategoryKey) ? (route.query.tab as CategoryKey) : 'skins'),
  set: tab => router.replace({ query: { ...route.query, tab } }),
})

const { ensureLoaded } = useLoadout()
onMounted(ensureLoaded)

const hint = computed(() => CATEGORIES.find(c => c.key === category.value)?.hint)
</script>

<template>
  <div>
    <SkinsHero />
    <SkinsCategoryTabs v-model="category" />

    <section class="mx-auto max-w-[1440px] px-4 pt-5 pb-8 sm:px-6 lg:px-10 lg:pt-[22px]">
      <p class="mb-4 text-[13px] text-white/35 lg:hidden">{{ hint }}</p>
      <!-- keyed so each view mounts fresh and loads only its own catalog -->
      <SkinsWeaponsView v-if="category === 'skins'" key="skins" :knives="false" />
      <SkinsWeaponsView v-else-if="category === 'knives'" key="knives" :knives="true" />
      <SkinsGlovesView v-else-if="category === 'gloves'" />
      <SkinsAgentsView v-else-if="category === 'agents'" />
      <SkinsCollectionView v-else-if="category === 'music'" key="music" kind="music" />
      <SkinsCollectionView v-else key="pins" kind="pins" />
    </section>
  </div>
</template>
