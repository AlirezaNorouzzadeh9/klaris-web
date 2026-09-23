<script setup lang="ts">
import type { CatalogItem, EditorItem, SkinConfig, TeamId } from '~/types/skins'
import { WEAR_TIERS, sidesFor, wearTierOf } from '~/data/weapons'
import { emptyKeychain, emptyStickers } from '~/services/loadout'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  item: EditorItem | null
  kind: 'weapon' | 'knife' | 'glove'
  initial?: SkinConfig
  initialTeams: TeamId[]
  busy: boolean
}>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ save: [teams: TeamId[], config: SkinConfig]; remove: [] }>()

const blank = (): SkinConfig => ({
  defindex: props.item?.defindex ?? 0,
  paintId: props.item?.paintId ?? 0,
  wear: 0.000001,
  seed: 0,
  nametag: '',
  stattrak: false,
  stattrakCount: 0,
  stickers: emptyStickers(),
  keychain: emptyKeychain(),
})

const draft = ref<SkinConfig>(blank())
const teams = ref<TeamId[]>([2, 3])
const previewFailed = ref(false)
const { inspect } = useInspect()

function openInspect() {
  if (!props.item) return
  inspect({
    image: props.item.image,
    fallback: props.item.fallbackImage,
    title: props.item.title,
    kicker: props.item.caption,
    wear: props.kind === 'glove' ? undefined : draft.value.wear,
    flip: props.kind === 'glove',
  })
}

// Stickers/keychains are stored as ids; names and images come from the catalog.
const { load } = useCatalog()
const meta = ref(new Map<string, CatalogItem>())

watch(open, async (isOpen) => {
  if (!isOpen || !props.item) return
  previewFailed.value = false
  // Keep the saved config only when it belongs to the same finish.
  const keep = props.initial && props.initial.paintId === props.item.paintId
  draft.value = keep
    ? (JSON.parse(JSON.stringify(props.initial)) as SkinConfig)
    : { ...blank(), stattrakCount: props.initial?.stattrakCount ?? 0 }
  const allowed: TeamId[] = props.item && props.kind === 'weapon' ? sidesFor(props.item.defindex) : [2, 3]
  const saved = props.initialTeams.filter(t => allowed.includes(t))
  teams.value = saved.length ? saved : [...allowed]

  const needsStickers = draft.value.stickers.some(s => s.id) || draft.value.keychain.id
  if (needsStickers) {
    const [stickers, keychains] = await Promise.all([load('stickers'), load('keychains')])
    for (const s of stickers) meta.value.set(`s${s.id}`, s)
    for (const k of keychains) meta.value.set(`k${k.id}`, k)
  }
})

/** Gloves and knives go on both sides; a weapon may be T-only or CT-only. */
const allowedSides = computed<TeamId[]>(() => (props.kind === 'weapon' && props.item ? sidesFor(props.item.defindex) : [2, 3]))

const isNew = computed(() => !props.initial || props.initial.paintId !== props.item?.paintId)
const tier = computed(() => wearTierOf(draft.value.wear))
const hasStickers = computed(() => props.kind === 'weapon')

const wearModel = computed({
  get: () => [draft.value.wear],
  set: ([v]) => (draft.value.wear = Math.max(0.000001, Number(v ?? 0))),
})
const seedModel = computed({
  get: () => [draft.value.seed],
  set: ([v]) => (draft.value.seed = Math.round(Number(v ?? 0))),
})

function pickTier(key: string) {
  const t = WEAR_TIERS.find(x => x.key === key)!
  // Best float of the bracket, like buying the cleanest copy.
  draft.value.wear = t.key === 'fn' ? 0.000001 : Number((t.min + 0.0001).toFixed(4))
}

function clampFloat(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (!Number.isNaN(v)) draft.value.wear = Math.min(1, Math.max(0.000001, v))
}

function randomSeed() {
  draft.value.seed = Math.floor(Math.random() * 1001)
}

// ---- stickers & keychain ----
const pickerOpen = ref(false)
const pickerFile = ref<'stickers' | 'keychains'>('stickers')
const pickerSlot = ref(0)

