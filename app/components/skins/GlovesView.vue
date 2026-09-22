<script setup lang="ts">
import type { CatalogGlove, EditorItem, SkinConfig, TeamId } from '~/types/skins'
import { TEAMS } from '~/types/skins'
import { finishName, matchesQuery, weaponLabel } from '~/composables/useCatalog'

const { load } = useCatalog()
const { loadout, busy, saveSkin, removeSkin, setGloves } = useLoadout()

const gloves = ref<CatalogGlove[]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
const kit = ref<string>('all')
const query = ref('')
const placeholder = 'جستجوی دستکش… مثلاً Wave Chaser'

async function fetchCatalog() {
  state.value = 'loading'
  try {
    gloves.value = (await load('gloves')).filter(g => g.weapon_defindex !== 0)
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}
onMounted(fetchCatalog)

const kits = computed(() => [...new Set(gloves.value.map(g => weaponLabel(g.paint_name)))])
const visible = computed(() => gloves.value.filter(g =>
  (kit.value === 'all' || weaponLabel(g.paint_name) === kit.value)
  && matchesQuery(g.paint_name, query.value)))

const teamsFor = (g: CatalogGlove): TeamId[] => TEAMS.filter(t =>
  loadout.value.gloves[t] === g.weapon_defindex
  && loadout.value.skins[t][g.weapon_defindex]?.paintId === Number(g.paint))

// ---- editor ----
const editorOpen = ref(false)
const editing = ref<CatalogGlove | null>(null)
const editorItem = computed<EditorItem | null>(() => editing.value && {
  defindex: editing.value.weapon_defindex,
  paintId: Number(editing.value.paint),
  image: editing.value.image,
  title: finishName(editing.value.paint_name),
  caption: weaponLabel(editing.value.paint_name),
})
const editorInitial = computed<SkinConfig | undefined>(() => {
  const d = editing.value?.weapon_defindex
  return d === undefined ? undefined : loadout.value.skins[3][d] ?? loadout.value.skins[2][d]
})

function openEditor(g: CatalogGlove) {
  editing.value = g
  editorOpen.value = true
}

async function onSave(teams: TeamId[], config: SkinConfig) {
  // Gloves need both rows: the kit (wp_player_gloves) and its finish (wp_player_skins).
  if (await saveSkin(teams, config) && await setGloves(teams, config.defindex)) editorOpen.value = false
}

async function onRemove() {
  if (!editing.value) return
  const d = editing.value.weapon_defindex
  const teams = TEAMS.filter(t => loadout.value.gloves[t] === d)
  if (await removeSkin(d) && await setGloves(teams, null)) editorOpen.value = false
}
</script>

<template>
  <div v-if="state === 'error'" class="grid place-items-center gap-3 py-24 text-center text-white/50">
    <Icon name="lucide:wifi-off" class="size-9" />
    <span class="ltr">Could not load the gloves list</span>
    <button type="button" class="text-mint-400 hover:underline" @click="fetchCatalog">Try again</button>
  </div>

  <template v-else>
    <!-- kit chips -->
    <div dir="ltr" class="scrollbar-none -mx-4 mb-[18px] flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      <button
        v-for="k in ['all', ...kits]"
        :key="k"
        type="button"
        class="h-[34px] shrink-0 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors"
        :class="[
          kit === k ? 'border-mint-500/50 bg-mint-500/10 text-mint-300' : 'border-white/8 text-white/50 hover:text-white/80',
        ]"
        @click="kit = k"
      >
        {{ k === 'all' ? 'All' : k.replace('★ ', '') }}
      </button>
    </div>

    <SkinsSearchBar v-model="query" class="mb-3.5" :placeholder="placeholder" />

    <div v-if="state === 'loading'" class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      <div v-for="n in 12" :key="n" class="skeleton h-[168px] rounded-xl" />
    </div>

    <SkinsEmptyResult v-else-if="!visible.length" :query="query" @clear="query = ''" />

    <div v-else class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      <SkinsItemCard
        v-for="g in visible"
        :key="`${g.weapon_defindex}-${g.paint}`"
        :image="g.image"
        :title="finishName(g.paint_name)"
        :kicker="weaponLabel(g.paint_name).toUpperCase()"
        :active-teams="teamsFor(g)"
        @select="openEditor(g)"
      >
        <SkinsCardAction
          :active="teamsFor(g).length > 0"
          :label="teamsFor(g).length ? 'Settings' : 'Select'"
          :icon="teamsFor(g).length ? 'lucide:sliders-horizontal' : 'lucide:plus'"
          @click="openEditor(g)"
        />
      </SkinsItemCard>
    </div>
  </template>

  <SkinsSkinEditor
    v-model:open="editorOpen"
    :item="editorItem"
    kind="glove"
    :initial="editorInitial"
    :initial-teams="editing && teamsFor(editing).length ? teamsFor(editing) : [2, 3]"
    :busy="busy !== null"
    @save="onSave"
    @remove="onRemove"
  />
</template>
