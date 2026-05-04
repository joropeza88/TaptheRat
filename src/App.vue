<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import GameBoard from './components/GameBoard.vue'
import GameHud from './components/GameHud.vue'
import PressButton from './components/PressButton.vue'
import ResultScreen from './components/ResultScreen.vue'
import { LEVELS } from './game/config/levelsConfig'
import type { GameScreen } from './game/models/GameState'
import { useGameLoop } from './game/composables/useGameLoop'

const currentLevelIndex = ref(0)
const level = computed(() => LEVELS[currentLevelIndex.value])
const screen = ref<GameScreen>('home')
const preloadProgress = ref(0)
const game = useGameLoop(level)
const rafId = ref<number | null>(null)
const imageAssetsToPreload = [
  '/favicon.svg',
  '/pwa-192x192.svg',
  '/pwa-512x512.svg',
  '/images/cat_sprite.png',
  '/images/game.png',
  '/images/out.png',
  '/images/rat.png',
  '/images/rat_bomb.png',
  '/images/table.png',
  '/icons/192.png',
  '/icons/512.png'
]
const soundAssetsToPreload = [
  '/sounds/applause.mp3',
  '/sounds/bomb.mp3',
  '/sounds/button-press.mp3',
  '/sounds/claw.mp3',
  '/sounds/music.mp3'
]
const assetsToPreload = [...imageAssetsToPreload, ...soundAssetsToPreload]
let backgroundMusic: HTMLAudioElement | null = null
let applauseSound: HTMLAudioElement | null = null

const canPlay = computed(() => preloadProgress.value >= 100)
const isFinalLevel = computed(() => currentLevelIndex.value === LEVELS.length - 1)

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

function ensureBackgroundMusic() {
  if (!backgroundMusic) {
    backgroundMusic = new Audio('/sounds/music.mp3')
    backgroundMusic.loop = true
    backgroundMusic.preload = 'auto'
    backgroundMusic.volume = 0.45
  }

  return backgroundMusic
}

function playBackgroundMusic() {
  const music = ensureBackgroundMusic()

  if (!music.paused) {
    return
  }

  void music.play().catch(() => {})
}

function stopBackgroundMusic() {
  if (!backgroundMusic) {
    return
  }

  backgroundMusic.pause()
  backgroundMusic.currentTime = 0
}

function ensureApplauseSound() {
  if (!applauseSound) {
    applauseSound = new Audio('/sounds/applause.mp3')
    applauseSound.preload = 'auto'
    applauseSound.volume = 0.8
  }

  return applauseSound
}

function playApplauseSound() {
  const applause = ensureApplauseSound()
  applause.currentTime = 0
  void applause.play().catch(() => {})
}

function beginPreload() {
  preloadProgress.value = 0
  let loaded = 0

  if (assetsToPreload.length === 0) {
    preloadProgress.value = 100
    return
  }

  assetsToPreload.forEach((src) => {
    const done = () => {
      loaded += 1
      preloadProgress.value = Math.round((loaded / assetsToPreload.length) * 100)
    }

    if (src.startsWith('/sounds/')) {
      const audio = new Audio()
      audio.preload = 'auto'
      audio.onloadeddata = done
      audio.onerror = done
      audio.src = src
      audio.load()
      return
    }

    const image = new Image()
    image.onload = done
    image.onerror = done
    image.src = src
  })
}

function startGame() {
  game.resetGame()
  screen.value = 'playing'
  playBackgroundMusic()
  startLoop()
}

function startCurrentLevel() {
  game.resetGame()
  screen.value = 'playing'
  playBackgroundMusic()
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
  stopBackgroundMusic()
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
      if (isFinalLevel.value) {
        playApplauseSound()
      }
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
  ensureBackgroundMusic()
  ensureApplauseSound()
})

onBeforeUnmount(() => {
  stopLoop()
  stopBackgroundMusic()
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
          <PressButton
            class="mt-4 w-full rounded-2xl bg-[var(--wood-dark)] px-5 py-4 text-base font-black text-[var(--cream)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!canPlay"
            @click="startGame"
          >
            Jugar
          </PressButton>
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
          <PressButton
            class="flex h-14 w-14 items-center justify-center rounded-full border border-amber-950/15 bg-white/75 shadow-[0_8px_20px_rgba(43,25,15,0.12)] backdrop-blur-sm"
            @click="returnHome"
          >
            <img src="/images/out.png" alt="Salir" class="h-8 w-8 object-contain" />
          </PressButton>
        </template>
      </GameHud>

      <GameBoard
        :cat="game.cat.value"
        :rats="game.rats.value"
        :spawn-points="game.spawnPoints.value"
        @attack="(row, side, attackVector) => game.handleAttack(row, side, attackVector)"
      />
    </section>

    <ResultScreen
      v-else-if="screen === 'victory'"
      tone="victory"
      icon="🏆"
      eyebrow="Victoria"
      :title="isFinalLevel ? 'Juego completado' : 'Nivel superado'"
      :message="
        isFinalLevel
          ? `Completaste los ${LEVELS.length} niveles y capturaste ${game.captures.value} ratones en el tramo final.`
          : `Capturaste ${game.captures.value} ratones en el tiempo límite del nivel ${level.number}.`
      "
      :primary-label="currentLevelIndex < LEVELS.length - 1 ? 'Siguiente nivel' : 'Salir al inicio'"
      :show-share-button="isFinalLevel"
      :celebration="isFinalLevel"
      @primary="currentLevelIndex < LEVELS.length - 1 ? nextLevel() : returnHome()"
      @share="() => {}"
    />

    <ResultScreen
      v-else
      tone="defeat"
      icon="💥"
      eyebrow="Derrota"
      title="Tiempo agotado"
      :message="`No alcanzaste las ${level.goal.targetCaptures} capturas del nivel ${level.number} a tiempo.`"
      primary-label="Repetir nivel"
      secondary-label="Salir al inicio"
      @primary="retryLevel"
      @secondary="returnHome"
    />
  </main>
</template>
