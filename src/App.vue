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
      class="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center items-center overflow-hidden px-4 pb-8 pt-5 bg-[url('/images/game.png')] bg-cover bg-center"
    >
    
      <div class="absolute inset-0 bg-stone-950/20" />

      <div class="relative z-20 text-center text-white p-4">

        <p class="text-sm font-semibold uppercase tracking-[0.45em] text-amber-950/80">
          Tap the Rat
        </p>
        <h1 class="mt-4 text-5xl font-black tracking-tight">
          Captura los Ratones
        </h1>
        <p class="mt-4 max-w-sm text-sm leading-6 text-white/80">
          Golpea ratones, evita bombas y cumple la meta antes de que se acabe el tiempo.
        </p>

        <div class="mt-6 h-3 overflow-hidden rounded-full bg-amber-950/12">
          <div
            class="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-500 to-lime-500 transition-[width] duration-150"
            :style="{ width: `${preloadProgress}%` }"
          />
        </div>
        <div class="flex items-center justify-between text-xs font-black uppercase tracking-[0.24em">
          <span>{{ canPlay ? 'Listo' : 'Cargando recursos...' }}</span>
          <span>{{ preloadProgress }}%</span>
        </div>
        
        <PressButton
          type="button"
          :disabled="!canPlay"
          class="
          relative
          h-16 w-30 mx-auto my-4
          rounded-full font-black text-xl tracking-wide text-white
          border-4 border-amber-800
          shadow-[0_4px_0_#bb4d00,0_14px_18px_rgba(0,0,0,0.18)]
          transition-all duration-150
          flex items-center justify-center 
          bg-gradient-to-b from-amber-500 to-amber-800"
          @click="startGame"
        >
          Jugar
        </PressButton>
        
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
            class="relative
            h-14 w-14
            rounded-full
            bg-[#f7f1dd]
            border-4 border-amber-800
            shadow-[0_4px_0_#bb4d00,0_14px_18px_rgba(0,0,0,0.18)]
            transition-all duration-150
            flex items-center justify-center"
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
          ? `Completaste los ${LEVELS.length} niveles y capturaste todos ratones.`
          : `Capturaste todos los ratones dentro del tiempo límite.`
      "
      :primary-label="currentLevelIndex < LEVELS.length - 1 ? 'Siguiente nivel' : 'Salir'"
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
      :message="`No alcanzaste a capturar todos los ratones a tiempo.`"
      primary-label="Reintentar"
      @primary="retryLevel"
      @secondary="returnHome"
    />
  </main>
</template>
