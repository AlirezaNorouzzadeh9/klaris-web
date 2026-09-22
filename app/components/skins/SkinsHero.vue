<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

/**
 * Page header in one of four layouts (picked with useHeroDesign while we
 * compare): a Split, b Banner, c Bar, d Panel. All carry the same pieces —
 * kicker, title, blurb, equipped count, sync state, the !wp hint and reset.
 */
const { configuredCount, resetAll, busy, status } = useLoadout()
const { hero } = useHeroDesign()
const confirmOpen = ref(false)

async function copyCommand() {
  try {
    await navigator.clipboard.writeText('!wp')
    toast.success('Copied', { description: 'Type !wp in game chat.' })
  } catch {
    toast.error('Could not copy')
  }
}

async function onReset() {
  if (await resetAll()) confirmOpen.value = false
}

const blurb = 'Pick skins, knives, gloves, agents and MVP music for each side.'
const equipped = computed(() => (status.value === 'ready' ? String(configuredCount.value) : '–'))
</script>

<template>
  <section class="relative overflow-hidden border-b border-white/6">
    <div class="bg-grid pointer-events-none absolute inset-0 opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    <div
      class="pointer-events-none absolute -top-[180px] size-[560px] rounded-full bg-mint-500/[.06] blur-[130px]"
      :class="hero === 'b' ? 'left-1/2 -translate-x-1/2' : 'start-[6%]'"
    />

    <div
      class="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10"
      :class="{
        'grid gap-5 pt-6 pb-5 sm:gap-8 sm:pt-10 sm:pb-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10 lg:pt-12 lg:pb-[26px]': hero === 'a',
        'py-8 text-center sm:py-12': hero === 'b',
        'flex flex-wrap items-center gap-x-6 gap-y-3 py-4': hero === 'c',
        'py-6 sm:py-8': hero === 'd',
      }"
    >
      <!-- ───────── a · Split: title left, stats box right ───────── -->
      <template v-if="hero === 'a'">
        <div>
          <p class="ltr mb-2 inline-flex items-center gap-2 font-mono text-[10.5px] font-bold tracking-[0.3em] text-mint-500 sm:mb-3 sm:text-[11px]">
            <span class="h-px w-6 bg-mint-500/60" /> LOADOUT · CS2
          </p>
          <h1 class="text-[26px] font-black tracking-[-0.02em] text-white sm:text-[38px]">Loadout</h1>
          <p class="ltr mt-2 max-w-[560px] text-right text-[13.5px] leading-7 text-white/55 sm:mt-3 sm:text-[15px] sm:leading-[30px]">
            {{ blurb }}
            <span class="hidden sm:inline">Your loadout is the same on every Klaris server.</span>
          </p>

          <!-- on large screens the !wp hint moves into the stats box -->
          <button
            type="button"
            class="group mt-4 inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/8 bg-ink-950/60 py-[5px] ps-[5px] pe-3 text-[12.5px] text-white/60 transition-colors hover:border-mint-500/40 lg:hidden"
            @click="copyCommand"
          >
            <span class="ltr shrink-0 rounded-full bg-mint-500/12 px-2.5 py-[3px] font-mono text-[12px] font-bold text-mint-400">!wp</span>
            <span class="ltr truncate">Apply without reconnecting</span>
            <Icon name="lucide:copy" class="size-3.5 shrink-0 text-white/30 transition-colors group-hover:text-mint-400" />
          </button>
        </div>

        <div class="grid grid-cols-3 overflow-hidden rounded-xl border border-white/7 bg-ink-850/70 lg:flex lg:items-stretch">
          <div class="min-w-0 border-e border-white/6 px-3 py-3 sm:px-5 sm:py-3.5">
            <p class="truncate text-[11px] text-white/40 sm:text-[11.5px]">Equipped</p>
            <p class="mt-1 font-mono text-xl font-bold text-white sm:text-2xl">
              <span v-if="status === 'ready'">{{ configuredCount }}</span>
              <span v-else class="skeleton inline-block h-6 w-8 rounded-sm align-middle" />
            </p>
          </div>
          <div class="flex min-w-0 flex-col justify-center border-e border-white/6 px-3 py-3 sm:px-5 sm:py-3.5">
            <p class="truncate text-[11px] text-white/40 sm:text-[11.5px]">Sync</p>
            <p class="mt-1.5 flex items-center gap-2 text-[13px] font-semibold text-white sm:text-[14px]">
              <span class="relative flex size-2 shrink-0">
                <span class="absolute inset-0 animate-ping rounded-full bg-mint-500/60" />
                <span class="relative size-2 rounded-full bg-mint-500" />
              </span>
              <span class="ltr truncate">All servers</span>
            </p>
          </div>
          <div class="flex min-w-0 flex-col justify-center gap-2 px-3 py-3 sm:px-5 sm:py-3.5">
            <button
              type="button"
              class="group hidden items-center gap-2.5 rounded-full border border-white/8 bg-ink-950/60 py-[5px] ps-[5px] pe-3 text-[12.5px] text-white/60 transition-colors hover:border-mint-500/40 lg:inline-flex"
              @click="copyCommand"
            >
              <span class="ltr rounded-full bg-mint-500/12 px-2.5 py-[3px] font-mono text-[12px] font-bold text-mint-400">!wp</span>
              <span class="ltr">Apply without reconnecting</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-red-k/85 transition-colors hover:text-red-k"
              @click="confirmOpen = true"
            >
              <Icon name="lucide:rotate-ccw" class="size-3.5 shrink-0" />
              <span class="ltr lg:hidden">Reset all</span>
              <span class="ltr hidden lg:inline">Reset loadout</span>
            </button>
          </div>
        </div>
      </template>

      <!-- ───────── b · Banner: everything centred ───────── -->
      <template v-else-if="hero === 'b'">
        <p class="ltr mb-3 inline-flex items-center gap-2 font-mono text-[10.5px] font-bold tracking-[0.3em] text-mint-500 sm:text-[11px]">
          <span class="h-px w-6 bg-mint-500/60" /> LOADOUT · CS2 <span class="h-px w-6 bg-mint-500/60" />
        </p>
        <h1 class="text-[30px] font-black tracking-[-0.02em] text-white sm:text-[46px]">Loadout</h1>
        <p class="ltr mx-auto mt-3 max-w-[620px] text-[13.5px] leading-7 text-white/55 sm:text-[15px]">
          {{ blurb }} <span class="hidden sm:inline">Your loadout is the same on every Klaris server.</span>
        </p>

        <div class="ltr mt-6 flex flex-wrap items-center justify-center gap-2">
          <span class="inline-flex h-9 items-center gap-2 rounded-full border border-white/8 bg-ink-900/70 px-3.5 text-[12.5px] text-white/60">
            Equipped <span class="font-mono font-bold text-white">{{ equipped }}</span>
          </span>
          <span class="inline-flex h-9 items-center gap-2 rounded-full border border-white/8 bg-ink-900/70 px-3.5 text-[12.5px] text-white/60">
            <span class="relative flex size-2">
              <span class="absolute inset-0 animate-ping rounded-full bg-mint-500/60" />
              <span class="relative size-2 rounded-full bg-mint-500" />
            </span>
            All servers
          </span>
          <button
            type="button"
            class="group inline-flex h-9 items-center gap-2 rounded-full border border-white/8 bg-ink-900/70 ps-1.5 pe-3.5 text-[12.5px] text-white/60 transition-colors hover:border-mint-500/40"
            @click="copyCommand"
          >
            <span class="rounded-full bg-mint-500/12 px-2.5 py-[3px] font-mono text-[12px] font-bold text-mint-400">!wp</span>
            Apply without reconnecting
            <Icon name="lucide:copy" class="size-3.5 text-white/30 transition-colors group-hover:text-mint-400" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-k/25 px-3.5 text-[12.5px] font-semibold text-red-k/85 transition-colors hover:border-red-k/50 hover:text-red-k"
            @click="confirmOpen = true"
          >
            <Icon name="lucide:rotate-ccw" class="size-3.5" /> Reset loadout
          </button>
        </div>
      </template>

      <!-- ───────── c · Bar: one compact row ───────── -->
      <template v-else-if="hero === 'c'">
        <div class="ltr flex items-baseline gap-3">
          <h1 class="text-[22px] font-black tracking-[-0.02em] text-white sm:text-[26px]">Loadout</h1>
          <span class="font-mono text-[10px] font-bold tracking-[0.3em] text-mint-500">CS2</span>
        </div>
        <p class="ltr hidden min-w-0 flex-1 truncate text-[13px] text-white/45 lg:block">{{ blurb }}</p>
        <div class="ltr ms-auto flex items-center gap-2">
          <span class="inline-flex h-8 items-center gap-2 rounded-md border border-white/8 bg-ink-900/70 px-3 font-mono text-[11.5px] text-white/50">
            EQUIPPED <span class="font-bold text-white">{{ equipped }}</span>
          </span>
          <span class="hidden h-8 items-center gap-2 rounded-md border border-white/8 bg-ink-900/70 px-3 text-[12px] text-white/50 sm:inline-flex">
            <span class="relative flex size-2">
              <span class="absolute inset-0 animate-ping rounded-full bg-mint-500/60" />
              <span class="relative size-2 rounded-full bg-mint-500" />
            </span>
            All servers
          </span>
          <button
            type="button"
            class="group inline-flex h-8 items-center gap-2 rounded-md border border-white/8 bg-ink-900/70 ps-1 pe-3 text-[12px] text-white/60 transition-colors hover:border-mint-500/40"
            @click="copyCommand"
          >
            <span class="rounded-[5px] bg-mint-500/12 px-2 py-[3px] font-mono text-[11.5px] font-bold text-mint-400">!wp</span>
            <span class="hidden sm:inline">Apply without reconnecting</span>
          </button>
          <button
            type="button"
            class="grid size-8 place-items-center rounded-md border border-white/8 text-red-k/80 transition-colors hover:border-red-k/45 hover:text-red-k"
            title="Reset loadout"
            @click="confirmOpen = true"
          >
            <Icon name="lucide:rotate-ccw" class="size-3.5" />
          </button>
        </div>
      </template>

      <!-- ───────── d · Panel: one bordered card ───────── -->
      <template v-else>
        <div class="relative overflow-hidden rounded-2xl border border-white/8 bg-ink-900/80 p-5 sm:p-7">
          <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,rgb(46_232_156/.12),transparent_60%)]" />
          <div class="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p class="ltr mb-2 inline-flex items-center gap-2 font-mono text-[10.5px] font-bold tracking-[0.3em] text-mint-500">
                <span class="h-px w-6 bg-mint-500/60" /> LOADOUT · CS2
              </p>
              <h1 class="text-[26px] font-black tracking-[-0.02em] text-white sm:text-[34px]">Loadout</h1>
              <p class="ltr mt-2 max-w-[560px] text-right text-[13.5px] leading-7 text-white/55 sm:text-[14.5px]">{{ blurb }}</p>
              <div class="ltr mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="group inline-flex h-8 items-center gap-2 rounded-full border border-white/8 bg-ink-950/60 ps-1 pe-3 text-[12px] text-white/60 transition-colors hover:border-mint-500/40"
                  @click="copyCommand"
                >
                  <span class="rounded-full bg-mint-500/12 px-2.5 py-[3px] font-mono text-[11.5px] font-bold text-mint-400">!wp</span>
                  Apply without reconnecting
                </button>
                <button
                  type="button"
                  class="inline-flex h-8 items-center gap-1.5 px-1 text-[12px] font-semibold text-red-k/85 transition-colors hover:text-red-k"
                  @click="confirmOpen = true"
                >
                  <Icon name="lucide:rotate-ccw" class="size-3.5" /> Reset loadout
                </button>
              </div>
            </div>

            <div class="ltr grid grid-cols-2 gap-2.5">
              <div class="rounded-xl border border-white/7 bg-ink-950/50 px-4 py-3">
                <p class="text-[11px] text-white/40">Equipped</p>
                <p class="mt-1 font-mono text-2xl font-bold text-white">
                  <span v-if="status === 'ready'">{{ configuredCount }}</span>
                  <span v-else class="skeleton inline-block h-6 w-8 rounded-sm align-middle" />
                </p>
              </div>
              <div class="rounded-xl border border-white/7 bg-ink-950/50 px-4 py-3">
                <p class="text-[11px] text-white/40">Sync</p>
                <p class="mt-1.5 flex items-center gap-2 text-[13.5px] font-semibold text-white">
                  <span class="relative flex size-2 shrink-0">
                    <span class="absolute inset-0 animate-ping rounded-full bg-mint-500/60" />
                    <span class="relative size-2 rounded-full bg-mint-500" />
                  </span>
                  All servers
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- one reset dialog for every layout -->
    <Dialog v-model:open="confirmOpen">
      <DialogContent dir="rtl" class="border-white/10 bg-ink-900 sm:max-w-md">
        <DialogHeader class="text-start">
          <DialogTitle>Reset your whole loadout?</DialogTitle>
          <DialogDescription class="leading-7">
            Every weapon skin, knife, gloves, agent, music kit and pin goes back to the game default on both sides. This can't be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:justify-end">
          <Button variant="destructive" :disabled="busy === 'reset'" @click="onReset">
            <Icon v-if="busy === 'reset'" name="lucide:loader-2" class="animate-spin" />
            Reset everything
          </Button>
          <DialogClose as-child>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>
