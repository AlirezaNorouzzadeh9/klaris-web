/**
 * Wraps Persian text in a right-to-left isolate so it reads correctly inside
 * an LTR field (placeholders on the English skins page).
 */
export function rtlText(text: string) {
  return `⁧${text}⁩`
}
