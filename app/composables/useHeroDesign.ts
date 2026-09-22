export type HeroDesign = 'a' | 'b' | 'c' | 'd'

/** Layouts for the page header above the loadout. */
export const HERO_DESIGNS: { key: HeroDesign; label: string }[] = [
  { key: 'a', label: 'Split' },
  { key: 'b', label: 'Banner' },
  { key: 'c', label: 'Bar' },
  { key: 'd', label: 'Panel' },
]

const STORAGE_KEY = 'klaris.heroDesign'

/** Which header layout the skins page uses; switchable while we pick one. */
export function useHeroDesign() {
  const hero = useState<HeroDesign>('hero-design', () => 'a')

  onMounted(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as HeroDesign | null
      if (saved && HERO_DESIGNS.some(d => d.key === saved)) hero.value = saved
    } catch {}
  })

  function setHero(next: HeroDesign) {
    hero.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }

  return { hero, setHero }
}
