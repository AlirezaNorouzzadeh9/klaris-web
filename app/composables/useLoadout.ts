import { toast } from 'vue-sonner'
import type { Loadout, SkinConfig, TeamId } from '~/types/skins'
import { TEAMS } from '~/types/skins'
import { emptyLoadout, mockLoadoutService, type LoadoutService } from '~/services/loadout'

// Swap for the API-backed service once the backend exists.
const service: LoadoutService = mockLoadoutService

export function useLoadout() {
  const loadout = useState<Loadout>('loadout', emptyLoadout)
  const status = useState<'idle' | 'loading' | 'ready' | 'error'>('loadout-status', () => 'idle')
  const busy = useState<string | null>('loadout-busy', () => null)

  async function ensureLoaded() {
    if (status.value === 'ready' || status.value === 'loading') return
    status.value = 'loading'
    try {
      loadout.value = await service.load()
      status.value = 'ready'
    } catch {
      status.value = 'error'
    }
  }

  /** Runs a save, refreshes local state from the service, and reports the outcome. */
  async function run(key: string, action: () => Promise<void>, success: string) {
    busy.value = key
    try {
      await action()
      loadout.value = await service.load()
      toast.success(success, { description: 'Type !wp in game chat to apply it without reconnecting.' })
      return true
    } catch {
      toast.error('Could not save', { description: 'Check your connection and try again.' })
      return false
    } finally {
      busy.value = null
    }
  }

  /** Teams on which this weapon currently has a saved skin. */
  const teamsWithSkin = (defindex: number): TeamId[] =>
    TEAMS.filter(t => loadout.value.skins[t][defindex] !== undefined)

  const skinFor = (defindex: number): SkinConfig | undefined =>
    loadout.value.skins[3][defindex] ?? loadout.value.skins[2][defindex]

  const configuredCount = computed(() => {
    const l = loadout.value
    const defs = new Set([...Object.keys(l.skins[2]), ...Object.keys(l.skins[3])])
    const singles = [l.knife, l.gloves, l.agents, l.music, l.pins]
      .filter(slot => slot[2] !== null || slot[3] !== null).length
    return defs.size + singles
  })

  return {
    loadout,
    status,
    busy,
    configuredCount,
    ensureLoaded,
    teamsWithSkin,
    skinFor,
    saveSkin: (teams: TeamId[], config: SkinConfig) =>
      run(`skin-${config.defindex}`, async () => {
        // A team that was unticked loses the skin instead of keeping a stale one.
        const dropped = TEAMS.filter(t => !teams.includes(t))
        if (dropped.length) await service.removeSkin(dropped, config.defindex)
        if (teams.length) await service.saveSkin(teams, config)
      }, 'Skin saved'),
    removeSkin: (defindex: number) =>
      run(`skin-${defindex}`, () => service.removeSkin([...TEAMS], defindex), 'Skin removed'),
    setKnife: (teams: TeamId[], knife: string | null) =>
      run(`knife-${knife}`, () => service.setKnife(teams, knife), 'Knife equipped'),
    setGloves: (teams: TeamId[], defindex: number | null) =>
      run(`gloves-${defindex}`, () => service.setGloves(teams, defindex), 'Gloves equipped'),
    setAgent: (team: TeamId, model: string | null) =>
      run(`agent-${model}`, () => service.setAgent(team, model), 'Agent updated'),
    setMusic: (teams: TeamId[], id: number | null) =>
      run(`music-${id}`, () => service.setMusic(teams, id), 'MVP music updated'),
    setPin: (teams: TeamId[], id: number | null) =>
      run(`pin-${id}`, () => service.setPin(teams, id), 'Pin updated'),
    resetAll: () => run('reset', () => service.resetAll(), 'Everything reset to game defaults'),
  }
}
