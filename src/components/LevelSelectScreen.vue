<script setup lang="ts">
import type { LevelConfig } from '../game/models/GameState'
import PressButton from './PressButton.vue'

defineProps<{
  levels: LevelConfig[]
  highestUnlockedLevel: number
}>()

defineEmits<{
  select: [levelNumber: number]
  exit: []
}>()
</script>

<template>
  <section class="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-6 pt-5">
    <div
      class="relative flex min-h-[calc(100vh-2.75rem)] flex-col overflow-hidden rounded-[36px] border border-white/45 bg-[url('/images/linebg.webp')] p-6 shadow-[0_22px_42px_rgba(73,42,20,0.18)]"
    >
      <div class="absolute inset-0 pointer-events-none bg-[url('/images/splash_screen.webp')] bg-no-repeat bg-center bg-cover"></div>
          

      <div class="grid grid-cols-3 gap-2 mt-auto z-10">
        <button
          v-for="level in levels"
          :key="level.id"
          type="button"
          :disabled="level.number > highestUnlockedLevel"
          class="flex aspect-square flex-col items-center justify-center rounded-[28px] border-4 px-2 text-center font-black uppercase transition-all duration-150"
          :class="
            level.number < highestUnlockedLevel
              ? 'border-amber-800 bg-gradient-to-b from-amber-500 to-amber-800 text-white shadow-[0_4px_0_#bb4d00,0_14px_18px_rgba(0,0,0,0.18)] active:scale-[0.96]'
              : level.number === highestUnlockedLevel
                ? 'border-amber-700 bg-gradient-to-b from-amber-300 to-amber-600 text-black shadow-[0_4px_0_#b7791f,0_14px_18px_rgba(0,0,0,0.18)] active:scale-[0.96]'
                : 'border-slate-600 bg-gradient-to-b from-slate-700/90 to-slate-900/95 text-slate-300/80 opacity-70'
          "
          @click="level.number <= highestUnlockedLevel && $emit('select', level.number)"
        >
          <template v-if="level.number < highestUnlockedLevel">
            <span class="text-2xl font-black leading-none">{{ level.number }}</span>
            <span class="mt-2 text-xs leading-none">Cursado</span>
          </template>

          <template v-else-if="level.number === highestUnlockedLevel">
            <span class="text-2xl font-black leading-none">{{ level.number }}</span>
            <span class="mt-2 text-xs leading-none">Abierto</span>
          </template>

          <template v-else>
            <span class="text-2xl font-black leading-none">{{ level.number }}</span>
            <span class="mt-2 text-xs leading-none">Bloqueado</span>
          </template>
        </button>
      </div>

      <div class="mt-auto flex items-center justify-start pt-6">
        <PressButton
          class="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-amber-800 bg-[#f7f1dd] shadow-[0_4px_0_#bb4d00,0_14px_18px_rgba(0,0,0,0.18)] transition-all duration-150"
          @click="$emit('exit')"
        >
          <img src="/images/out.webp" alt="Salir" class="h-8 w-8 object-contain" />
        </PressButton>
      </div>
    </div>
  </section>
</template>
