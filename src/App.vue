<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import GameBoard from './components/GameBoard.vue'
import GameHud from './components/GameHud.vue'
import { LEVELS } from './game/config/levelsConfig'
import type { GameScreen } from './game/models/GameState'
import { useGameLoop } from './game/composables/useGameLoop'

const currentLevelIndex = ref(0)
const level = computed(() => LEVELS[currentLevelIndex.value])
const screen = ref<GameScreen>('home')
const preloadProgress = ref(0)
const game = useGameLoop(level)
const rafId = ref<number | null>(null)
const assetsToPreload = ['/favicon.svg', '/pwa-192x192.svg', '/pwa-512x512.svg']

const canPlay = computed(() => preloadProgress.value >= 100)

function animate() {
  game.tick(performance.now())
  rafId.value = window.requestAnimationFrame(animate)
}

function startLoop() {
  stopLoop()
  rafId.value = window.requestAnimationFrame(animate)
}

function stopLoop() {
  if (rafId.value !== null) {
    window.cancelAnimationFrame(rafId.value)
    rafId.value = null
  }
}

function beginPreload() {
  preloadProgress.value = 0
  let loaded = 0

  if (assetsToPreload.length === 0) {
    preloadProgress.value = 100
    return
  }

  assetsToPreload.forEach((src) => {
    const image = new Image()

    image.onload = image.onerror = () => {
      loaded += 1
      preloadProgress.value = Math.round((loaded / assetsToPreload.length) * 100)
    }

    image.src = src
  })
}

function startGame() {
  game.resetGame()
  screen.value = 'playing'
  startLoop()
}

function startCurrentLevel() {
  game.resetGame()
  screen.value = 'playing'
  startLoop()
}

function retryLevel() {
  startCurrentLevel()
}

function nextLevel() {
  if (currentLevelIndex.value < LEVELS.length - 1) {
    currentLevelIndex.value += 1
    startCurrentLevel()
    return
  }

  returnHome()
}

function returnHome() {
  stopLoop()
  game.resetGame()
  currentLevelIndex.value = 0
  screen.value = 'home'
  beginPreload()
}

watch(
  () => game.isVictory.value,
  (value) => {
    if (value && screen.value === 'playing') {
      stopLoop()
      screen.value = 'victory'
    }
  }
)

watch(
  () => game.isDefeat.value,
  (value) => {
    if (value && screen.value === 'playing') {
      stopLoop()
      screen.value = 'defeat'
    }
  }
)

onMounted(() => {
  beginPreload()
})

onBeforeUnmount(() => {
  stopLoop()
})
</script>

