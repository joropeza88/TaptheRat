<script setup lang="ts">
import type { RatInstance } from '../game/models/Rat'

const props = defineProps<{
  rat: RatInstance
}>()

const emit = defineEmits<{
  attack: [row: number, side: RatInstance['side'], clientX: number, clientY: number]
}>()

function handleClick(event: MouseEvent) {
  if (!props.rat || props.rat.isDying) {
    return
  }

  emit('attack', props.rat.row, props.rat.side, event.clientX, event.clientY)
}

function spriteBackground(type: RatInstance['type']) {
  return type === 'bomb' ? "url('/images/rat_bomb.webp')" : "url('/images/rat.webp')"
}
</script>

<template>
  <div
    class="rat-shell absolute left-0 top-1/2 z-20"
    :class="rat.side === 'top' ? 'rat-shell-top' : 'rat-shell-bottom'"
    :style="{ left: `${rat.xPercent}%` }"
  >
    <button
      class="rat-pop rat-sprite h-[4.5rem] w-[4.5rem] bg-contain bg-center bg-no-repeat transition duration-100 active:scale-90 bg-gradient-to-b from-white/20 to-black/15 drop-shadow-md"
      :class="[rat.side === 'bottom' ? 'scale-y-[-1]' : '', rat.isDying ? 'rat-sprite-dying' : '']"
      :style="{ backgroundImage: spriteBackground(rat.type) }"
      aria-label="raton"
      :disabled="rat.isDying"
      @click="handleClick"
    />
  </div>
</template>
