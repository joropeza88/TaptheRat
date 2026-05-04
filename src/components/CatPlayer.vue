<script setup lang="ts">
import { computed } from 'vue'
import { CAT_MOTION_CONFIG } from '../game/config/gameConfig'
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
  const motionKey =
    props.cat.attackRow !== null ? `${props.cat.attackRow}-${props.cat.direction}` : null
  const rowOffset =
    motionKey && motionKey in CAT_MOTION_CONFIG.rowSideOffsetRem
      ? CAT_MOTION_CONFIG.rowSideOffsetRem[
          motionKey as keyof typeof CAT_MOTION_CONFIG.rowSideOffsetRem
        ]
      : 0
  const upwardLift =
    props.cat.direction === 'top'
      ? -CAT_MOTION_CONFIG.upwardLiftRem - Math.max(0, -clampedY) * CAT_MOTION_CONFIG.upwardLiftFactorRem
      : 0
  const translateY = upwardLift + rowOffset
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

const spriteAnimationClass = computed(() => {
  if (props.cat.isAttacking) {
    return 'cat-bop'
  }

  if (props.cat.spriteFrame === 1) {
    return 'cat-idle'
  }

  return ''
})
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
        class="h-full w-full bg-no-repeat bg-gradient-to-b from-white/15 to-black/10 opacity-95 brightness-95 drop-shadow-sm"
        :class="spriteAnimationClass"
        :style="spriteStyle"
      />
    </div>
  </div>
</template>
