<script setup lang="ts">
import type { CatalogAgent, CatalogGlove, CatalogItem, CatalogSkin, SkinConfig, TeamId } from '~/types/skins'
import { wearTierOf } from '~/data/weapons'
import { finishName, weaponLabel } from '~/composables/useCatalog'

/**
 * The player's whole loadout for one side, laid out like the in-game loadout
 * screen: agent on a side-tinted stage, the gear column (knife, gloves, music
 * kit, pin) and the three weapon columns. Every tile opens the inspect view.
 */
const { loadout, status } = useLoadout()
const { load } = useCatalog()
const { inspect } = useInspect()

const team = ref<TeamId>(3)
const side = computed(() => (team.value === 2
  ? { key: 't', label: 'Terrorists', short: 'T', color: 'var(--color-side-t)' }
  : { key: 'ct', label: 'Counter-Terrorists', short: 'CT', color: 'var(--color-side-ct)' }))

// ---- catalog lookups ----
const skins = shallowRef<CatalogSkin[]>([])
const gloves = shallowRef<CatalogGlove[]>([])
const agents = shallowRef<CatalogAgent[]>([])
const music = shallowRef<CatalogItem[]>([])
const pins = shallowRef<CatalogItem[]>([])
const ready = ref(false)

onMounted(async () => {
  try {
    ;[skins.value, gloves.value, agents.value, music.value, pins.value] = await Promise.all([
      load('skins'), load('gloves'), load('agents'), load('music'), load('collectibles'),
    ])
  } finally {
    ready.value = true
  }
})

const skinByKey = computed(() => new Map(skins.value.map(s => [`${s.weapon_defindex}:${s.paint}`, s])))
const defaultByDefindex = computed(() => {
  const map = new Map<number, CatalogSkin>()
  for (const s of skins.value) if (String(s.paint) === '0') map.set(s.weapon_defindex, s)
  return map
})
const gloveByKey = computed(() => new Map(gloves.value.map(g => [`${g.weapon_defindex}:${g.paint}`, g])))

// ---- slots ----
interface Slot {
  key: string
  image: string
  weapon: string
  finish: string
  equipped: boolean
  config?: SkinConfig
}

/**
 * Every weapon each side can carry, in the order of the game's loadout screen
 * (starting pistol first; Zeus x27 sits with the pistols).
 */
const AVAILABLE: Record<TeamId, Record<'pistols' | 'mid' | 'rifles', number[]>> = {
  // Glock-18 · P250 · Tec-9 · CZ75-Auto · Desert Eagle · R8 · Dual Berettas · Zeus
  // Nova · XM1014 · Sawed-Off · MAC-10 · MP7 · MP5-SD · UMP-45 · P90 · PP-Bizon · M249 · Negev
  // Galil AR · AK-47 · SSG 08 · SG 553 · AWP · G3SG1
  2: {
    pistols: [4, 36, 30, 63, 1, 64, 2, 31],
    mid: [35, 25, 29, 17, 33, 23, 24, 19, 26, 14, 28],
    rifles: [13, 7, 40, 39, 9, 11],
  },
  // USP-S · P2000 · P250 · Five-SeveN · CZ75-Auto · Desert Eagle · R8 · Dual Berettas · Zeus
  // Nova · XM1014 · MAG-7 · MP9 · MP7 · MP5-SD · UMP-45 · P90 · PP-Bizon · M249 · Negev
  // FAMAS · M4A4 · M4A1-S · SSG 08 · AUG · AWP · SCAR-20
  3: {
    pistols: [61, 32, 36, 3, 63, 1, 64, 2, 31],
    mid: [35, 25, 27, 34, 33, 23, 24, 19, 26, 14, 28],
    rifles: [10, 16, 60, 40, 8, 9, 38],
  },
}
const COLUMNS = [
  { key: 'pistols', label: 'Pistols' },
  { key: 'mid', label: 'Mid-Tier' },
  { key: 'rifles', label: 'Rifles' },
] as const

function weaponSlot(defindex: number): Slot | null {
  const config = loadout.value.skins[team.value][defindex]
  const base = defaultByDefindex.value.get(defindex)
  const skin = config ? skinByKey.value.get(`${defindex}:${config.paintId}`) : undefined
  const shown = skin ?? base
  if (!shown) return null
  return {
    key: String(defindex),
    image: shown.image || base?.image || '',
    weapon: weaponLabel(shown.paint_name),
    finish: skin ? finishName(skin.paint_name) : 'Default',
    equipped: !!skin,
    config: skin ? config : undefined,
  }
}

