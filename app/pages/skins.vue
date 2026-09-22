<script setup lang="ts">
import type { CategoryKey } from '~/types/skins'
import { TEAMS } from '~/types/skins'
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

const { loadout, ensureLoaded } = useLoadout()
onMounted(ensureLoaded)

const counts = computed<Partial<Record<CategoryKey, number>>>(() => {
  const l = loadout.value
  const perSide = (slot: Record<2 | 3, unknown>) => TEAMS.filter(t => slot[t] !== null).length
  // Knife and glove finishes also live in skins, so only count real weapons there.
  const weaponDefs = new Set(TEAMS.flatMap(t => Object.keys(l.skins[t]).map(Number)).filter(d => d < 500))
  return {
    skins: weaponDefs.size,
    knives: perSide(l.knife),
    gloves: perSide(l.gloves),
    agents: perSide(l.agents),
    music: perSide(l.music),
    pins: perSide(l.pins),
  }
})

const hint = computed(() => CATEGORIES.find(c => c.key === category.value)?.hint)
</script>

<template>
  <div>
    <SkinsHero />
    <SkinsCategoryTabs v-model="category" :counts="counts" />

    <section class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <p class="mb-5 text-[13px] text-white/35 lg:hidden">{{ hint }}</p>
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
