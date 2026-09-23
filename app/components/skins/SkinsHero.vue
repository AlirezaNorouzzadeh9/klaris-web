<script setup lang="ts">
/**
 * Header of the skin settings page: what you can do here and the VIP-only
 * collection. The reset button lives under the loadout panel.
 */
</script>

<template>
  <section class="relative isolate overflow-hidden border-b border-white/8">
    <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_85%_0%,rgb(249_96_15/.12),transparent_60%)]" />
    <div class="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

    <div class="mx-auto max-w-[1560px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div class="max-w-[680px] text-right">
          <p class="flex items-center gap-3 text-[11px] font-bold tracking-[0.3em] text-brand-500">
            <span class="h-px w-8 bg-brand-500/60" /> KLARIS · CS2
          </p>

          <h1 class="mt-4 text-[30px] leading-[1.3] font-black tracking-[-0.02em] text-white sm:text-[42px]">
            تنظیمات
            <span class="bg-[linear-gradient(90deg,var(--color-brand-red),var(--color-brand-500))] bg-clip-text text-transparent">اسکین</span>
          </h1>

          <p class="mt-5 text-[14px] leading-9 text-white/65 sm:text-[15.5px]">
            اسکین‌هایی که دوست داری را همین‌جا انتخاب کن تا داخل سرورهای کلاریس دستت باشد —
            لازم نیست آن آیتم را در استیم داشته باشی.
          </p>
      </div>

      <!-- the VIP-only collection: the one thing that is not in the game itself -->
      <div class="mt-8 flex flex-col gap-4 rounded-2xl border border-gold-k/20 bg-[linear-gradient(90deg,rgb(255_215_0/.07),transparent_65%)] p-5 sm:flex-row sm:items-center sm:gap-6">
        <span class="grid size-11 shrink-0 place-items-center rounded-xl border border-gold-k/25 bg-gold-k/10 text-gold-k">
          <Icon name="lucide:crown" class="size-5" />
        </span>
        <div class="min-w-0 flex-1 text-right">
          <p class="text-[15px] font-bold text-white">فراتر از اسکین‌های خود بازی</p>
          <p class="mt-1.5 text-[13px] leading-7 text-white/50">
            جدا از تمام اسکین‌های رسمی CS2، کلاریس یک مجموعه‌ی اختصاصی هم دارد:
            مدل‌های ویژه‌ای که فقط روی سرورهای ما پیدا می‌شوند. دسترسی به آن‌ها با VIP باز می‌شود.
          </p>
        </div>
        <NuxtLink
          to="/vip"
          class="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gold-k px-4 text-[13px] font-bold text-ink-950 transition-opacity hover:opacity-90"
        >
          تهیه VIP
          <Icon name="lucide:arrow-left" class="size-4" />
        </NuxtLink>
      </div>

    </div>
  </section>
</template>