const columns = computed(() => COLUMNS.map(col => ({
  ...col,
  slots: AVAILABLE[team.value][col.key].map(weaponSlot).filter((s): s is Slot => s !== null),
})))
const slotCount = computed(() => columns.value.reduce((n, c) => n + c.slots.length, 0) + 5) // + agent and 4 gear

const gear = computed(() => {
  const l = loadout.value
  const t = team.value
  const out: (Slot & { icon: string })[] = []

  // knife: model from wp_player_knife, finish from its skins row
  const knifeName = l.knife[t]
  const knifeBase = knifeName ? skins.value.find(s => s.weapon_name === knifeName && String(s.paint) === '0') : undefined
  const knifeConfig = knifeBase ? l.skins[t][knifeBase.weapon_defindex] : undefined
  const knifeSkin = knifeBase && knifeConfig ? skinByKey.value.get(`${knifeBase.weapon_defindex}:${knifeConfig.paintId}`) : undefined
  out.push({
    key: 'knife', icon: 'lucide:swords',
    image: (knifeSkin ?? knifeBase)?.image ?? '',
    weapon: knifeBase ? weaponLabel(knifeBase.paint_name) : 'Knife',
    finish: knifeSkin ? finishName(knifeSkin.paint_name) : knifeBase ? 'Vanilla' : 'Default',
    equipped: !!knifeBase, config: knifeSkin ? knifeConfig : undefined,
  })

  const gloveDef = l.gloves[t]
  const gloveConfig = gloveDef ? l.skins[t][gloveDef] : undefined
  const glove = gloveDef && gloveConfig ? gloveByKey.value.get(`${gloveDef}:${gloveConfig.paintId}`) : undefined
  out.push({
    key: 'gloves', icon: 'lucide:hand',
    image: glove?.image ?? '',
    weapon: glove ? weaponLabel(glove.paint_name) : 'Gloves',
    finish: glove ? finishName(glove.paint_name) : 'Default',
    equipped: !!glove, config: glove ? gloveConfig : undefined,
  })

  const kit = l.music[t] !== null ? music.value.find(m => m.id === String(l.music[t])) : undefined
  out.push({ key: 'music', icon: 'lucide:music', image: kit?.image ?? '', weapon: 'Music Kit', finish: kit?.name ?? 'Default', equipped: !!kit })

  const pin = l.pins[t] !== null ? pins.value.find(p => p.id === String(l.pins[t])) : undefined
  out.push({ key: 'pin', icon: 'lucide:award', image: pin?.image ?? '', weapon: 'Pin', finish: pin?.name ?? 'None', equipped: !!pin })
  return out
})

const agent = computed(() => {
  const model = loadout.value.agents[team.value]
  const own = model ? agents.value.find(a => a.model === model) : undefined
  if (own) {
    const [name, faction] = own.agent_name.split('|').map(s => s.trim())
    return { image: own.image, name: name ?? '', faction: faction ?? '', equipped: true }
  }
  // no agent picked: a ghosted stand-in so the stage is never empty
  const stand = agents.value.find(a => a.team === team.value && a.image)
  return { image: stand?.image ?? '', name: 'Default agent', faction: side.value.label, equipped: false }
})

const equippedCount = computed(() =>
  columns.value.reduce((n, c) => n + c.slots.filter(s => s.equipped).length, 0)
  + gear.value.filter(g => g.equipped).length + (agent.value.equipped ? 1 : 0))

const loading = computed(() => !ready.value || status.value !== 'ready')

// phones show one weapon column at a time
const mobileColumn = ref<(typeof COLUMNS)[number]['key']>('rifles')

function open(slot: Slot) {
  if (!slot.image) return
  inspect({
    image: slot.image,
    title: slot.finish === 'Default' ? slot.weapon : `${slot.weapon} | ${slot.finish}`,
    kicker: side.value.short,
    wear: slot.config?.wear,
  })
}
function openAgent() {
  if (!agent.value.equipped) return
  inspect({ image: agent.value.image, title: agent.value.name, kicker: agent.value.faction })
}
</script>

