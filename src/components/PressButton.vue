<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { audioService } from '../game/services/audioService'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    delayMs?: number
    soundSrc?: string
    class?: string
  }>(),
  {
    disabled: false,
    delayMs: 120,
    soundSrc: '/sounds/button-press.mp3'
  }
)

const emit = defineEmits<{
  click: []
}>()

const isPressing = ref(false)
let timer: number | null = null

function playSound() {
  audioService.play(props.soundSrc, { volume: 0.8 })
}

function handleClick() {
  if (props.disabled || isPressing.value) {
    return
  }

  isPressing.value = true
  playSound()
  emit('click')

  timer = window.setTimeout(() => {
    isPressing.value = false
    timer = null
  }, props.delayMs)
}

const buttonClass = computed(() =>
  isPressing.value ? 'scale-[0.96] brightness-95' : 'scale-100'
)

onBeforeUnmount(() => {
  if (timer !== null) {
    window.clearTimeout(timer)
    timer = null
  }
})
</script>

<template>
  <button
    :disabled="disabled"
    :class="[props.class, buttonClass]"
    class="transition duration-150"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
