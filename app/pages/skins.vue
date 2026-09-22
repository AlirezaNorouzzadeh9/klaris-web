<script setup lang="ts">
import type { CategoryKey } from '~/types/skins'
import { CATEGORIES } from '~/data/weapons'

useSeoMeta({
  title: 'Loadout',
  description: 'Choose weapon skins, knives, gloves, agents, MVP music and pins for the Klaris CS2 servers.',
})

const route = useRoute()
const router = useRouter()
const keys = CATEGORIES.map(c => c.key)

const category = computed<CategoryKey>({
  get: () => (keys.includes(route.query.tab as CategoryKey) ? (route.query.tab as CategoryKey) : 'skins'),
  set: tab => router.replace({ query: { ...route.query, tab, weapon: undefined, side: undefined } }),
})

const { ensureLoaded } = useLoadout()
onMounted(ensureLoaded)
</script>

<template>
  <!-- right-to-left like the rest of the site; English names inside are isolated with `.ltr` -->
  <div dir="rtl">
    <SkinsHero />
    <SkinsLoadoutShowcase />
    <SkinsCategoryTabs v-model="category" />

    <section id="loadout-browser" class="mx-auto max-w-[1440px] scroll-mt-40 px-4 pt-5 pb-8 sm:px-6 lg:px-10 lg:pt-[22px]">
      <!-- keyed so each view mounts fresh and loads only its own catalog -->
      <SkinsWeaponsView v-if="category === 'skins'" key="skins" :knives="false" />
      <SkinsWeaponsView v-else-if="category === 'knives'" key="knives" :knives="true" />
      <SkinsGlovesView v-else-if="category === 'gloves'" />
      <SkinsAgentsView v-else-if="category === 'agents'" />
      <SkinsCollectionView v-else-if="category === 'music'" key="music" kind="music" />
      <SkinsCollectionView v-else key="pins" kind="pins" />
    </section>

    <!-- one viewer for the whole page; cards and the editor open it via useInspect() -->
    <SkinsInspectViewer />
  </div>
</template>