<template>
  <section class="mx-auto max-w-[1440px] px-4 pt-5 sm:px-6 lg:px-10 lg:pt-7">
    <div
      class="relative isolate overflow-hidden rounded-2xl border border-white/7 bg-ink-900"
      :style="{ '--side': side.color }"
    >
      <!-- side-tinted backdrop, like the game's loadout screen -->
      <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_85%_0%,color-mix(in_oklab,var(--side)_22%,transparent),transparent_60%)] transition-[background] duration-700" />
      <div class="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <!-- header -->
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 px-4 py-3 sm:px-5">
        <div class="flex items-center gap-3">
          <span class="h-7 w-1 rounded-full bg-[var(--side)] transition-colors duration-500" />
          <div>
            <p class="ltr text-right font-mono text-[10px] font-bold tracking-[.25em] text-white/35">YOUR LOADOUT</p>
            <p class="ltr text-right text-[15px] font-bold text-white">{{ side.label }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <p class="ltr hidden font-mono text-[11.5px] text-white/40 sm:block">
            <span class="font-bold text-white">{{ loading ? '–' : equippedCount }}</span> / {{ slotCount }} custom
          </p>
          <div class="ltr flex rounded-lg bg-black/40 p-1" role="tablist" aria-label="Side">
            <button
              v-for="t in ([2, 3] as TeamId[])"
              :key="t"
              type="button"
              role="tab"
              :aria-selected="team === t"
              class="h-8 min-w-12 rounded-md px-3 font-mono text-[12.5px] font-bold transition-all duration-300"
              :class="team === t
                ? (t === 2 ? 'bg-side-t text-ink-950 shadow-[0_4px_16px_-4px_var(--color-side-t)]' : 'bg-side-ct text-ink-950 shadow-[0_4px_16px_-4px_var(--color-side-ct)]')
                : 'text-white/45 hover:text-white/80'"
              @click="team = t"
            >{{ t === 2 ? 'T' : 'CT' }}</button>
          </div>
        </div>
      </header>

      <div class="grid gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,230px)_112px_minmax(0,1fr)] lg:gap-4">
        <!-- agent stage + gear (gear sits beside the agent on phones) -->
        <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 lg:contents">
          <button
            type="button"
            class="group relative isolate h-[228px] overflow-hidden rounded-xl border border-white/6 bg-black/25 lg:h-auto lg:min-h-[354px]"
            :class="agent.equipped ? 'cursor-zoom-in' : 'cursor-default'"
            :aria-label="agent.name"
            @click="openAgent"
          >
            <div class="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-[color-mix(in_oklab,var(--side)_28%,transparent)] to-transparent transition-[background] duration-700" />
            <div class="absolute bottom-[14%] left-1/2 -z-10 h-6 w-3/4 -translate-x-1/2 rounded-[50%] bg-black/60 blur-xl" />
            <span v-if="loading" class="skeleton absolute inset-6 rounded-lg" />
            <Transition
              v-else
              mode="out-in"
              enter-active-class="transition duration-500 ease-out-quint"
              enter-from-class="opacity-0 translate-y-3"
              leave-active-class="transition duration-200"
              leave-to-class="opacity-0"
            >
              <img
                v-if="agent.image"
                :key="agent.image"
                :src="agent.image"
                :alt="agent.name"
                class="absolute bottom-0 left-1/2 h-[118%] max-w-none -translate-x-1/2 object-contain object-bottom drop-shadow-[0_18px_24px_rgb(0_0_0/.6)] transition-[scale] duration-500 origin-bottom group-hover:scale-[1.03]"
                :class="!agent.equipped && 'opacity-30 grayscale'"
              >
            </Transition>
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/95 via-ink-950/60 to-transparent px-3 pt-8 pb-2.5">
              <p class="ltr truncate text-right text-[13px] font-bold text-white">{{ agent.name }}</p>
              <p class="ltr truncate text-right text-[10.5px] text-white/45">{{ agent.faction }}</p>
            </div>
          </button>

          <div class="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:grid-rows-4">
            <button
              v-for="g in gear"
              :key="g.key"
              type="button"
              class="group relative flex min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border bg-black/25 p-1.5 transition-colors"
              :class="[g.equipped ? 'border-[color-mix(in_oklab,var(--side)_40%,transparent)] cursor-zoom-in' : 'border-white/6 cursor-default', g.image ? '' : 'text-white/20']"
              :title="`${g.weapon} · ${g.finish}`"
              @click="open(g)"
            >
              <span v-if="loading" class="skeleton size-10 rounded-md" />
              <img v-else-if="g.image" :src="g.image" alt="" loading="lazy" class="h-12 w-full object-contain drop-shadow-[0_6px_8px_rgb(0_0_0/.5)] transition-transform duration-300 group-hover:scale-105">
              <Icon v-else :name="g.icon" class="size-6" />
              <span class="ltr w-full truncate text-center text-[10px] font-semibold" :class="g.equipped ? 'text-white/80' : 'text-white/35'">{{ g.equipped ? g.finish : g.weapon }}</span>
              <span v-if="g.equipped" class="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--side)]" />
            </button>
          </div>
        </div>

        <!-- weapon columns: all three on desktop, one at a time on phones -->
        <div>
          <div class="ltr mb-2 flex rounded-lg bg-black/30 p-1 lg:hidden" role="tablist" aria-label="Weapon column">
            <button
              v-for="c in columns"
              :key="c.key"
              type="button"
              role="tab"
              :aria-selected="mobileColumn === c.key"
              class="h-8 flex-1 rounded-md text-[12.5px] font-semibold transition-colors"
              :class="mobileColumn === c.key ? 'bg-white/10 text-white' : 'text-white/45'"
              @click="mobileColumn = c.key"
            >{{ c.label }}</button>
          </div>

          <div class="ltr grid gap-3 lg:grid-cols-3">
            <div v-for="c in columns" :key="c.key" class="min-w-0" :class="mobileColumn === c.key ? 'block' : 'hidden lg:block'">
              <p class="mb-2 hidden items-center gap-2 font-mono text-[10.5px] font-bold tracking-[.2em] text-white/35 uppercase lg:flex">
                {{ c.label }} <span class="h-px flex-1 bg-white/6" />
              </p>
              <div class="flex flex-col gap-1">
                <template v-if="loading">
                  <span v-for="n in 7" :key="n" class="skeleton h-[46px] rounded-lg" />
                </template>
                <button
                  v-for="s in c.slots"
                  v-else
                  :key="s.key"
                  type="button"
                  class="group relative flex h-[46px] min-w-0 cursor-zoom-in items-center gap-3 overflow-hidden rounded-lg border ps-1 pe-3 text-left transition-[border-color,background-color] duration-200"
                  :class="s.equipped
                    ? 'border-[color-mix(in_oklab,var(--side)_35%,transparent)] bg-[linear-gradient(90deg,color-mix(in_oklab,var(--side)_14%,transparent),transparent_70%)] hover:border-[color-mix(in_oklab,var(--side)_60%,transparent)]'
                    : 'border-white/6 bg-black/20 hover:border-white/14'"
                  @click="open(s)"
                >
                  <img
                    :src="s.image"
                    alt=""
                    loading="lazy"
                    class="h-full w-[40%] shrink-0 object-contain py-1 drop-shadow-[0_6px_8px_rgb(0_0_0/.55)] transition-transform duration-300 group-hover:scale-[1.06]"
                    :class="!s.equipped && 'opacity-45 grayscale-[.6]'"
                  >
                  <span class="min-w-0 flex-1">
                    <span class="block truncate font-mono text-[9.5px] font-bold tracking-[.06em] text-white/35 uppercase">{{ s.weapon }}</span>
                    <span class="block truncate text-[12.5px] font-bold" :class="s.equipped ? 'text-white' : 'text-white/40'">{{ s.finish }}</span>
                  </span>
                  <span v-if="s.config" class="flex shrink-0 flex-col items-end gap-1">
                    <span
                      class="rounded-xs px-1.5 py-px font-mono text-[9px] font-bold"
                      :style="{ background: `${wearTierOf(s.config.wear).color}22`, color: wearTierOf(s.config.wear).color }"
                    >{{ wearTierOf(s.config.wear).short }}</span>
                    <span v-if="s.config.stattrak" class="rounded-xs bg-[#f5902d]/15 px-1.5 py-px font-mono text-[9px] font-bold text-[#f5902d]">ST</span>
                  </span>
                  <span v-if="s.equipped" class="absolute inset-y-0 left-0 w-[2px] bg-[var(--side)]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
