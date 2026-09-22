import type { CategoryKey, WeaponClass, WearTier } from '~/types/skins'

export interface WeaponClassMeta {
  key: WeaponClass
  label: string
}

export const WEAPON_CLASSES: WeaponClassMeta[] = [
  { key: 'rifle', label: 'رایفل' },
  { key: 'sniper', label: 'اسنایپر' },
  { key: 'pistol', label: 'کلت' },
  { key: 'smg', label: 'SMG' },
  { key: 'shotgun', label: 'شاتگان' },
  { key: 'mg', label: 'مسلسل' },
]

/** defindex -> weapon class. Anything >= 500 in the catalog is a knife. */
const CLASS_BY_DEFINDEX: Record<number, WeaponClass> = {
  1: 'pistol', 2: 'pistol', 3: 'pistol', 4: 'pistol', 30: 'pistol', 31: 'pistol',
  32: 'pistol', 36: 'pistol', 61: 'pistol', 63: 'pistol', 64: 'pistol',
  7: 'rifle', 8: 'rifle', 10: 'rifle', 13: 'rifle', 16: 'rifle', 39: 'rifle', 60: 'rifle',
  9: 'sniper', 11: 'sniper', 38: 'sniper', 40: 'sniper',
  17: 'smg', 19: 'smg', 23: 'smg', 24: 'smg', 26: 'smg', 33: 'smg', 34: 'smg',
  25: 'shotgun', 27: 'shotgun', 29: 'shotgun', 35: 'shotgun',
  14: 'mg', 28: 'mg',
}

export function weaponClassOf(defindex: number): WeaponClass {
  // Zeus (31) sits with pistols; anything unknown and < 500 lands in mg.
  return defindex >= 500 ? 'knife' : (CLASS_BY_DEFINDEX[defindex] ?? 'mg')
}

/** Weapon selector value meaning "every weapon in this tab"; no item uses defindex 0. */
export const ALL_WEAPONS = 0

/** Weapons split into their class sections (one unlabeled section for knives). */
export function groupWeapons<T extends { defindex: number }>(weapons: T[], grouped: boolean) {
  if (!grouped) return [{ key: 'all', label: '', items: weapons }]
  return WEAPON_CLASSES
    .map(c => ({ key: c.key, label: c.label, items: weapons.filter(w => weaponClassOf(w.defindex) === c.key) }))
    .filter(g => g.items.length)
}

/** Most-used weapons first inside each class, the way players scan for them. */
export const WEAPON_ORDER = [
  7, 60, 16, 9, 61, 4, 1, 32, 36, 63, 3, 30, 2, 64, 31,
  40, 8, 39, 10, 13, 11, 38, 34, 17, 33, 23, 24, 19, 26, 35, 25, 27, 29, 14, 28,
]

export interface CategoryMeta {
  key: CategoryKey
  label: string
  icon: string
  hint: string
}

export const CATEGORIES: CategoryMeta[] = [
  { key: 'skins', label: 'اسکین اسلحه', icon: 'lucide:crosshair', hint: 'رنگ، فرسودگی، استیکر و StatTrak هر اسلحه' },
  { key: 'knives', label: 'چاقو', icon: 'lucide:swords', hint: 'مدل چاقو و اسکین آن' },
  { key: 'gloves', label: 'دستکش', icon: 'lucide:hand', hint: 'دستکش مخصوص هر تیم' },
  { key: 'agents', label: 'ایجنت', icon: 'lucide:user-round', hint: 'کاراکتر رسمی CT و T' },
  { key: 'music', label: 'موزیک MVP', icon: 'lucide:music-2', hint: 'موزیکی که موقع MVP پخش می‌شود' },
  { key: 'pins', label: 'پین', icon: 'lucide:medal', hint: 'پین روی اسکوربورد' },
]

/** Official CS2 wear brackets; colours match the in-game float bar. */
export const WEAR_TIERS: WearTier[] = [
  { key: 'fn', label: 'Factory New', short: 'FN', min: 0, max: 0.07, color: '#2ee89c' },
  { key: 'mw', label: 'Minimal Wear', short: 'MW', min: 0.07, max: 0.15, color: '#8fd84a' },
  { key: 'ft', label: 'Field-Tested', short: 'FT', min: 0.15, max: 0.38, color: '#f5c542' },
  { key: 'ww', label: 'Well-Worn', short: 'WW', min: 0.38, max: 0.45, color: '#f58d3d' },
  { key: 'bs', label: 'Battle-Scarred', short: 'BS', min: 0.45, max: 1, color: '#f4515a' },
]

export function wearTierOf(wear: number): WearTier {
  return WEAR_TIERS.find(t => wear < t.max) ?? WEAR_TIERS[WEAR_TIERS.length - 1]!
}

export const TEAM_LABEL: Record<2 | 3, string> = { 2: 'T', 3: 'CT' }
