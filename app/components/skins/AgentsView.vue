<script setup lang="ts">
import type { CatalogAgent, TeamId } from '~/types/skins'
import { matchesQuery } from '~/composables/useCatalog'

const { load } = useCatalog()
const { loadout, busy, setAgent } = useLoadout()

const agents = ref<CatalogAgent[]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
const side = ref<TeamId>(3)
const query = ref('')

async function fetchCatalog() {
  state.value = 'loading'
  try {
    agents.value = (await load('agents')).filter(a => a.model && a.model !== 'null')
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
</script>

<template>
  <SkinsSearchBar v-model="query" class="mb-4" placeholder="جستجوی ایجنت… (مثلاً Sir Bloody یا FBI)" />

  <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="grid grid-cols-2 rounded-md border border-white/8 bg-ink-900/80 p-1 sm:inline-grid">
      <button
        v-for="s in ([3, 2] as TeamId[])"
        :key="s"
        type="button"
        class="ltr h-9 rounded-sm px-3 font-mono text-[12px] font-bold transition-colors sm:px-5 sm:text-[12.5px]"
        :class="side === s
          ? s === 2 ? 'bg-side-t/15 text-side-t' : 'bg-side-ct/15 text-side-ct'
          : 'text-white/40 hover:text-white/70'"
        @click="side = s"
      >
        <span class="sm:hidden">{{ s === 2 ? 'T' : 'CT' }}</span>
        <span class="hidden sm:inline">{{ s === 2 ? 'TERRORIST' : 'COUNTER-TERRORIST' }}</span>
      </button>
    </div>
    <p class="text-[13px] text-white/45">
      ایجنت فعال:
      <span class="ltr font-semibold text-white">{{ current ? split(current).name : 'پیش‌فرض بازی' }}</span>
    </p>
  </div>

  <div v-if="state === 'error'" class="grid place-items-center gap-3 py-24 text-center text-white/50">
    لیست ایجنت‌ها بارگذاری نشد.
    <button type="button" class="text-mint-400 hover:underline" @click="fetchCatalog">تلاش دوباره</button>
  </div>

  <div v-else-if="state === 'loading'" class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
    <div v-for="n in 12" :key="n" class="skeleton h-[300px] rounded-lg" />
  </div>

  <SkinsEmptyResult v-else-if="!visible.length" :query="query" @clear="query = ''" />

  <div v-else class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
    <SkinsItemCard
      v-for="a in visible"
      :key="a.model"
      :image="a.image"
      :title="split(a).name"
      :caption="split(a).faction"
      :active-teams="loadout.agents[a.team] === a.model ? [a.team] : []"
      :glow="a.team === 2 ? 'rgb(226 173 85 / .16)' : 'rgb(98 174 234 / .16)'"
      stage-class="h-[200px]"
      @select="toggle(a)"
    >
      <button
        type="button"
        :disabled="busy === `agent-${a.model}` || busy === 'agent-null'"
        class="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border text-[12.5px] font-semibold transition-colors disabled:opacity-50"
        :class="loadout.agents[a.team] === a.model
          ? 'border-mint-500/35 bg-mint-500/10 text-mint-300 hover:border-red-k/40 hover:bg-red-k/10 hover:text-red-k'
          : 'border-white/10 text-white/60 hover:border-mint-500/45 hover:text-mint-300'"
        @click="toggle(a)"
      >
        <Icon :name="loadout.agents[a.team] === a.model ? 'lucide:check' : 'lucide:plus'" class="size-3.5" />
        {{ loadout.agents[a.team] === a.model ? 'فعال' : 'انتخاب' }}
      </button>
    </SkinsItemCard>
  </div>
</template>
