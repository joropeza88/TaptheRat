import { computed, ref } from 'vue'

export function useScore(target: number) {
  const score = ref(0)
  const progress = computed(() => Math.min(100, (score.value / target) * 100))
  const hasWon = computed(() => score.value >= target)

  function resetScore() {
    score.value = 0
  }

  function addPoints(delta: number) {
    score.value += delta
  }

  return {
    score,
    progress,
    hasWon,
    addPoints,
    resetScore
  }
}
