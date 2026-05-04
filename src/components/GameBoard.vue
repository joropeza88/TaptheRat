<script setup lang="ts">
import { computed, ref } from 'vue'
import CatPlayer from './CatPlayer.vue'
import SpawnPoint from './SpawnPoint.vue'
import { GAME_CONFIG } from '../game/config/gameConfig'
import type { AttackVector, CatState } from '../game/models/GameState'
import type { RatInstance, SpawnPoint as SpawnPointModel } from '../game/models/Rat'

const props = defineProps<{
  cat: CatState
  rats: RatInstance[]
  spawnPoints: SpawnPointModel[]
}>()

const emit = defineEmits<{
  attack: [row: number, side: SpawnPointModel['side'], attackVector: AttackVector]
}>()

const rows = computed(() => [0, 1, 2])
const boardRef = ref<HTMLElement | null>(null)
const scratches = ref<{ id: number; x: number; y: number; rotate: number }[]>([])
const explosions = ref<{ id: number; x: number; y: number }[]>([])
const bombOverlayActive = ref(false)
let clawSoundTemplate: HTMLAudioElement | null = null
let bombSoundTemplate: HTMLAudioElement | null = null
let bombOverlayTimer: number | null = null

function pointFor(row: number, side: SpawnPointModel['side']) {
  return props.spawnPoints.find((point) => point.row === row && point.side === side)
}

function ratFor(row: number, side: SpawnPointModel['side']) {
  return props.rats.find((rat) => rat.row === row && rat.side === side)
}

function playScratchSound() {
  if (!clawSoundTemplate) {
    clawSoundTemplate = new Audio('/sounds/claw.mp3')
    clawSoundTemplate.preload = 'auto'
    clawSoundTemplate.volume = 0.8
  }

  const sound = clawSoundTemplate.cloneNode() as HTMLAudioElement
  sound.volume = clawSoundTemplate.volume
  void sound.play().catch(() => {})
}

function playBombSound() {
  if (!bombSoundTemplate) {
    bombSoundTemplate = new Audio('/sounds/bomb.mp3')
    bombSoundTemplate.preload = 'auto'
    bombSoundTemplate.volume = 0.9
  }

  const sound = bombSoundTemplate.cloneNode() as HTMLAudioElement
  sound.volume = bombSoundTemplate.volume
  void sound.play().catch(() => {})
}

function addScratch(clientX: number, clientY: number, rect: DOMRect) {
  const x = ((clientX - rect.left) / rect.width) * 100
  const y = ((clientY - rect.top) / rect.height) * 100
  const id = Date.now() + Math.floor(Math.random() * 1000)
  const rotate = x < 50 ? -16 : 16

  scratches.value = [...scratches.value, { id, x, y, rotate }]
  playScratchSound()

  window.setTimeout(() => {
    scratches.value = scratches.value.filter((scratch) => scratch.id !== id)
  }, GAME_CONFIG.scratchAnimationMs)
}

function addExplosion(clientX: number, clientY: number, rect: DOMRect) {
  const x = ((clientX - rect.left) / rect.width) * 100
  const y = ((clientY - rect.top) / rect.height) * 100
  const id = Date.now() + Math.floor(Math.random() * 1000)

  explosions.value = [...explosions.value, { id, x, y }]
  playBombSound()

  window.setTimeout(() => {
    explosions.value = explosions.value.filter((explosion) => explosion.id !== id)
  }, GAME_CONFIG.bombExplosionAnimationMs)
}

function triggerBombOverlay() {
  bombOverlayActive.value = true

  if (bombOverlayTimer !== null) {
    window.clearTimeout(bombOverlayTimer)
  }

  bombOverlayTimer = window.setTimeout(() => {
    bombOverlayActive.value = false
    bombOverlayTimer = null
  }, GAME_CONFIG.bombBlurOverlayMs)
}

function handleAttack(row: number, side: SpawnPointModel['side'], clientX: number, clientY: number) {
  const board = boardRef.value

  if (!board) {
    return
  }

  const rect = board.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const rat = ratFor(row, side)

  addScratch(clientX, clientY, rect)

  if (rat?.type === 'bomb') {
    addExplosion(clientX, clientY, rect)
    triggerBombOverlay()
  }

  emit('attack', row, side, {
    x: (clientX - centerX) / (rect.width / 2),
    y: (clientY - centerY) / (rect.height / 2)
  })
}
</script>

<template>
  <section
    ref="boardRef"
    class="relative h-screen overflow-hidden px-4 py-6"
  >
    <!-- Fondo lejano -->
    <div class="absolute inset-0 
                bg-[url('/images/game.png')] 
                bg-cover 
                bg-center
                opacity-50 blur-[2px] 
                scale-105
                z-0">
    </div>
    <div
      class="pointer-events-none absolute inset-0 z-40 transition-opacity duration-300"
      :class="bombOverlayActive ? 'opacity-100' : 'opacity-0'"
      style="background: rgba(32, 19, 14, 0.34); backdrop-filter: blur(10px);"
    />
    <div class="relative flex h-full flex-col justify-center gap-12 pt-28 pb-28">
      <div
        v-for="row in rows"
        :key="row"
        class="relative flex h-[8.5rem] items-center overflow-visible"
      >
        <SpawnPoint
          v-for="side in ['top', 'bottom']"
          :key="`${row}-${side}`"
          :point="pointFor(row, side)!"
          :rat="ratFor(row, side)"
          @attack="(attackRow, attackSide, clientX, clientY) => handleAttack(attackRow, attackSide, clientX, clientY)"
        />
        <div class="wood-plank absolute inset-x-0 top-1/2 z-30 h-[5rem] -translate-y-1/2 bg-[url('/images/table.png')] bg-contain bg-center bg-no-repeat drop-shadow-lg bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      <CatPlayer :cat="cat" />

      <div
        v-for="scratch in scratches"
        :key="scratch.id"
        class="scratch-mark pointer-events-none absolute z-50"
        :style="{ left: `${scratch.x}%`, top: `${scratch.y}%`, transform: `translate(-50%, -50%) rotate(${scratch.rotate}deg)` }"
      >
        <span />
        <span />
        <span />
      </div>

      <div
        v-for="explosion in explosions"
        :key="explosion.id"
        class="bomb-burst pointer-events-none absolute z-50"
        :style="{ left: `${explosion.x}%`, top: `${explosion.y}%` }"
      >
        <i />
        <i />
        <i />
        <i />
        <b />
      </div>
    </div>
  </section>
</template>
