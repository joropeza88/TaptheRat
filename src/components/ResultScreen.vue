<script setup lang="ts">
import PressButton from './PressButton.vue'

const confettiPieces = [
  { x: -5.8, y: -0.8, r: -28, c: '#f97316', d: '0ms' },
  { x: -4.4, y: -2.4, r: -6, c: '#22c55e', d: '20ms' },
  { x: -2.8, y: -4.2, r: 24, c: '#facc15', d: '40ms' },
  { x: -1.2, y: -5.2, r: -18, c: '#38bdf8', d: '60ms' },
  { x: 1.4, y: -5.6, r: 20, c: '#fb7185', d: '80ms' },
  { x: 3.2, y: -4.1, r: -12, c: '#a78bfa', d: '100ms' },
  { x: 5.1, y: -2.1, r: 26, c: '#f97316', d: '120ms' },
  { x: 6.2, y: -0.4, r: -10, c: '#22c55e', d: '140ms' },
  { x: -6.1, y: 1.1, r: 18, c: '#facc15', d: '160ms' },
  { x: -4.3, y: 3.3, r: -20, c: '#38bdf8', d: '180ms' },
  { x: -1.8, y: 4.7, r: 10, c: '#fb7185', d: '200ms' },
  { x: 0.8, y: 5.1, r: -24, c: '#a78bfa', d: '220ms' },
  { x: 3.6, y: 4.2, r: 16, c: '#f97316', d: '240ms' },
  { x: 5.4, y: 2.2, r: -14, c: '#22c55e', d: '260ms' }
] as const

defineProps<{
  tone: 'victory' | 'defeat'
  icon: string
  eyebrow: string
  title: string
  message: string
  primaryLabel: string
  showShareButton?: boolean
  celebration?: boolean
}>()

defineEmits<{
  primary: []
  secondary: []
  share: []
}>()
</script>

<template>
  <section class="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-6 pt-5">
    <div
      class="relative overflow-hidden flex min-h-[calc(100vh-2.75rem)] flex-col items-center justify-center rounded-[36px] border border-white/45 p-6 text-center shadow-[0_22px_42px_rgba(73,42,20,0.18)] bg-[url('/images/linebg.png')]"
    >
      <div v-if="celebration" class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute left-1/2 top-1/2 h-0 w-0">
          <span
            v-for="(piece, index) in confettiPieces"
            :key="`burst-a-${index}`"
            class="confetti-piece"
            :style="{
              '--tx': `${piece.x}rem`,
              '--ty': `${piece.y}rem`,
              '--rot': `${piece.r}deg`,
              '--bg': piece.c,
              '--delay': piece.d
            }"
          />
          <span
            v-for="(piece, index) in confettiPieces"
            :key="`burst-b-${index}`"
            class="confetti-piece confetti-piece-second"
            :style="{
              '--tx': `${piece.x * 0.92}rem`,
              '--ty': `${piece.y * 0.92}rem`,
              '--rot': `${piece.r + 12}deg`,
              '--bg': piece.c,
              '--delay': `calc(${piece.d} + 520ms)`
            }"
          />
        </div>
      </div>
      <div class="text-7xl">{{ icon }}</div>
      <p
        class="mt-5 text-xs font-black uppercase tracking-[0.4em]"
        :class="tone === 'victory' ? 'text-emerald-800/80' : 'text-red-800/80'"
      >
        {{ eyebrow }}
      </p>
      <h2 class="mt-3 text-3xl font-black text-[var(--ink)]">{{ title }}</h2>
      <p
        class="mt-3 max-w-xs text-sm leading-6"
        :class="tone === 'victory' ? 'text-emerald-950/80' : 'text-red-950/80'"
      >
        {{ message }}
      </p>
      <PressButton
        class="relative
          h-16 w-50 mx-auto my-3
          rounded-full font-black text-xl tracking-wide text-white
          border-4 border-amber-800
          shadow-[0_4px_0_#bb4d00,0_14px_18px_rgba(0,0,0,0.18)]
          transition-all duration-150
          flex items-center justify-center 
          bg-gradient-to-b from-amber-500 to-amber-800"
        @click="$emit('primary')"
      >
        {{ primaryLabel }}
      </PressButton>
      <button
        v-if="showShareButton"
        class="mt-3 rounded-2xl border border-amber-950/15 bg-white/70 px-6 py-4 text-base font-black text-amber-950/80"
        @click="$emit('share')"
      >
        Compartir
      </button>
    </div>
  </section>
</template>

<style scoped>
.confetti-piece {
  position: absolute;
  left: 0;
  top: 0;
  width: 0.8rem;
  height: 1.1rem;
  border-radius: 0.2rem;
  background: var(--bg);
  opacity: 0;
  transform: translate(-50%, -50%) rotate(0deg) scale(0.4);
  animation: confetti-burst 760ms cubic-bezier(0.12, 0.9, 0.24, 1) forwards;
  animation-delay: var(--delay);
}

.confetti-piece-second {
  opacity: 0;
}

@keyframes confetti-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(0deg) scale(0.35);
  }

  20% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(calc(var(--rot) * 0.5)) scale(1);
  }

  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(0.9);
  }
}
</style>
