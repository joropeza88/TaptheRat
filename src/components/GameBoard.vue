<script setup lang="ts">
import { computed, ref } from 'vue'
import CatPlayer from './CatPlayer.vue'
import SpawnPoint from './SpawnPoint.vue'
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

function pointFor(row: number, side: SpawnPointModel['side']) {
  return props.spawnPoints.find((point) => point.row === row && point.side === side)
}

function ratFor(row: number, side: SpawnPointModel['side']) {
  return props.rats.find((rat) => rat.row === row && rat.side === side)
}

function handleAttack(row: number, side: SpawnPointModel['side'], clientX: number, clientY: number) {
  const board = boardRef.value

  if (!board) {
    return
  }

  const rect = board.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

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
        <div class="wood-plank absolute inset-x-0 top-1/2 z-30 h-[5rem] -translate-y-1/2 bg-[url('/images/table.png')] bg-cover bg-center" />
      </div>

      <CatPlayer :cat="cat" />
    </div>
  </section>
</template>
