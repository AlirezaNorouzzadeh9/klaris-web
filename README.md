# KLARIS · CS2 Community — Web

Frontend for the KLARIS Counter-Strike 2 community servers. Persian (RTL) first.

Currently built: the **loadout / customization page** (`/skins`) — weapon skins, knives, gloves, agents, MVP music and pins, per team (T / CT), with a full skin editor (float, pattern, name tag, StatTrak, stickers, keychain).

## Stack

- [Nuxt 4](https://nuxt.com) · Vue 3 · TypeScript
- Tailwind CSS v4 (design tokens in `app/assets/css/main.css`)
- [shadcn-vue](https://www.shadcn-vue.com) for primitives only (dialog, sheet, dropdown, slider, switch, toast), restyled with KLARIS tokens
- Lucide icons via `@nuxt/icon`, Vazirmatn + JetBrains Mono via `@nuxt/fonts`

## Run

```bash
npm install
npm run dev        # http://localhost:3000/skins
npm run typecheck
npm run build
```

## Data

Player selections are **mocked** (`app/services/loadout.ts`, stored in `localStorage`). The types in `app/types/skins.ts` mirror the `wp_player_*` tables of the [WeaponPaints](https://github.com/Nereziel/cs2-WeaponPaints) plugin the game servers run, so the mock service can be replaced by an API that writes those rows without touching components.

Item catalogs live in `public/data/catalog/`. Refresh them after a CS2 update with:

```bash
python scripts/sync-catalog.py
```

It pulls the WeaponPaints item lists and fills renders missing from that repo from CSGO-API.

## Structure

```
app/
  assets/css/main.css      design tokens (colours, radius, shadows, fonts)
  components/skins/        loadout page: cards, editor, pickers, views
  components/ui/           shadcn-vue primitives (restyled)
  composables/             useCatalog (lazy catalog loading), useLoadout (state + saves)
  data/weapons.ts          weapon classes, wear tiers, categories
  services/loadout.ts      persistence interface + mock implementation
  types/skins.ts           catalog and loadout types
scripts/sync-catalog.py    catalog refresh
```

## Credits and licences

- Item catalogs in `public/data/catalog/` are derived from [Nereziel/cs2-WeaponPaints](https://github.com/Nereziel/cs2-WeaponPaints) (GPL-3.0) and [ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API) (MIT). Those files remain under their original licences.
- Item images are loaded from the WeaponPaints repository and the Steam CDN; they are not part of this repository.
- Counter-Strike and CS2 are trademarks of Valve Corporation. KLARIS is not affiliated with Valve.
