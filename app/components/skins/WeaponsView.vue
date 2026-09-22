<script setup lang="ts">
import type { CatalogSkin, EditorItem, SkinConfig, TeamId } from '~/types/skins'
import { TEAMS } from '~/types/skins'
import { finishName, matchesQuery, weaponLabel, weaponsFrom, type WeaponEntry } from '~/composables/useCatalog'
import { ALL_WEAPONS, weaponClassOf } from '~/data/weapons'

const props = defineProps<{ knives: boolean }>()
const PAGE = 60

const { load } = useCatalog()
const { loadout, busy, saveSkin, removeSkin, setKnife } = useLoadout()

const catalog = ref<CatalogSkin[]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
const weapons = ref<WeaponEntry[]>([])
/** A weapon defindex, or ALL_WEAPONS; -1 until the catalog has loaded. */
const selected = ref<number>(-1)
const query = ref('')

async function fetchCatalog() {
  state.value = 'loading'
  try {
    catalog.value = await load('skins')
    weapons.value = weaponsFrom(catalog.value, props.knives)
    if (selected.value === -1) selected.value = weapons.value[0]?.defindex ?? ALL_WEAPONS
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}
onMounted(fetchCatalog)

const limit = ref(PAGE)
// Picking a weapon while searching means "browse this one": leave search mode.
watch(selected, () => {
  query.value = ''
  limit.value = PAGE
})
watch(query, () => (limit.value = PAGE))

const current = computed(() => weapons.value.find(w => w.defindex === selected.value))
const imageOf = (defindex: number) => weapons.value.find(w => w.defindex === defindex)?.image

/** Search spans every weapon (or every knife) in this tab, not just the selected one. */
const searching = computed(() => query.value.trim().length > 0)

const pool = computed(() => catalog.value.filter(s =>
  Number(s.paint) !== 0 && (weaponClassOf(s.weapon_defindex) === 'knife') === props.knives))

const showingAll = computed(() => selected.value === ALL_WEAPONS)

const skins = computed(() => {
  if (searching.value) return pool.value.filter(s => matchesQuery(s.paint_name, query.value))
  if (showingAll.value) return pool.value
  return pool.value.filter(s => s.weapon_defindex === selected.value)
})

// One weapon has at most ~100 finishes; search results and "all" are paged.
const paged = computed(() => searching.value || showingAll.value)
const visibleSkins = computed(() => (paged.value ? skins.value.slice(0, limit.value) : skins.value))
const allLabel = computed(() => (props.knives ? 'All knives' : 'All weapons'))
const searchPlaceholder = computed(() => (props.knives ? 'Search knives… e.g. Karambit Fade' : 'Search skins… e.g. Asiimov'))

/** Weapons with a saved skin on either side (for knives: the equipped models). */
const configured = computed(() => {
  const set = new Set<number>()
  for (const t of TEAMS) {
    for (const def of Object.keys(loadout.value.skins[t])) set.add(Number(def))
  }
  if (props.knives) {
    const equipped = TEAMS.map(t => loadout.value.knife[t]).filter(Boolean)
    return new Set(weapons.value.filter(w => equipped.includes(w.name)).map(w => w.defindex))
  }
  return set
})

function teamsFor(skin: CatalogSkin): TeamId[] {
  return TEAMS.filter((t) => {
    const cfg = loadout.value.skins[t][skin.weapon_defindex]
    const equippedKnife = !props.knives || loadout.value.knife[t] === skin.weapon_name
    return cfg?.paintId === Number(skin.paint) && equippedKnife
  })
}

/** Float of the equipped copy, for the card's wear bar. */
function equippedWear(skin: CatalogSkin): number | undefined {
  const team = teamsFor(skin)[0]
  return team === undefined ? undefined : loadout.value.skins[team][skin.weapon_defindex]?.wear
}

// ---- editor ----
const editorOpen = ref(false)
const editing = ref<CatalogSkin | null>(null)

const editorItem = computed<EditorItem | null>(() => editing.value && {
  defindex: editing.value.weapon_defindex,
  paintId: Number(editing.value.paint),
  image: editing.value.image,
  fallbackImage: imageOf(editing.value.weapon_defindex),
  title: finishName(editing.value.paint_name),
  caption: editing.value.paint_name.split('|')[0]!.trim(),
})
const editorInitial = computed<SkinConfig | undefined>(() => {
  if (!editing.value) return undefined
  const d = editing.value.weapon_defindex
  return loadout.value.skins[3][d] ?? loadout.value.skins[2][d]
})

function openEditor(skin: CatalogSkin) {
  editing.value = skin
  editorOpen.value = true
}

async function onSave(teams: TeamId[], config: SkinConfig) {
  const ok = await saveSkin(teams, config)
  if (ok && props.knives && editing.value) await setKnife(teams, editing.value.weapon_name)
  if (ok) editorOpen.value = false
}

async function onRemove() {
  if (!editing.value) return
  const ok = await removeSkin(editing.value.weapon_defindex)
  if (ok) editorOpen.value = false
}
</script>

<template>
  <div v-if="state === 'error'" class="grid place-items-center gap-3 py-24 text-center text-white/50">
    <Icon name="lucide:wifi-off" class="size-9" />
    <span class="ltr">Could not load the skin list</span>
    <button type="button" class="text-mint-400 hover:underline" @click="fetchCatalog">Try again</button>
  </div>
  <template v-else>
  <!-- phones / tablets: full-width search above the class dropdowns -->
  <SkinsSearchBar
    v-model="query"
    class="mb-3 lg:hidden"
    :placeholder="searchPlaceholder"
  />

  <!-- phones / tablets: class dropdowns -->
  <div class="mb-5 lg:hidden" :class="searching && 'opacity-60'">
    <div v-if="state === 'loading'" class="flex gap-2">
      <div v-for="n in 4" :key="n" class="skeleton h-10 w-24 rounded-md" />
    </div>
    <SkinsWeaponPicker
      v-else
      v-model="selected"
      :weapons="weapons"
      :configured="configured"
      :grouped="!knives"
      :title="knives ? 'Knives' : 'Weapons'"
      all-label="All"
    />
  </div>

  <!-- minmax(0,…) / min-w-0: the card grid must size to its column, not its content. -->
  <div class="grid grid-cols-[minmax(0,1fr)] gap-[22px] lg:grid-cols-[230px_minmax(0,1fr)]">
    <div class="hidden min-w-0 transition-opacity lg:block" :class="searching && 'opacity-50 hover:opacity-100'">
      <div v-if="state === 'loading'" class="space-y-1.5 rounded-xl border border-white/7 p-2">
        <div v-for="n in 10" :key="n" class="skeleton h-[34px] rounded-lg" />
      </div>
      <SkinsWeaponRail
        v-else
        v-model="selected"
        :weapons="weapons"
        :configured="configured"
        :grouped="!knives"
        :all-label="allLabel"
        :total="pool.length"
      />
    </div>

    <div class="min-w-0">
      <!-- desktop: the search takes the grid header's place -->
      <SkinsSearchBar v-model="query" class="mb-3.5 hidden lg:block" :placeholder="searchPlaceholder" />

      <div v-if="state === 'loading'" class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div v-for="n in 15" :key="n" class="skeleton h-[168px] rounded-xl" />
      </div>

      <SkinsEmptyResult v-else-if="!skins.length" :query="query" @clear="query = ''" />

      <div v-else class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <SkinsItemCard
          v-for="skin in visibleSkins"
          :key="`${skin.weapon_defindex}-${skin.paint}`"
          :image="skin.image"
          :title="finishName(skin.paint_name)"
          :kicker="paged ? `${weaponLabel(skin.paint_name)} · #${skin.paint}` : `#${skin.paint}`"
          :fallback="imageOf(skin.weapon_defindex)"
          :active-teams="teamsFor(skin)"
          :wear="equippedWear(skin)"
          @select="openEditor(skin)"
        >
          <SkinsCardAction
            :active="teamsFor(skin).length > 0"
            :label="teamsFor(skin).length ? 'Settings' : 'Select'"
            :icon="teamsFor(skin).length ? 'lucide:sliders-horizontal' : 'lucide:plus'"
            @click="openEditor(skin)"
          />
        </SkinsItemCard>
      </div>

      <SkinsLoadMore v-if="visibleSkins.length < skins.length" class="mt-6" @click="limit += PAGE" />
    </div>
  </div>
  </template>

  <SkinsSkinEditor
    v-model:open="editorOpen"
    :item="editorItem"
    :kind="knives ? 'knife' : 'weapon'"
    :initial="editorInitial"
    :initial-teams="editing ? (teamsFor(editing).length ? teamsFor(editing) : [2, 3]) : [2, 3]"
    :busy="busy?.startsWith('skin-') || busy?.startsWith('knife-') || false"
    @save="onSave"
    @remove="onRemove"
  />
</template>
