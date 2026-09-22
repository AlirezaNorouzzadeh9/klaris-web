/** What the inspect viewer shows: any catalog render plus its labels. */
export interface InspectItem {
  image: string
  /** Dimmed stand-in when `image` has no render upstream. */
  fallback?: string
  title: string
  /** Small mono line: weapon, kit, faction or item type. */
  kicker?: string
  /** Float of the equipped copy, when there is one. */
  wear?: number
}

/** One viewer per page; any card or panel opens it with `inspect(item)`. */
export function useInspect() {
  const item = useState<InspectItem | null>('inspect-item', () => null)
  const open = useState('inspect-open', () => false)

  function inspect(next: InspectItem) {
    item.value = next
    open.value = true
  }

  return { item, open, inspect }
}
