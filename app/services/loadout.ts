import type { KeychainSlot, Loadout, SkinConfig, StickerSlot, TeamId } from '~/types/skins'

/**
 * Persistence for a player's WeaponPaints loadout. The mock keeps it in
 * localStorage; the real implementation will call the Klaris API, which writes
 * the same wp_player_* rows the game server reads on connect.
 */
export interface LoadoutService {
  load(): Promise<Loadout>
  saveSkin(teams: TeamId[], config: SkinConfig): Promise<void>
  removeSkin(teams: TeamId[], defindex: number): Promise<void>
  setKnife(teams: TeamId[], knife: string | null): Promise<void>
  setGloves(teams: TeamId[], defindex: number | null): Promise<void>
  setAgent(team: TeamId, model: string | null): Promise<void>
  setMusic(teams: TeamId[], musicId: number | null): Promise<void>
  setPin(teams: TeamId[], pinId: number | null): Promise<void>
  resetAll(): Promise<void>
}

export const emptyStickers = (): StickerSlot[] =>
  Array.from({ length: 5 }, () => ({ id: 0, schema: 0, x: 0, y: 0, wear: 0, scale: 0, rotation: 0 }))

export const emptyKeychain = (): KeychainSlot => ({ id: 0, x: 0, y: 0, z: 0, seed: 0 })

export function emptyLoadout(): Loadout {
  const perTeam = <T>(value: T) => ({ 2: value, 3: value }) as Record<TeamId, T>
  return {
    skins: { 2: {}, 3: {} },
    knife: perTeam(null),
    gloves: perTeam(null),
    agents: perTeam(null),
    music: perTeam(null),
    pins: perTeam(null),
  }
}

const STORAGE_KEY = 'klaris.mock.loadout'
const latency = () => new Promise(r => setTimeout(r, 250 + Math.random() * 300))

function read(): Loadout {
  if (import.meta.server) return emptyLoadout()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...emptyLoadout(), ...JSON.parse(raw) } : emptyLoadout()
  } catch {
    return emptyLoadout()
  }
}

function write(loadout: Loadout) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loadout))
  } catch {
    // storage full or blocked: the mock just forgets
  }
}

async function mutate(change: (l: Loadout) => void) {
  await latency()
  const loadout = read()
  change(loadout)
  write(loadout)
}

export const mockLoadoutService: LoadoutService = {
  async load() {
    await latency()
    return read()
  },
  saveSkin: (teams, config) => mutate((l) => {
    // JSON round-trip: the config arrives as Vue reactive proxies, which
    // structuredClone rejects; it is also exactly what an API call would send.
    for (const t of teams) l.skins[t][config.defindex] = JSON.parse(JSON.stringify(config))
  }),
  removeSkin: (teams, defindex) => mutate((l) => {
    for (const t of teams) delete l.skins[t][defindex]
  }),
  setKnife: (teams, knife) => mutate((l) => {
    for (const t of teams) l.knife[t] = knife
  }),
  setGloves: (teams, defindex) => mutate((l) => {
    for (const t of teams) l.gloves[t] = defindex
  }),
  setAgent: (team, model) => mutate((l) => {
    l.agents[team] = model
  }),
  setMusic: (teams, musicId) => mutate((l) => {
    for (const t of teams) l.music[t] = musicId
  }),
  setPin: (teams, pinId) => mutate((l) => {
    for (const t of teams) l.pins[t] = pinId
  }),
  resetAll: () => mutate((l) => Object.assign(l, emptyLoadout())),
}