function openPicker(file: 'stickers' | 'keychains', slot = 0) {
  pickerFile.value = file
  pickerSlot.value = slot
  pickerOpen.value = true
}

function onPick(item: CatalogItem) {
  if (pickerFile.value === 'keychains') {
    meta.value.set(`k${item.id}`, item)
    // replacing a charm keeps where it hangs
    draft.value.keychain = { ...draft.value.keychain, id: Number(item.id) }
    tuning.value = 'keychain'
  } else {
    meta.value.set(`s${item.id}`, item)
    const current = draft.value.stickers[pickerSlot.value]!
    draft.value.stickers[pickerSlot.value] = { ...current, id: Number(item.id) }
    tuning.value = pickerSlot.value
  }
}

function clearSticker(i: number) {
  draft.value.stickers[i] = emptyStickers()[0]!
  if (tuning.value === i) tuning.value = null
}

function clearKeychain() {
  draft.value.keychain = emptyKeychain()
  if (tuning.value === 'keychain') tuning.value = null
}

/** Sticker slot (0-4) or the charm whose placement panel is open. */
const tuning = ref<number | 'keychain' | null>(null)
watch(() => props.item, () => { tuning.value = null })

/** Filled slot: open its settings; empty slot: pick something for it. */
function onSlot(i: number) {
  if (draft.value.stickers[i]!.id) tuning.value = tuning.value === i ? null : i
  else openPicker('stickers', i)
}
function onKeychainSlot() {
  if (draft.value.keychain.id) tuning.value = tuning.value === 'keychain' ? null : 'keychain'
  else openPicker('keychains')
}
const tunedSticker = computed(() => (typeof tuning.value === 'number' ? draft.value.stickers[tuning.value] : undefined))

