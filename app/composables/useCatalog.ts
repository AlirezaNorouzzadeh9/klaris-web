import type { CatalogAgent, CatalogGlove, CatalogItem, CatalogSkin } from '~/types/skins'
import { WEAPON_ORDER, weaponClassOf } from '~/data/weapons'

interface CatalogFiles {
  skins: CatalogSkin[]
  gloves: CatalogGlove[]
  agents: CatalogAgent[]
  music: CatalogItem[]
  collectibles: CatalogItem[]
  keychains: CatalogItem[]
  stickers: CatalogItem[]
}

export interface WeaponEntry {
  defindex: number
  name: string
  label: string
  image: string
  skinCount: number
}

// Module-level cache: each file is fetched once per session, and only when a
// view actually needs it (stickers alone are ~2 MB).
const cache = new Map<keyof CatalogFiles, Promise<unknown>>()

export function useCatalog() {
  const base = useRuntimeConfig().public.catalogBase

  function load<K extends keyof CatalogFiles>(file: K): Promise<CatalogFiles[K]> {
    if (!cache.has(file)) {
      const request = $fetch<CatalogFiles[K]>(`${base}/${file}.json`).catch((error) => {
        cache.delete(file) // let a later call retry
        throw error
      })
      cache.set(file, request)
    }
    return cache.get(file) as Promise<CatalogFiles[K]>
  }

  return { load }
}

/** Lowercase and drop punctuation so "m4a1s" finds "M4A1-S" and "ak asiimov" finds "AK-47 | Asiimov". */
const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ')

/** Every word of the query must appear in the text, in any order. */
export function matchesQuery(text: string, query: string): boolean {
  const words = normalize(query).split(' ').filter(Boolean)
  if (!words.length) return true
  const hay = normalize(text)
  const squashed = hay.replace(/ /g, '')
  return words.every(w => hay.includes(w) || squashed.includes(w))
}

/** "AK-47  | Asiimov" -> "Asiimov"; defaults keep the weapon name. */
export function finishName(paintName: string): string {
  const parts = paintName.split('|')
  return (parts[1] ?? parts[0] ?? '').trim()
}

export function weaponLabel(paintName: string): string {
  return (paintName.split('|')[0] ?? '').replace('★', '').trim()
}

/** Distinct weapons (or knives) in catalog order, with their default render. */
export function weaponsFrom(skins: CatalogSkin[], knives: boolean): WeaponEntry[] {
  const map = new Map<number, WeaponEntry>()
  for (const skin of skins) {
    const isKnife = weaponClassOf(skin.weapon_defindex) === 'knife'
    if (isKnife !== knives) continue
    const entry = map.get(skin.weapon_defindex)
    if (entry) {
      entry.skinCount++
      continue
    }
    map.set(skin.weapon_defindex, {
      defindex: skin.weapon_defindex,
      name: skin.weapon_name,
      label: weaponLabel(skin.paint_name),
      image: skin.image,
      skinCount: 1,
    })
  }
  const list = [...map.values()]
  if (knives) return list
  const rank = (d: number) => {
    const i = WEAPON_ORDER.indexOf(d)
    return i === -1 ? 999 : i
  }
  return list.sort((a, b) => rank(a.defindex) - rank(b.defindex))
}