<template>
  <main class="min-h-screen w-full">
    <section
      v-if="screen === 'home'"
      class="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-4 pb-6 pt-5"
    >
      <div class="flex min-h-[calc(100vh-2.75rem)] flex-col justify-between rounded-[36px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,248,231,0.88),rgba(226,187,133,0.92))] p-6 shadow-[0_22px_42px_rgba(73,42,20,0.18)]">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.38em] text-amber-800/75">Cabinet Mode</p>
          <h1 class="mt-3 text-4xl font-black leading-none text-[var(--ink)]">Tap the Rat</h1>
          <p class="mt-4 max-w-sm text-sm leading-6 text-amber-950/80">
            Golpea ratones, evita trampas y alcanza la meta dentro de esta alacena caótica.
          </p>
        </div>

        <div class="relative mt-8 flex flex-1 items-center justify-center">
          <div class="cabinet-shadow relative flex h-[22rem] w-full max-w-sm items-center justify-center overflow-hidden rounded-[34px] border border-white/50 bg-[linear-gradient(180deg,#cf9a68_0%,#8e5d3b_100%)]">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,245,213,0.25),transparent_32%)]" />
            <div class="absolute inset-x-5 top-[5.5rem] h-6 rounded-full wood-plank" />
            <div class="absolute inset-x-5 top-[10.5rem] h-6 rounded-full wood-plank" />
            <div class="absolute inset-x-5 bottom-[5.5rem] h-6 rounded-full wood-plank" />
            <div class="absolute left-7 top-[6.5rem] text-4xl">🐭</div>
            <div class="absolute right-7 bottom-[6.5rem] text-4xl">🧨</div>
            <div class="cat-bop text-8xl">🐱</div>
          </div>
        </div>

        <div class="soft-panel rounded-[28px] border border-white/50 p-4">
          <div class="flex items-center justify-between text-xs font-black uppercase tracking-[0.24em] text-amber-800/75">
            <span>Precarga</span>
            <span>{{ preloadProgress }}%</span>
          </div>
          <div class="mt-3 h-3 overflow-hidden rounded-full bg-amber-950/10">
            <div
              class="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-500 to-lime-500 transition-[width] duration-150"
              :style="{ width: `${preloadProgress}%` }"
            />
          </div>
          <button
            class="mt-4 w-full rounded-2xl bg-[var(--wood-dark)] px-5 py-4 text-base font-black text-[var(--cream)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!canPlay"
            @click="startGame"
          >
            Jugar
          </button>
        </div>
      </div>
    </section>

    <section
      v-else-if="screen === 'playing'"
      class="relative mx-auto min-h-screen w-full max-w-md overflow-hidden"
    >
      <GameHud
        :level-number="level.number"
        :time-remaining-sec="game.timeRemainingSec.value"
        :captures="game.captures.value"
        :target-captures="game.targetCaptures.value"
        :progress="game.progress.value"
      >
        <template #left>
          <button
            class="rounded-2xl border border-amber-950/15 bg-white/75 px-4 py-3 text-sm font-bold text-amber-950/75 shadow-[0_8px_20px_rgba(43,25,15,0.12)] backdrop-blur-sm"
            @click="returnHome"
          >
            Salir
          </button>
        </template>
      </GameHud>

      <GameBoard
        :cat="game.cat.value"
        :rats="game.rats.value"
        :spawn-points="game.spawnPoints.value"
        @attack="(row, side, attackVector) => game.handleAttack(row, side, attackVector)"
      />
    </section>

    <section
      v-else-if="screen === 'victory'"
      class="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-6 pt-5"
    >
      <div
        class="flex min-h-[calc(100vh-2.75rem)] flex-col items-center justify-center rounded-[36px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,248,231,0.9),rgba(198,236,185,0.92))] p-6 text-center shadow-[0_22px_42px_rgba(73,42,20,0.18)]"
      >
        <div class="text-7xl">🏆</div>
        <p class="mt-5 text-xs font-black uppercase tracking-[0.4em] text-emerald-800/80">Victoria</p>
        <h2 class="mt-3 text-3xl font-black text-[var(--ink)]">Nivel superado</h2>
        <p class="mt-3 max-w-xs text-sm leading-6 text-emerald-950/80">
          Capturaste {{ game.captures.value }} ratones en el tiempo límite del nivel {{ level.number }}.
        </p>
        <button
          class="mt-8 rounded-2xl bg-[var(--success)] px-6 py-4 text-base font-black text-white"
          @click="currentLevelIndex < LEVELS.length - 1 ? nextLevel() : returnHome()"
        >
          {{ currentLevelIndex < LEVELS.length - 1 ? 'Siguiente nivel' : 'Salir al inicio' }}
        </button>
      </div>
    </section>

    <section
      v-else
      class="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-6 pt-5"
    >
      <div
        class="flex min-h-[calc(100vh-2.75rem)] flex-col items-center justify-center rounded-[36px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,242,231,0.92),rgba(243,187,163,0.92))] p-6 text-center shadow-[0_22px_42px_rgba(73,42,20,0.18)]"
      >
        <div class="text-7xl">💥</div>
        <p class="mt-5 text-xs font-black uppercase tracking-[0.4em] text-red-800/80">Derrota</p>
        <h2 class="mt-3 text-3xl font-black text-[var(--ink)]">Tiempo agotado</h2>
        <p class="mt-3 max-w-xs text-sm leading-6 text-red-950/80">
          No alcanzaste las {{ level.goal.targetCaptures }} capturas del nivel {{ level.number }} a tiempo.
        </p>
        <button
          class="mt-8 rounded-2xl bg-[var(--wood-dark)] px-6 py-4 text-base font-black text-white"
          @click="retryLevel"
        >
          Repetir nivel
        </button>
        <button
          class="mt-3 rounded-2xl border border-amber-950/15 bg-white/70 px-6 py-4 text-base font-black text-amber-950/80"
          @click="returnHome"
        >
          Salir al inicio
        </button>
      </div>
    </section>
  </main>
</template>
