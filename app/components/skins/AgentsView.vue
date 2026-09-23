<script setup lang="ts">
import type { CatalogAgent, CatalogModel, TeamId } from '~/types/skins'
import { matchesQuery } from '~/composables/useCatalog'

const { load } = useCatalog()
const { loadout, busy, setAgent, setModel } = useLoadout()

const agents = ref<CatalogAgent[]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
// ?side=t|ct picks the side from outside (the loadout showcase links here).
const route = useRoute()
const sideFromRoute = (): TeamId | null => (route.query.side === 't' ? 2 : route.query.side === 'ct' ? 3 : null)
const side = ref<TeamId>(sideFromRoute() ?? 3)
watch(() => route.query.side, () => {
  const s = sideFromRoute()
  if (s) side.value = s
})
const query = ref('')
const placeholder = 'جستجوی ایجنت… مثلاً Sir Bloody'

/** The server's own player models (PlayerModelChanger), shown above the Valve agents. */
const models = ref<CatalogModel[]>([])

async function fetchCatalog() {
  state.value = 'loading'
  try {
    const [list, custom] = await Promise.all([load('agents'), load('models').catch(() => [])])
    agents.value = list.filter(a => a.model && a.model !== 'null')
    models.value = custom
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}
onMounted(fetchCatalog)

const visible = computed(() => agents.value.filter(a => a.team === side.value && matchesQuery(a.agent_name, query.value)))
const current = computed(() => agents.value.find(a => a.model === loadout.value.agents[side.value]))

/** "Name | Faction" -> [name, faction] */
const split = (a: CatalogAgent) => {
  const [name, faction] = a.agent_name.split('|').map(s => s.trim())
  return { name: name ?? a.agent_name, faction: faction ?? '' }
}

function toggle(a: CatalogAgent) {
  const on = loadout.value.agents[a.team] === a.model
  setAgent(a.team, on ? null : a.model)
}

// ---- server models ----
const visibleModels = computed(() => models.value.filter(m =>
  (m.side === 'all' || (m.side === 't' ? side.value === 2 : side.value === 3))
  && matchesQuery(m.name, query.value)))

const modelOn = (m: CatalogModel) => loadout.value.models[side.value] === m.id
function toggleModel(m: CatalogModel) {
  setModel(side.value, modelOn(m) ? null : m.id)
}
</script>

<template>
  <!-- CT / T segmented control, on the left -->
  <div dir="ltr">
  <div class="mb-[18px] grid grid-cols-2 gap-1 rounded-lg border border-white/8 bg-ink-900/80 p-1 sm:inline-grid">
    <button
      v-for="s in ([3, 2] as TeamId[])"
      :key="s"
      type="button"
      class="h-[34px] rounded-[7px] px-3 font-mono text-[12px] font-bold transition-colors sm:px-5"
      :class="side === s
        ? s === 2 ? 'bg-side-t/15 text-side-t' : 'bg-side-ct/15 text-side-ct'
        : 'text-white/40 hover:text-white/70'"
      @click="side = s"
    >
      <span class="sm:hidden">{{ s === 2 ? 'T' : 'CT' }}</span>
      <span class="hidden sm:inline">{{ s === 2 ? 'TERRORIST' : 'COUNTER-TERRORIST' }}</span>
    </button>
  </div>
  </div>

  <SkinsSearchBar v-model="query" class="mb-3.5" :placeholder="placeholder" />

  <div v-if="state === 'error'" class="grid place-items-center gap-3 py-24 text-center text-white/50">
    <span class="ltr">Could not load the agent list</span>
    <button type="button" class="text-brand-400 hover:underline" @click="fetchCatalog">Try again</button>
  </div>

  <div v-else-if="state === 'loading'" class="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(188px,1fr))]">
    <div v-for="n in 12" :key="n" class="skeleton h-[248px] rounded-xl" />
  </div>

  <template v-else>
    <!-- the server's own models come first; they are not Valve agents -->
    <section v-if="visibleModels.length" class="mb-6">
      <h3 class="mb-3 flex items-center gap-2 text-[13px] font-bold text-white/80">
        مدل‌های اختصاصی کلاریس
        <span class="ltr rounded-full bg-gold-k/12 px-2 py-0.5 font-mono text-[10px] font-bold text-gold-k">VIP</span>
        <span class="h-px flex-1 bg-white/6" />
      </h3>
      <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(188px,1fr))]">
        <SkinsItemCard
          v-for="m in visibleModels"
          :key="m.id"
          :image="m.image ?? ''"
          cover
          :title="m.name"
          kicker="Klaris"
          :active-teams="modelOn(m) ? [side] : []"
          glow="rgb(255 215 0 / .16)"
          stage-class="h-[186px]"
          @select="toggleModel(m)"
        >
          <SkinsCardAction
            :active="modelOn(m)"
            :label="modelOn(m) ? 'انتخاب شده' : 'انتخاب'"
            :icon="modelOn(m) ? 'lucide:check' : 'lucide:plus'"
            :disabled="busy === `model-${m.id}` || busy === 'model-null'"
            @click="toggleModel(m)"
          />
        </SkinsItemCard>
      </div>
    </section>

    <SkinsEmptyResult v-if="!visible.length && !visibleModels.length" :query="query" @clear="query = ''" />

    <div v-else-if="visible.length" class="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(188px,1fr))]">
    <SkinsItemCard
      v-for="a in visible"
      :key="a.model"
      :image="a.image"
      :title="split(a).name"
      :kicker="split(a).faction"
      :active-teams="loadout.agents[a.team] === a.model ? [a.team] : []"
      :glow="a.team === 2 ? 'rgb(244 180 26 / .16)' : 'rgb(75 143 226 / .16)'"
      stage-class="h-[186px]"
      @select="toggle(a)"
    >
      <SkinsCardAction
        :active="loadout.agents[a.team] === a.model"
        :label="loadout.agents[a.team] === a.model ? 'انتخاب شده' : 'انتخاب'"
        :icon="loadout.agents[a.team] === a.model ? 'lucide:check' : 'lucide:plus'"
        :disabled="busy === `agent-${a.model}` || busy === 'agent-null'"
        @click="toggle(a)"
      />
    </SkinsItemCard>
    </div>
  </template>
</template>
