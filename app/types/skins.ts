/**
 * Types mirror the WeaponPaints plugin: catalog entries match its data/*.json
 * files, loadout rows match its wp_player_* MySQL tables. Keeping the shapes
 * identical means the mock service can later be swapped for the real API
 * without touching components.
 */

/** WeaponPaints team column: 2 = T, 3 = CT. */
export type TeamId = 2 | 3
export const TEAMS: readonly TeamId[] = [2, 3] as const

export type CategoryKey = 'skins' | 'knives' | 'gloves' | 'agents' | 'music' | 'pins'

export type WeaponClass = 'pistol' | 'smg' | 'rifle' | 'sniper' | 'shotgun' | 'mg' | 'knife'

// ---- catalog (data/*.json) --------------------------------------------------

export interface CatalogSkin {
  weapon_defindex: number
  weapon_name: string
  paint: string | number
  image: string
  paint_name: string
  legacy_model?: boolean
}

export interface CatalogGlove {
  weapon_defindex: number
  paint: string | number
  image: string
  paint_name: string
}

export interface CatalogAgent {
  team: TeamId
  image: string
  model: string
  agent_name: string
}

/** A custom player model the server ships (PlayerModelChanger config). */
export interface CatalogModel {
  id: string
  name: string
  /** Sides that can use it; "all" means both. */
  side: 'all' | 't' | 'ct'
  /** Only VIPs can wear it. */
  vip?: boolean
}

/** A custom player model the server ships (PlayerModelChanger config). */
export interface CatalogModel {
  id: string
  name: string
  /** Sides that can use it; "all" means both. */
  side: 'all' | 't' | 'ct'
  /** Only VIPs can wear it. */
  vip?: boolean
}

/** music, collectibles (pins), keychains and stickers share this shape. */
export interface CatalogItem {
  id: string
  name: string
  image: string
}

// ---- loadout (wp_player_* rows) ---------------------------------------------

/** One weapon_sticker_N column: "id;schema;x;y;wear;scale;rotation". */
export interface StickerSlot {
  id: number
  schema: number
  x: number
  y: number
  wear: number
  scale: number
  rotation: number
}

/** weapon_keychain column: "id;x;y;z;seed". */
export interface KeychainSlot {
  id: number
  x: number
  y: number
  z: number
  seed: number
}

/** wp_player_skins row (without steamid / team, which are the map keys). */
export interface SkinConfig {
  defindex: number
  paintId: number
  wear: number
  seed: number
  nametag: string
  stattrak: boolean
  stattrakCount: number
  stickers: StickerSlot[]
  keychain: KeychainSlot
}

/** Everything one player has configured, per team. */
export interface Loadout {
  /** wp_player_skins: team -> defindex -> config */
  skins: Record<TeamId, Record<number, SkinConfig>>
  /** wp_player_knife.knife (weapon_name) */
  knife: Record<TeamId, string | null>
  /** wp_player_gloves.weapon_defindex */
  gloves: Record<TeamId, number | null>
  /** wp_player_agents.agent_t / agent_ct (model path) */
  agents: Record<TeamId, string | null>
  /** wp_player_music.music_id */
  music: Record<TeamId, number | null>
  /** wp_player_pins.id */
  pins: Record<TeamId, number | null>
  /** playermodelchanger: the server's own models, by side */
  models: Record<TeamId, string | null>
}

/** What the skin editor needs to know about the finish being configured. */
export interface EditorItem {
  defindex: number
  paintId: number
  image: string
  /** Default weapon render, used when the finish has no image upstream. */
  fallbackImage?: string
  title: string
  caption: string
}

export interface WearTier {
  key: 'fn' | 'mw' | 'ft' | 'ww' | 'bs'
  label: string
  short: string
  min: number
  max: number
  color: string
}
