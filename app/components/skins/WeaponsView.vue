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
const allLabel = computed(() => (props.knives ? 'همهٔ چاقوها' : 'همهٔ اسلحه‌ها'))

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
    لیست اسکین‌ها بارگذاری نشد.
    <button type="button" class="text-mint-400 hover:underline" @click="fetchCatalog">تلاش دوباره</button>
  </div>
  <template v-else>
  <SkinsSearchBar
    v-model="query"
    class="mb-3 lg:mb-5"
    :placeholder="knives ? 'جستجوی چاقو… مثلاً Karambit Fade' : 'جستجوی اسکین… مثلاً Asiimov'"
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
      :title="knives ? 'چاقو' : 'اسلحه'"
      all-label="همه"
    />
  </div>

  <!-- minmax(0,…) / min-w-0: the card grid must size to its column, not its content. -->
  <div class="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
    <div class="hidden min-w-0 transition-opacity lg:block" :class="searching && 'opacity-50 hover:opacity-100'">
      <div v-if="state === 'loading'" class="space-y-2">
        <div v-for="n in 10" :key="n" class="skeleton h-10 rounded-md" />
      </div>
      <SkinsWeaponRail
        v-else
        v-model="selected"
        :weapons="weapons"
        :configured="configured"
        :grouped="!knives"
        :title="knives ? 'مدل چاقو' : 'اسلحه'"
        :all-label="allLabel"
        :total="pool.length"
      />
    </div>

    <div class="min-w-0">
      <!-- heading: the selected weapon, or search results across all of them -->
      <div class="mb-4 flex items-center gap-3">
        <img v-if="current && !searching" :src="current.image" alt="" class="hidden h-10 w-20 object-contain sm:block">
        <div class="min-w-0">
          <h2 v-if="searching" class="text-lg font-black text-white sm:text-xl">
            نتایج «<span class="ltr">{{ query.trim() }}</span>»
          </h2>
          <h2 v-else-if="showingAll" class="text-lg font-black text-white sm:text-xl">{{ allLabel }}</h2>
          <h2 v-else class="ltr text-start text-lg font-black text-white sm:text-xl">{{ current?.label ?? '…' }}</h2>
          <p class="text-[12.5px] text-white/40">
            <span class="font-mono">{{ skins.length.toLocaleString('fa-IR') }}</span> اسکین
            <template v-if="searching"> در {{ allLabel }}</template>
            <template v-else-if="knives"> · با انتخاب اسکین، همین مدل چاقو هم برای آن تیم فعال می‌شود</template>
          </p>
        </div>
      </div>

      <div v-if="state === 'loading'" class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4 2xl:grid-cols-5">
        <div v-for="n in 12" :key="n" class="skeleton h-[230px] rounded-lg sm:h-[250px]" />
      </div>

      <SkinsEmptyResult v-else-if="!skins.length" :query="query" @clear="query = ''" />

      <div v-else class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4 2xl:grid-cols-5">
        <SkinsItemCard
          v-for="skin in visibleSkins"
          :key="`${skin.weapon_defindex}-${skin.paint}`"
          :image="skin.image"
          :title="finishName(skin.paint_name)"
          :caption="weaponLabel(skin.paint_name)"
          :fallback="imageOf(skin.weapon_defindex)"
          :active-teams="teamsFor(skin)"
          @select="openEditor(skin)"
        >
          <template #meta>
            <span class="rounded-xs border border-white/8 px-1.5 py-px font-mono text-[10px] text-white/40">#{{ skin.paint }}</span>
            <span v-if="teamsFor(skin).length" class="rounded-xs bg-mint-500/12 px-1.5 py-px font-mono text-[10px] font-bold text-mint-400">
              {{ loadout.skins[teamsFor(skin)[0]!][skin.weapon_defindex]?.wear.toFixed(3) }}
            </span>
          </template>
          <button
            type="button"
            class="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border text-[12.5px] font-semibold transition-colors"
            :class="teamsFor(skin).length
              ? 'border-mint-500/35 bg-mint-500/10 text-mint-300 hover:bg-mint-500/15'
              : 'border-white/10 text-white/60 hover:border-mint-500/45 hover:bg-mint-500/[.06] hover:text-mint-300'"
            @click="openEditor(skin)"
          >
            <Icon :name="teamsFor(skin).length ? 'lucide:sliders-horizontal' : 'lucide:plus'" class="size-3.5" />
            {{ teamsFor(skin).length ? 'تنظیمات' : 'انتخاب' }}
          </button>
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
