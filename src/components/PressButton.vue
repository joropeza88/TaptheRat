<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    delayMs?: number
    soundSrc?: string
    class?: string
  }>(),
  {
    disabled: false,
    delayMs: 200,
    soundSrc: '/sounds/button-press.mp3'
  }
)

const emit = defineEmits<{
  click: []
}>()

const isPressing = ref(false)
let soundTemplate: HTMLAudioElement | null = null
let timer: number | null = null

function ensureSound() {
  if (!soundTemplate) {
    soundTemplate = new Audio(props.soundSrc)
    soundTemplate.preload = 'auto'
    soundTemplate.volume = 0.8
  }

  return soundTemplate
}

function playSound() {
  const sound = ensureSound()
  sound.pause()
  sound.currentTime = 0
  void sound.play().catch(() => {})
}

function handleClick() {
  if (props.disabled || isPressing.value) {
    return
  }

  isPressing.value = true
  playSound()

  timer = window.setTimeout(() => {
    isPressing.value = false
    emit('click')
    timer = null
  }, props.delayMs)
}

const buttonClass = computed(() =>
  isPressing.value ? 'scale-[0.96] brightness-95' : 'scale-100'
)
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
