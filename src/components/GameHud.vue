<script setup lang="ts">
defineProps<{
  levelNumber: number
  timeRemainingSec: number
  captures: number
  targetCaptures: number
  progress: number
}>()
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 top-0 z-40 mt-9 px-4">
    <header class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-black uppercase tracking-[0.35em] text-amber-950/70">Nivel</p>
        <h1 class="mt-1 text-2xl font-black text-[var(--ink)]">{{ levelNumber }}</h1>
      </div>
      <div class="pointer-events-auto rounded-2xl bg-[var(--wood-dark)] px-4 py-2 text-right text-[var(--cream)] shadow-[0_8px_20px_rgba(43,25,15,0.18)]">
        <p class="text-[10px] uppercase tracking-[0.28em] text-amber-100/75">Tiempo</p>
        <p class="text-2xl font-black">{{ timeRemainingSec }}s</p>
      </div>
    </header>
  </div>

  <footer class="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-6">
    <div class="relative flex min-h-14 items-end justify-center">
      <div class="pointer-events-auto absolute left-0 bottom-0">
        <slot name="left" />
      </div>
      <div class="pointer-events-auto w-full max-w-[14rem] rounded-full bg-white/75 px-4 py-3 shadow-[0_8px_20px_rgba(43,25,15,0.12)] backdrop-blur-sm">
        <div class="mb-2 flex items-center justify-between text-sm font-semibold text-amber-900">
          <span>Capturas</span>
          <span>{{ captures }} / {{ targetCaptures }}</span>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-amber-950/10">
          <div
            class="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-500 to-lime-500 transition-[width] duration-200"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>
    </div>
  </footer>
</template>
