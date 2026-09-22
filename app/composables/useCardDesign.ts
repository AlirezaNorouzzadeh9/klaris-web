export type CardDesign = 'a' | 'b' | 'c' | 'd'

export const CARD_DESIGNS: { key: CardDesign; label: string }[] = [
  { key: 'a', label: 'Classic' },
  { key: 'b', label: 'Inventory' },
  { key: 'c', label: 'Showcase' },
  { key: 'd', label: 'Ticket' },
]

const STORAGE_KEY = 'klaris.cardDesign'

/** Which item-card design the grids use; switchable while we pick one. */
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