function save() {
  emit('save', teams.value, { ...draft.value, defindex: props.item!.defindex, paintId: props.item!.paintId })
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent
      side="right"
      dir="ltr"
      @open-auto-focus.prevent
      class="w-full gap-0 border-white/8 bg-ink-900 p-0 sm:max-w-[540px] [&>button:last-child]:top-3.5 [&>button:last-child]:left-4 [&>button:last-child]:right-auto [&>button:last-child]:z-10"
    >
      <template v-if="item">
        <div dir="rtl" class="flex h-14 shrink-0 items-center border-b border-white/6 px-5">
          <SheetTitle class="text-[15px] font-bold">تنظیمات اسکین</SheetTitle>
          <SheetDescription class="sr-only">Set the wear, pattern, name tag, StatTrak, stickers and sides for this skin.</SheetDescription>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto">
          <!-- preview -->
          <div class="relative isolate h-[230px] overflow-hidden border-b border-white/6">
            <div class="bg-grid absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
            <div
              class="absolute left-1/2 top-1/2 -z-10 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-500"
              :style="{ background: `${tier.color}2e` }"
            />
            <img
              v-if="!previewFailed"
              :src="item.image"
              :alt="item.title"
              class="mx-auto h-full w-[78%] object-contain py-6 drop-shadow-[0_16px_20px_rgb(0_0_0/.75)]"
              :class="kind === 'glove' && '[transform:scaleX(-1)]'"
              @error="previewFailed = true"
            >
            <img
              v-else-if="item.fallbackImage"
              :src="item.fallbackImage"
              alt=""
              class="mx-auto h-full w-[78%] object-contain py-6 opacity-25 grayscale"
            >
            <button
              type="button"
              class="absolute top-3 end-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/70 px-3 text-[12px] font-semibold text-white/70 backdrop-blur-sm transition-colors hover:border-brand-500/50 hover:text-brand-300"
              @click="openInspect"
            >
              <Icon name="lucide:scan-eye" class="size-3.5" /> Inspect
            </button>
            <div class="absolute top-3 start-3 flex flex-col items-start gap-1.5">
              <span class="rounded-xs px-2 py-0.5 font-mono text-[10.5px] font-bold" :style="{ background: `${tier.color}22`, color: tier.color }">{{ tier.label }}</span>
              <span v-if="draft.stattrak" class="rounded-xs bg-[#ffd700]/15 px-2 py-0.5 font-mono text-[10.5px] font-bold text-[#ffd700]">StatTrak™ {{ draft.stattrakCount }}</span>
            </div>
            <div class="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
              <div>
                <p class="font-mono text-[10.5px] font-bold tracking-wider text-white/35">{{ item.caption }}</p>
                <p class="text-[15px] font-bold text-white">{{ item.title }}</p>
              </div>
              <p v-if="draft.nametag" class="truncate font-mono text-[12px] text-brand-300">"{{ draft.nametag }}"</p>
            </div>
          </div>

          <div class="space-y-7 p-5">
            <!-- wear -->
            <section>
              <div class="mb-3 flex items-baseline justify-between">
                <h4 class="text-[13px] font-bold text-white/80">Wear (Float)</h4>
                <input
                  :value="draft.wear"
                  type="number"
                  min="0.000001"
                  max="1"
                  step="0.000001"
                  inputmode="decimal"
                  aria-label="Float"
                  class="ltr h-8 w-28 rounded-sm border border-white/10 bg-ink-950/70 px-2 text-center font-mono text-[12.5px] text-white outline-none focus:border-brand-500/50"
                  @change="clampFloat"
                >
              </div>
              <div class="grid grid-cols-5 gap-1">
                <button
                  v-for="t in WEAR_TIERS"
                  :key="t.key"
                  type="button"
                  class="h-9 rounded-sm border font-mono text-[11.5px] font-bold transition-all"
                  :class="tier.key === t.key ? 'text-ink-950' : 'border-white/8 bg-white/[.02] text-white/45 hover:text-white/80'"
                  :style="tier.key === t.key ? { background: t.color, borderColor: t.color } : {}"
                  :title="t.label"
                  @click="pickTier(t.key)"
                >{{ t.short }}</button>
              </div>
              <!-- rail tinted by wear bracket, slider on top -->
              <div class="relative mt-4">
                <div class="absolute inset-x-0 top-1/2 flex h-1.5 -translate-y-1/2 overflow-hidden rounded-full">
                  <span v-for="t in WEAR_TIERS" :key="t.key" :style="{ width: `${(t.max - t.min) * 100}%`, background: t.color }" class="opacity-70" />
                </div>
                <Slider v-model="wearModel" dir="ltr" :min="0" :max="1" :step="0.001" class="relative [&_[data-slot=slider-range]]:bg-transparent [&_[data-slot=slider-track]]:bg-transparent" />
              </div>
            </section>

            <!-- pattern -->
            <section>
              <div class="mb-3 flex items-baseline justify-between">
                <h4 class="text-[13px] font-bold text-white/80">Pattern</h4>
                <div class="flex items-center gap-1.5">
                  <button type="button" class="grid size-8 place-items-center rounded-sm border border-white/10 text-white/50 transition-colors hover:border-brand-500/40 hover:text-brand-400" title="Random" @click="randomSeed">
                    <Icon name="lucide:dices" class="size-4" />
                  </button>
                  <input
                    v-model.number="draft.seed"
                    type="number"
                    min="0"
                    max="1000"
                    aria-label="Pattern"
                    class="ltr h-8 w-20 rounded-sm border border-white/10 bg-ink-950/70 px-2 text-center font-mono text-[12.5px] text-white outline-none focus:border-brand-500/50"
                  >
                </div>
              </div>
              <Slider v-model="seedModel" dir="ltr" :min="0" :max="1000" :step="1" />
            </section>

            <!-- name tag + stattrak -->
            <section v-if="kind !== 'glove'" class="grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-[13px] font-bold text-white/80">Name Tag</span>
                <input
                  v-model="draft.nametag"
                  maxlength="20"
                  placeholder="No name tag"
                  class="ltr h-10 w-full rounded-md border border-white/10 bg-ink-950/70 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-500/50"
                >
              </label>
              <div>
                <span class="mb-2 flex items-center justify-between text-[13px] font-bold text-white/80">
                  <span class="ltr">StatTrak™</span>
                  <Switch v-model="draft.stattrak" aria-label="StatTrak" />
                </span>
                <input
                  v-model.number="draft.stattrakCount"
                  type="number"
                  min="0"
                  :disabled="!draft.stattrak"
                  aria-label="StatTrak kill count"
                  class="ltr h-10 w-full rounded-md border border-white/10 bg-ink-950/70 px-3 font-mono text-sm text-white outline-none transition-opacity focus:border-brand-500/50 disabled:opacity-35"
                >
              </div>
            </section>

            <!-- stickers & keychain -->
            <section v-if="hasStickers">
              <h4 class="mb-3 text-[13px] font-bold text-white/80">Stickers</h4>
              <div class="grid grid-cols-5 gap-2">
                <div v-for="(s, i) in draft.stickers" :key="i" class="group relative aspect-square">
                  <button
                    type="button"
                    class="grid size-full place-items-center rounded-md border transition-colors"
                    :class="s.id
                      ? (tuning === i ? 'border-brand-500/70 bg-brand-500/8' : 'border-white/12 bg-ink-850 hover:border-white/25')
                      : 'border-dashed border-white/12 text-white/25 hover:border-brand-500/50 hover:text-brand-400'"
                    :title="s.id ? `${meta.get(`s${s.id}`)?.name ?? 'Sticker'} · settings` : `Slot ${i + 1}`"
                    @click="onSlot(i)"
                  >
                    <img v-if="s.id && meta.get(`s${s.id}`)" :src="meta.get(`s${s.id}`)!.image" alt="" class="size-[85%] object-contain">
                    <Icon v-else-if="s.id" name="lucide:sticker" class="size-5 text-white/50" />
                    <Icon v-else name="lucide:plus" class="size-4" />
                  </button>
                  <button
                    v-if="s.id"
                    type="button"
                    class="absolute -top-1.5 -end-1.5 grid size-5 place-items-center rounded-full border border-white/15 bg-ink-800 text-white/60 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-k focus:opacity-100"
                    aria-label="Remove sticker"
                    @click="clearSticker(i)"
                  >
                    <Icon name="lucide:x" class="size-3" />
                  </button>
                </div>
              </div>

              <!-- placement for the selected sticker -->
              <div v-if="tunedSticker && typeof tuning === 'number'" class="mt-3 rounded-lg border border-white/8 bg-ink-950/50 p-3.5">
                <p class="ltr mb-3.5 truncate text-left font-mono text-[11px] font-bold tracking-[.06em] text-white/55">
                  Slot {{ tuning + 1 }} · {{ meta.get(`s${tunedSticker.id}`)?.name ?? `Sticker #${tunedSticker.id}` }}
                </p>
                <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                  <SkinsAttachmentField v-model="tunedSticker.wear" label="Scratch" :min="0" :max="1" :step="0.01" />
                  <SkinsAttachmentField v-model="tunedSticker.schema" label="Surface" :min="0" :max="10" :step="1" :decimals="0" />
                  <SkinsAttachmentField v-model="tunedSticker.rotation" label="Rotation" :min="-180" :max="180" :step="0.1" :decimals="1" />
                  <SkinsAttachmentField v-model="tunedSticker.x" label="Position X" :min="-1" :max="1" :step="0.0001" :decimals="4" />
                  <SkinsAttachmentField v-model="tunedSticker.y" label="Position Y" :min="-1" :max="1" :step="0.0001" :decimals="4" />
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" class="border-white/12 bg-transparent" @click="openPicker('stickers', tuning)">
                    <Icon name="lucide:replace" /> Replace
                  </Button>
                  <Button size="sm" variant="ghost" class="text-red-k/85 hover:text-red-k" @click="clearSticker(tuning)">
                    <Icon name="lucide:trash-2" /> Remove
                  </Button>
                  <Button size="sm" class="ms-auto bg-brand-500 text-ink-950 hover:bg-brand-400" @click="tuning = null">Done</Button>
                </div>
              </div>

              <h4 class="mt-5 mb-3 text-[13px] font-bold text-white/80">Keychain</h4>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="grid size-16 shrink-0 place-items-center rounded-md border transition-colors"
                  :class="draft.keychain.id
                    ? (tuning === 'keychain' ? 'border-brand-500/70 bg-brand-500/8' : 'border-white/12 bg-ink-850 hover:border-white/25')
                    : 'border-dashed border-white/12 text-white/25 hover:border-brand-500/50 hover:text-brand-400'"
                  :title="draft.keychain.id ? 'Charm settings' : 'Add a charm'"
                  @click="onKeychainSlot"
                >
                  <img v-if="draft.keychain.id && meta.get(`k${draft.keychain.id}`)" :src="meta.get(`k${draft.keychain.id}`)!.image" alt="" class="size-[80%] object-contain">
                  <Icon v-else name="lucide:plus" class="size-4" />
                </button>
                <div class="min-w-0 flex-1">
                  <p class="ltr truncate text-left text-[13px] text-white/70">{{ draft.keychain.id ? meta.get(`k${draft.keychain.id}`)?.name ?? `#${draft.keychain.id}` : 'No keychain' }}</p>
                  <p v-if="draft.keychain.id && tuning !== 'keychain'" class="mt-1 text-[12px] text-white/35">Tap to adjust position and pattern</p>
                </div>
              </div>

              <!-- placement for the charm -->
              <div v-if="draft.keychain.id && tuning === 'keychain'" class="mt-3 rounded-lg border border-white/8 bg-ink-950/50 p-3.5">
                <p class="ltr mb-3.5 truncate text-left font-mono text-[11px] font-bold tracking-[.06em] text-white/55">
                  Charm · {{ meta.get(`k${draft.keychain.id}`)?.name ?? `#${draft.keychain.id}` }}
                </p>
                <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                  <SkinsAttachmentField v-model="draft.keychain.x" label="Position X" :min="-10" :max="10" :step="0.01" />
                  <SkinsAttachmentField v-model="draft.keychain.y" label="Position Y" :min="-10" :max="10" :step="0.01" />
                  <SkinsAttachmentField v-model="draft.keychain.z" label="Position Z" :min="-10" :max="10" :step="0.01" />
                  <SkinsAttachmentField v-model="draft.keychain.seed" label="Pattern" :min="0" :max="100000" :step="1" :decimals="0" />
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" class="border-white/12 bg-transparent" @click="openPicker('keychains')">
                    <Icon name="lucide:replace" /> Replace
                  </Button>
                  <Button size="sm" variant="ghost" class="text-red-k/85 hover:text-red-k" @click="clearKeychain">
                    <Icon name="lucide:trash-2" /> Remove
                  </Button>
                  <Button size="sm" class="ms-auto bg-brand-500 text-ink-950 hover:bg-brand-400" @click="tuning = null">Done</Button>
                </div>
              </div>
            </section>

            <!-- teams -->
            <section>
              <h4 class="mb-1 text-[13px] font-bold text-white/80">Equip on</h4>
              <p class="ltr mb-3 text-left text-[12px] text-white/40">
                {{ allowedSides.length === 1
                  ? `Only the ${allowedSides[0] === 2 ? 'T' : 'CT'} side can carry this weapon.`
                  : 'You can run different skins on T and CT.' }}
              </p>
              <SkinsTeamPicker v-model="teams" :sides="allowedSides" />
            </section>
          </div>
        </div>

        <div dir="rtl" class="flex shrink-0 items-center gap-2 border-t border-white/6 bg-ink-900 p-4">
          <Button class="flex-1" size="lg" :disabled="busy" @click="save">
            <Icon v-if="busy" name="lucide:loader-2" class="animate-spin" />
            {{ isNew ? 'ست کردن اسکین' : 'ذخیره تنظیمات' }}
          </Button>
          <Button v-if="!isNew" variant="destructive" size="lg" :disabled="busy" @click="emit('remove')">
            <Icon name="lucide:trash-2" /> پاک کردن
          </Button>
        </div>
      </template>
    </SheetContent>
  </Sheet>

  <SkinsItemPicker v-model:open="pickerOpen" :file="pickerFile" :title="pickerFile === 'stickers' ? 'Choose a sticker' : 'Choose a keychain'" @pick="onPick" />
</template>
