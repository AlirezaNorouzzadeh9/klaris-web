<script setup lang="ts">
import type { CatalogItem, TeamId } from '~/types/skins'
import { TEAMS } from '~/types/skins'
import { matchesQuery } from '~/composables/useCatalog'

/** Music kits and pins: one pick per side, no per-item settings. */
const props = defineProps<{ kind: 'music' | 'pins' }>()

const PAGE = 48
const { load } = useCatalog()
const { loadout, busy, setMusic, setPin } = useLoadout()

const items = ref<CatalogItem[]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
const query = ref('')
const limit = ref(PAGE)

async function fetchCatalog() {
  state.value = 'loading'
  try {
    items.value = await load(props.kind === 'music' ? 'music' : 'collectibles')
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}
onMounted(fetchCatalog)
watch(query, () => (limit.value = PAGE))

const slot = computed(() => (props.kind === 'music' ? loadout.value.music : loadout.value.pins))
const filtered = computed(() => items.value.filter(i => matchesQuery(i.name, query.value)))
const visible = computed(() => filtered.value.slice(0, limit.value))

const teamsFor = (item: CatalogItem): TeamId[] => TEAMS.filter(t => slot.value[t] === Number(item.id))
const cleanName = (n: string) => n.replace(/^Music Kit \| /, '')

function toggle(item: CatalogItem, team: TeamId) {
  const id = Number(item.id)
  const value = slot.value[team] === id ? null : id
  return props.kind === 'music' ? setMusic([team], value) : setPin([team], value)
}
</script>

<template>
  <SkinsSearchBar
    v-model="query"
    class="mb-4"
    :placeholder="kind === 'music' ? 'جستجوی موزیک… (مثلاً Hotline Miami یا Neck Deep)' : 'جستجوی پین… (مثلاً Katowice یا Operation)'"
  />
  <p class="mb-5 text-[13px] text-white/45">
    برای هر تیم یکی انتخاب کن: روی <span class="ltr font-mono text-side-t">T</span> یا
    <span class="ltr font-mono text-side-ct">CT</span> هر کارت بزن.
  </p>

  <div v-if="state === 'error'" class="grid place-items-center gap-3 py-24 text-center text-white/50">
    لیست بارگذاری نشد.
    <button type="button" class="text-mint-400 hover:underline" @click="fetchCatalog">تلاش دوباره</button>
  </div>

  <div v-else-if="state === 'loading'" class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
    <div v-for="n in 12" :key="n" class="skeleton h-[230px] rounded-lg" />
  </div>

  <SkinsEmptyResult v-else-if="!filtered.length" :query="query" @clear="query = ''" />

  <template v-else>
    <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
      <SkinsItemCard
        v-for="item in visible"
        :key="item.id"
        :image="item.image"
        :title="cleanName(item.name)"
        :caption="kind === 'music' ? 'MUSIC KIT' : 'PIN'"
        :active-teams="teamsFor(item)"
        :interactive="false"
        stage-class="h-[130px]"
      >
        <div class="ltr grid grid-cols-2 gap-1.5">
          <button
            v-for="t in TEAMS"
            :key="t"
            type="button"
            :disabled="busy !== null"
            :aria-pressed="slot[t] === Number(item.id)"
            class="h-8 rounded-sm border font-mono text-[11.5px] font-bold transition-colors disabled:opacity-60"
            :class="slot[t] === Number(item.id)
              ? t === 2 ? 'border-side-t/60 bg-side-t/15 text-side-t' : 'border-side-ct/60 bg-side-ct/15 text-side-ct'
              : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/75'"
            @click="toggle(item, t)"
          >
            {{ t === 2 ? 'T' : 'CT' }}
          </button>
        </div>
      </SkinsItemCard>
    </div>
    <SkinsLoadMore v-if="visible.length < filtered.length" class="mt-6" @click="limit += PAGE" />
  </template>
</template>
