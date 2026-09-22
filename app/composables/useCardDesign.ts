export type CardDesign = 'a' | 'b' | 'c' | 'd'

/** How an equipped (active) card stands out; the card itself is always the minimal one. */
export const CARD_DESIGNS: { key: CardDesign; label: string }[] = [
  { key: 'a', label: 'Glow' },
  { key: 'b', label: 'Badge' },
  { key: 'c', label: 'Bar' },
  { key: 'd', label: 'Filled' },
]

const STORAGE_KEY = 'klaris.cardActive'

/** Which active-card style the grids use; switchable while we pick one. */
export function useCardDesign() {
  const design = useState<CardDesign>('card-design', () => 'a')

  onMounted(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CardDesign | null
      if (saved && CARD_DESIGNS.some(d => d.key === saved)) design.value = saved
    } catch {}
  })

  function setDesign(next: CardDesign) {
    design.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }

  return { design, setDesign }
}
