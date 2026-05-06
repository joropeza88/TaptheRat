<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import CatPlayer from './CatPlayer.vue'
import SpawnPoint from './SpawnPoint.vue'
import { GAME_CONFIG } from '../game/config/gameConfig'
import type { AttackVector, CatState } from '../game/models/GameState'
import type { RatInstance, SpawnPoint as SpawnPointModel } from '../game/models/Rat'
import { audioService } from '../game/services/audioService'

const props = defineProps<{
  cat: CatState
  rats: RatInstance[]
  spawnPoints: SpawnPointModel[]
}>()

const emit = defineEmits<{
  attack: [row: number, side: SpawnPointModel['side'], attackVector: AttackVector]
}>()

const rows = computed(() => [0, 1, 2])
const sides = ['top', 'bottom'] as const
const boardRef = ref<HTMLElement | null>(null)
const scratches = ref(
  Array.from({ length: 4 }, (_, index) => ({
    slotId: index,
    renderKey: 0,
    visible: false,
    x: 0,
    y: 0,
    rotate: 0
  }))
)
const explosions = ref(
  Array.from({ length: 3 }, (_, index) => ({
    slotId: index,
    renderKey: 0,
    visible: false,
    x: 0,
    y: 0
  }))
)
const bombOverlayActive = ref(false)
let bombOverlayTimer: number | null = null
const scratchTimers = new Set<number>()
const explosionTimers = new Set<number>()
let scratchCursor = 0
let explosionCursor = 0

const pointMap = computed(() => {
  const next = new Map<string, SpawnPointModel>()

  for (const point of props.spawnPoints) {
    next.set(point.id, point)
  }

  return next
})

const ratMap = computed(() => {
  const next = new Map<string, RatInstance>()

  for (const rat of props.rats) {
    next.set(`${rat.row}-${rat.side}`, rat)
  }

  return next
})

const slots = computed(() =>
  rows.value.flatMap((row) =>
    sides.map((side) => ({
      id: `${row}-${side}`,
      point: pointMap.value.get(`${row}-${side}`)!,
      rat: ratMap.value.get(`${row}-${side}`),
      row,
      side
    }))
  )
)

const slotsByRow = computed(() =>
  rows.value.map((row) => slots.value.filter((slot) => slot.row === row))
)

function playScratchSound() {
  audioService.play('/sounds/claw.mp3', { volume: 0.8 })
}

function playBombSound() {
  audioService.play('/sounds/bomb.mp3', { volume: 0.9 })
}

function triggerBombVibration() {
  try {
    const supportsTouch = navigator.maxTouchPoints > 0
      || window.matchMedia?.('(pointer: coarse)').matches

    if (!supportsTouch || typeof navigator.vibrate !== 'function') {
      return
    }

    navigator.vibrate(GAME_CONFIG.bombVibrationMs)
  } catch {
    // Ignore vibration failures on unsupported devices/browsers.
  }
}

function addScratch(clientX: number, clientY: number, rect: DOMRect) {
  const x = ((clientX - rect.left) / rect.width) * 100
  const y = ((clientY - rect.top) / rect.height) * 100
  const rotate = x < 50 ? -16 : 16
  const slotIndex = scratchCursor % scratches.value.length
  const effect = scratches.value[slotIndex]

  scratchCursor += 1
  effect.visible = false
  effect.x = x
  effect.y = y
  effect.rotate = rotate
  effect.renderKey += 1
  effect.visible = true
  playScratchSound()

  const timer = window.setTimeout(() => {
    effect.visible = false
    scratchTimers.delete(timer)
  }, GAME_CONFIG.scratchAnimationMs)

  scratchTimers.add(timer)
}

function addExplosion(clientX: number, clientY: number, rect: DOMRect) {
  const x = ((clientX - rect.left) / rect.width) * 100
  const y = ((clientY - rect.top) / rect.height) * 100
  const slotIndex = explosionCursor % explosions.value.length
  const effect = explosions.value[slotIndex]

  explosionCursor += 1
  effect.visible = false
  effect.x = x
  effect.y = y
  effect.renderKey += 1
  effect.visible = true
  playBombSound()
  triggerBombVibration()

  const timer = window.setTimeout(() => {
    effect.visible = false
    explosionTimers.delete(timer)
  }, GAME_CONFIG.bombExplosionAnimationMs)

  explosionTimers.add(timer)
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
  const rat = ratMap.value.get(`${row}-${side}`)

  if (rat?.type === 'bomb') {
    addExplosion(clientX, clientY, rect)
    triggerBombOverlay()
  } else {
    addScratch(clientX, clientY, rect)
  }

  emit('attack', row, side, {
    x: (clientX - centerX) / (rect.width / 2),
    y: (clientY - centerY) / (rect.height / 2)
  })
}

onBeforeUnmount(() => {
  scratchTimers.forEach((timer) => window.clearTimeout(timer))
  explosionTimers.forEach((timer) => window.clearTimeout(timer))
  scratchTimers.clear()
  explosionTimers.clear()

  if (bombOverlayTimer !== null) {
    window.clearTimeout(bombOverlayTimer)
    bombOverlayTimer = null
  }

  scratches.value.forEach((effect) => {
    effect.visible = false
  })
  explosions.value.forEach((effect) => {
    effect.visible = false
  })
  bombOverlayActive.value = false
})
</script>

<template>
  <section
    ref="boardRef"
    class="relative h-screen overflow-hidden px-4 py-6"
  >
    <!-- Fondo lejano -->
    <div class="absolute inset-0 
                bg-[url('/images/game.webp')] 
                bg-cover 
                bg-center
                opacity-50
                scale-105
                z-0">
    </div>
    <div
      class="pointer-events-none absolute inset-0 z-40 transition-opacity duration-300"
      :class="bombOverlayActive ? 'opacity-100' : 'opacity-0'"
    >
      <div class="bomb-penalty-overlay absolute inset-0" />
    </div>
    <div class="relative flex h-full flex-col justify-center gap-12 pt-28 pb-28">
      <div
        v-for="row in rows"
        :key="row"
        class="relative flex h-[8.5rem] items-center overflow-visible"
      >
        <SpawnPoint
          v-for="slot in slotsByRow[row]"
          :key="slot.id"
          :point="slot.point"
          :rat="slot.rat"
          @attack="(attackRow, attackSide, clientX, clientY) => handleAttack(attackRow, attackSide, clientX, clientY)"
        />
        <div class="wood-plank absolute inset-x-0 top-1/2 z-30 h-[5rem] -translate-y-1/2 bg-[url('/images/table.webp')] bg-contain bg-center bg-no-repeat drop-shadow-lg bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      <CatPlayer :cat="cat" />

      <div
        v-for="scratch in scratches"
        :key="`${scratch.slotId}-${scratch.renderKey}`"
        v-show="scratch.visible"
        class="scratch-mark pointer-events-none absolute z-50"
        :style="{ left: `${scratch.x}%`, top: `${scratch.y}%`, transform: `translate(-50%, -50%) rotate(${scratch.rotate}deg)` }"
      >
        <span />
        <span />
        <span />
      </div>

      <div
        v-for="explosion in explosions"
        :key="`${explosion.slotId}-${explosion.renderKey}`"
        v-show="explosion.visible"
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
