<script setup lang="ts">
import { computed } from 'vue'
import type { CatState } from '../game/models/GameState'

const props = defineProps<{
  cat: CatState
}>()

const containerStyle = computed(() => {
  const vector = props.cat.attackVector

  if (!props.cat.isAttacking || !vector) {
    return {
      transform: 'translate3d(0, 0, 0) rotate(0deg)'
    }
  }

  const clampedX = Math.max(-1, Math.min(1, vector.x))
  const clampedY = Math.max(-1, Math.min(1, vector.y))
  let rowOffset = 0

  if (props.cat.attackRow === 0) {
    rowOffset = -7.6
  } else if (props.cat.attackRow === 2) {
    rowOffset = 7.6
  } else if (props.cat.attackRow === 1) {
    rowOffset = props.cat.direction === 'top' ? -2.4 : 2.4
  }

  const translateY = -0.35 - Math.max(0, -clampedY) * 0.35 + rowOffset
  const rotation = clampedX * 4.5

  return {
    transform: `translate3d(0, ${translateY}rem, 0) rotate(${rotation}deg)`
  }
})

const spriteStyle = computed(() => ({
  backgroundImage: "url('/images/cat_sprite.png')",
  backgroundPosition: `${-(props.cat.spriteFrame - 1) * 400}px 0px`,
  backgroundSize: '2800px 400px'
}))
</script>

<template>
  <div
    class="pointer-events-none absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
  >
    <div
      class="relative h-[400px] w-[400px] transition-transform duration-150"
      :style="containerStyle"
    >
      <div
        class="h-full w-full bg-no-repeat"
        :class="props.cat.isAttacking ? 'cat-bop' : ''"
        :style="spriteStyle"
      />
    </div>
  </div>
</template>
