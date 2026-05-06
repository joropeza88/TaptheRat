<script setup lang="ts">
defineProps<{
  levelNumber: number
  timeRemainingSec: number
  captures: number
  targetCaptures: number
  progress: number
  isUrgent: boolean
}>()
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 top-12 z-40 px-4">
    <header class="flex items-start justify-between gap-4">
      
      <button
        class="
          relative
          h-16 w-40
          rounded-full
          bg-amber-800
          shadow-[0_5px_0_#bb4d00,0_10px_14px_rgba(0,0,0,0.18)]
          transition-all duration-150
          flex items-center justify-end
          pr-5
        "
      >
        <!-- panel interior -->
        <div
          class="
            absolute left-2 right-16 top-1/2 -translate-y-1/2
            h-11
            rounded-full
            bg-[#f8f0dd]
            shadow-inner
            flex items-center justify-center
            font-black text-xl tracking-wide text-[#6f4a2f]
          "
        >
          NIVEL
        </div>
        <span class="relative z-10 text-xl font-black text-[#fff3fb]">{{ levelNumber }}</span>
      </button>


      <button
        class="
          relative
          h-16 w-30
          rounded-full
          border-4 shadow-[0_4px_0_#bb4d00,0_14px_18px_rgba(0,0,0,0.18)]
          transition-all duration-150
          flex items-center justify-center
        "
        :class="
          isUrgent
            ? 'timer-alert border-red-800 bg-[#ffe1dd]'
            : 'border-amber-800 bg-[#f7f1dd]'
        "
      >
        <span
          class="font-black text-xl tracking-wide"
          :class="isUrgent ? 'text-red-900' : 'text-[#6f4a2f]'"
        >
          {{ timeRemainingSec }}s
        </span>
      </button>
    </header>
  </div>

  <footer class="pointer-events-none absolute inset-x-0 bottom-6 z-40 px-4">
    <div class="relative flex min-h-14 items-center justify-center">
      <div class="pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2">
        <slot name="left" />
      </div>
      <div class="pointer-events-auto w-full max-w-[14rem]
        rounded-full
        bg-white/30
        px-4 py-3
        border border-white/40
        shadow-[0_8px_30px_rgba(0,0,0,0.12)]
        ">
        <div class="mb-2 flex items-center justify-between text-sm font-semibold text-amber-900">
          <span>Capturas</span>
          <span>{{ captures }} / {{ targetCaptures }}</span>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-amber-950/10">
          <div
            class="h-full origin-left rounded-full bg-gradient-to-r from-orange-400 via-amber-500 to-lime-500 transition-transform duration-200"
            :style="{ transform: `scaleX(${progress / 100})` }"
          />
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.timer-alert {
  animation: timer-wobble 0.45s ease-in-out infinite;
}

@keyframes timer-wobble {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }

  25% {
    transform: rotate(-4deg) scale(1.03);
  }

  50% {
    transform: rotate(0deg) scale(1.05);
  }

  75% {
    transform: rotate(4deg) scale(1.03);
  }
}
</style>
