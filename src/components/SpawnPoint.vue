<script setup lang="ts">
import { computed } from 'vue'
import RatEnemy from './RatEnemy.vue'
import type { RatInstance, SpawnPoint as SpawnPointModel } from '../game/models/Rat'

const props = defineProps<{
  point: SpawnPointModel
  rat?: RatInstance
}>()

const emit = defineEmits<{
  attack: [row: number, side: SpawnPointModel['side'], clientX: number, clientY: number]
}>()

const pointClass = computed(() => {
  if (!props.point.enabled) {
    return 'opacity-0 pointer-events-none'
  }

  return props.point.side === 'top'
    ? 'top-0 rat-slot-top'
    : 'bottom-0 rat-slot-bottom'
})
</script>

<template>
  <div
    class="absolute left-3 right-3 z-10 h-16"
    :class="pointClass"
  >
    <RatEnemy
      v-if="rat"
      :rat="rat"
      @attack="(row, side, clientX, clientY) => emit('attack', row, side, clientX, clientY)"
    />
  </div>
</template>
