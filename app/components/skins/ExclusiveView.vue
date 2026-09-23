<script setup lang="ts">
import type { CatalogExclusive, TeamId } from '~/types/skins'
import { matchesQuery } from '~/composables/useCatalog'

/**
 * Items only Klaris servers have: custom player models, knives and finishes.
 * Some are free for everyone, the rest need VIP.
 */
const { load } = useCatalog()
const { loadout, busy, setModel } = useLoadout()
const { isVip } = useVip()

const items = ref<CatalogExclusive[]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
const query = ref('')
const side = ref<TeamId>(3)
const filter = ref<'all' | 'free' | 'vip'>('all')

async function fetchCatalog() {
  state.value = 'loading'
  try {
    items.value = await load('exclusive')
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}
onMounted(fetchCatalog)

const visible = computed(() => items.value.filter(i =>
  (filter.value === 'all' || (filter.value === 'vip' ? i.vip : !i.vip))
  && matchesQuery(i.name, query.value)))

const freeCount = computed(() => items.value.filter(i => !i.vip).length)
const vipCount = computed(() => items.value.filter(i => i.vip).length)

const KIND_LABEL: Record<CatalogExclusive['kind'], string> = {
  model: 'مدل بازیکن',
  knife: 'چاقو',
  skin: 'اسکین',
}

/** A locked item is VIP-only while the player has no VIP. */
const locked = (i: CatalogExclusive) => !!i.vip && !isVip.value
const equipped = (i: CatalogExclusive) => i.kind === 'model' && loadout.value.models[side.value] === i.id

function select(i: CatalogExclusive) {
  if (locked(i) || i.soon || i.kind !== 'model') return
  setModel(side.value, equipped(i) ? null : i.id)
}
</script>

<template>
  <div v-if="state === 'error'" class="grid place-items-center gap-3 py-24 text-center text-white/50">
    <Icon name="lucide:wifi-off" class="size-9" />
    <span>لیست آیتم‌های اختصاصی لود نشد</span>
    <button type="button" class="text-brand-400 hover:underline" @click="fetchCatalog">تلاش دوباره</button>
  </div>

  <template v-else>
    <!-- what this tab is -->
    <div class="mb-5 flex flex-col gap-4 rounded-2xl border border-white/8 bg-[linear-gradient(90deg,rgb(255_215_0/.06),transparent_60%)] p-5 sm:flex-row sm:items-center">
      <span class="grid size-11 shrink-0 place-items-center rounded-xl border border-gold-k/25 bg-gold-k/10 text-gold-k">
        <Icon name="lucide:crown" class="size-5" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-[15px] font-bold text-white">آیتم‌های اختصاصی کلاریس</p>
        <p class="mt-1.5 text-[13px] leading-7 text-white/50">
          این‌ها توی خود بازی نیستند و فقط روی سرورهای ما پیدا می‌شوند.
          <span class="text-white/70">{{ freeCount }}</span> مورد برای همه آزاد است و
          <span class="text-gold-k">{{ vipCount }}</span> مورد با VIP باز می‌شود.
        </p>
      </div>
      <NuxtLink
        v-if="!isVip"
        to="/vip"
        class="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gold-k px-4 text-[13px] font-bold text-ink-950 transition-opacity hover:opacity-90"
      >
        تهیه VIP
        <Icon name="lucide:arrow-left" class="size-4" />
      </NuxtLink>
    </div>

    <!-- side + free / VIP filter -->
    <div class="mb-3.5 flex flex-wrap items-center gap-2">
      <div dir="ltr" class="grid grid-cols-2 gap-1 rounded-lg border border-white/8 bg-ink-900/80 p-1">
        <button
          v-for="s in ([3, 2] as TeamId[])"
          :key="s"
          type="button"
          class="h-8 rounded-[7px] px-4 font-mono text-[12px] font-bold transition-colors"
          :class="side === s
            ? s === 2 ? 'bg-side-t/15 text-side-t' : 'bg-side-ct/15 text-side-ct'
            : 'text-white/40 hover:text-white/70'"
          @click="side = s"
        >{{ s === 2 ? 'T' : 'CT' }}</button>
      </div>

      <div class="flex gap-1 rounded-lg border border-white/8 bg-ink-900/80 p-1">
        <button
          v-for="f in ([['all', 'همه'], ['free', 'رایگان'], ['vip', 'VIP']] as const)"
          :key="f[0]"
          type="button"
          class="h-8 rounded-[7px] px-3 text-[12.5px] font-semibold transition-colors"
          :class="filter === f[0] ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/75'"
          @click="filter = f[0]"
        >{{ f[1] }}</button>
      </div>
    </div>

    <SkinsSearchBar v-model="query" class="mb-3.5" placeholder="جستجوی آیتم اختصاصی… مثلاً Goku" />

    <div v-if="state === 'loading'" class="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(188px,1fr))]">
      <div v-for="n in 8" :key="n" class="skeleton h-[248px] rounded-xl" />
    </div>

    <SkinsEmptyResult v-else-if="!visible.length" :query="query" @clear="query = ''" />

    <div v-else class="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(188px,1fr))]">
      <article
        v-for="i in visible"
        :key="i.id"
        class="group relative flex flex-col overflow-hidden rounded-xl border transition-[border-color,transform] duration-300 ease-out-quint"
        :class="equipped(i)
          ? 'border-brand-500/45 bg-[linear-gradient(180deg,rgb(249_96_15/.16),rgb(249_96_15/.03))]'
          : 'border-white/7 bg-white/[.015] hover:-translate-y-0.5 hover:border-white/15'"
      >
        <!-- stage -->
        <button
          type="button"
          class="relative h-[168px] w-full overflow-hidden bg-[radial-gradient(90%_85%_at_50%_40%,rgb(249_96_15/.1),transparent_70%)]"
          :class="locked(i) || i.soon || i.kind !== 'model' ? 'cursor-default' : 'cursor-pointer'"
          :aria-label="i.name"
          @click="select(i)"
        >
          <img
            v-if="i.image"
            :src="i.image"
            :alt="i.name"
            loading="lazy"
            class="size-full object-cover transition-[transform,filter] duration-500"
            :class="[locked(i) && 'blur-[3px] brightness-50', !locked(i) && 'group-hover:scale-[1.04]']"
          >
          <span v-else class="grid h-full place-items-center text-white/15">
            <Icon :name="i.kind === 'knife' ? 'lucide:swords' : 'lucide:image-off'" class="size-7" />
          </span>

          <!-- VIP lock over the render -->
          <span v-if="locked(i)" class="absolute inset-0 grid place-items-center">
            <span class="grid size-11 place-items-center rounded-full border border-gold-k/40 bg-ink-950/70 text-gold-k backdrop-blur-sm">
              <Icon name="lucide:lock" class="size-5" />
            </span>
          </span>

          <span class="ltr absolute top-2 right-2 flex gap-[3px]">
            <span
              v-if="i.vip"
              class="rounded-full border border-gold-k/35 bg-ink-950/70 px-1.5 py-px font-mono text-[9px] font-bold text-gold-k backdrop-blur-sm"
            >VIP</span>
            <span
              v-else
              class="rounded-full border border-green-k/35 bg-ink-950/70 px-1.5 py-px font-mono text-[9px] font-bold text-green-k backdrop-blur-sm"
            >FREE</span>
            <span v-if="equipped(i)" class="rounded-full bg-brand-500 px-1.5 py-px font-mono text-[9px] font-bold text-white">ON</span>
          </span>
        </button>

        <!-- labels + action -->
        <div class="flex flex-1 flex-col gap-2 px-3 pt-2 pb-3 text-center">
          <span>
            <span class="block truncate text-[14px] font-bold text-white">{{ i.name }}</span>
            <span class="mt-1 block text-[11.5px] text-white/40">{{ KIND_LABEL[i.kind] }}</span>
          </span>

          <NuxtLink
            v-if="locked(i)"
            to="/vip"
            class="mt-auto flex h-8 items-center justify-center gap-1.5 rounded-[7px] border border-gold-k/35 bg-gold-k/10 text-[12px] font-bold text-gold-k transition-colors hover:bg-gold-k/20"
          >
            <Icon name="lucide:crown" class="size-3.5" />
            نیاز به VIP
          </NuxtLink>
          <span
            v-else-if="i.soon"
            class="mt-auto flex h-8 items-center justify-center rounded-[7px] border border-white/10 text-[12px] font-semibold text-white/35"
          >به‌زودی</span>
          <button
            v-else
            type="button"
            :disabled="busy === `model-${i.id}` || busy === 'model-null'"
            class="mt-auto flex h-8 items-center justify-center gap-1.5 rounded-[7px] border text-[12px] font-semibold transition-colors disabled:opacity-50"
            :class="equipped(i)
              ? 'border-brand-500/40 bg-brand-500/15 text-brand-300'
              : 'border-white/10 text-white/60 hover:border-brand-500/45 hover:text-brand-300'"
            @click="select(i)"
          >
            <Icon :name="equipped(i) ? 'lucide:check' : 'lucide:plus'" class="size-3.5" />
            {{ equipped(i) ? 'انتخاب شده' : 'انتخاب' }}
          </button>
        </div>
      </article>
    </div>
  </template>
</template>
