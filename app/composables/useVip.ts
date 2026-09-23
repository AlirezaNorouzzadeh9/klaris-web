/**
 * Whether the signed-in player has VIP. Mocked until Steam sign-in and the
 * API exist; flip `MOCK_VIP` to see the unlocked state.
 */
const MOCK_VIP = false

export function useVip() {
  const isVip = useState('is-vip', () => MOCK_VIP)
  return { isVip }
}
