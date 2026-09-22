<script setup lang="ts">
import type { CatalogItem } from '~/types/skins'
import { matchesQuery } from '~/composables/useCatalog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const props = defineProps<{
  file: 'stickers' | 'keychains'
  title: string
}>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ pick: [item: CatalogItem] }>()

const PAGE = 60
const { load } = useCatalog()
const items = ref<CatalogItem[]>([])
const state = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const query = ref('')
const limit = ref(PAGE)

/** Which catalog `items` holds; one picker serves both stickers and charms. */
let loadedFile: typeof props.file | null = null

async function fetchItems() {
  state.value = 'loading'
  try {
    items.value = await load(props.file)
    loadedFile = props.file
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}

watch(open, (isOpen) => {
  if (isOpen && (state.value !== 'ready' || loadedFile !== props.file)) fetchItems()
  if (isOpen) {
    query.value = ''
    limit.value = PAGE
  }
})
watch(query, () => (limit.value = PAGE))

const filtered = computed(() => items.value.filter(i => matchesQuery(i.name, query.value)))
const visible = computed(() => filtered.value.slice(0, limit.value))

function pick(item: CatalogItem) {
  emit('pick', item)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent dir="rtl" class="flex max-h-[85dvh] flex-col gap-0 overflow-hidden border-white/10 bg-ink-900 p-0 sm:max-w-3xl">
      <DialogHeader class="border-b border-white/6 p-5 text-start">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          <span v-if="state === 'ready'" class="font-mono">{{ filtered.length.toLocaleString('en-US') }}</span> items
        </DialogDescription>
        <div class="relative mt-3">
          <Icon name="lucide:search" class="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-white/30" />
          <input
            v-model="query"
            type="search"
            placeholder="جستجو… مثلاً Katowice یا Holo"
            class="h-10 w-full rounded-md border border-white/10 bg-ink-950/70 ps-9 pe-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-mint-500/50"
          >
        </div>
      </DialogHeader>

      <div class="min-h-0 flex-1 overflow-y-auto p-4">
        <div v-if="state === 'loading' || state === 'idle'" class="grid grid-cols-3 gap-2 sm:grid-cols-5">
          <div v-for="n in 15" :key="n" class="skeleton aspect-square rounded-md" />
        </div>

        <div v-else-if="state === 'error'" class="grid place-items-center gap-3 py-16 text-center text-white/50">
          <Icon name="lucide:wifi-off" class="size-8" />
          Could not load the list
          <button type="button" class="text-mint-400 hover:underline" @click="fetchItems">Try again</button>
        </div>

        <p v-else-if="!filtered.length" class="py-16 text-center text-white/40">Nothing found</p>

        <template v-else>
          <div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
            <button
              v-for="item in visible"
              :key="item.id"
              type="button"
              class="group flex flex-col items-center gap-1.5 rounded-md border border-white/6 bg-ink-850 p-2 transition-colors hover:border-mint-500/50 hover:bg-mint-500/[.05]"
              :title="item.name"
              @click="pick(item)"
            >
              <img :src="item.image" :alt="item.name" loading="lazy" class="aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-105">
              <span class="ltr line-clamp-2 min-h-[26px] text-center text-[10.5px] leading-tight text-white/55">{{ item.name.replace(/^(Sticker|Charm) \| /, '') }}</span>
            </button>
          </div>
          <div v-if="visible.length < filtered.length" class="mt-4 text-center">
            <button
              type="button"
              class="rounded-md border border-white/10 px-4 py-2 text-[13px] text-white/60 transition-colors hover:border-mint-500/40 hover:text-mint-300"
              @click="limit += PAGE"
            >
              Show more
            </button>
          </div>
        </template>
      </div>
    </DialogContent>
  </Dialog>
</template>
