import { computed, type ComputedRef, ref } from 'vue'
import { GAME_CONFIG, SIDE_TO_DIRECTION } from '../config/gameConfig'
import type { AttackVector, CatState, LevelConfig } from '../models/GameState'
import type { SpawnSide } from '../models/Rat'
import { useSpawnSystem } from './useSpawnSystem'

function resolveCatFrame(row: number, side: SpawnSide, attackVector: AttackVector): number {
  const isLeft = attackVector.x < 0

  if (row === 2) {
    return isLeft ? 6 : 7
  }

  if (row === 1 && side === 'top') {
    return isLeft ? 2 : 3
  }

  if (attackVector.y < -0.33) {
    return isLeft ? 2 : 3
  }

  if (attackVector.y > 0.33) {
    return isLeft ? 6 : 7
  }

  return isLeft ? 4 : 5
}

export function useGameLoop(level: ComputedRef<LevelConfig>) {
  const cat = ref<CatState>({
    direction: 'idle',
    isAttacking: false,
    attackVector: null,
    attackRow: null,
    spriteFrame: 1
  })
  const statusMessage = ref('Toca un ratón para atacar.')
  const lastSpawnAt = ref(0)
  const startAt = ref(0)
  const attackTimer = ref<number | null>(null)
  const statusTimer = ref<number | null>(null)
  const captures = ref(0)

  const spawnSystem = useSpawnSystem(level, GAME_CONFIG.boardRows)

  const targetCaptures = computed(() => level.value.goal.targetCaptures)
  const progress = computed(() => Math.min(100, (captures.value / targetCaptures.value) * 100))
  const isVictory = computed(() => captures.value >= targetCaptures.value)
  const timeRemainingMs = ref(level.value.goal.timeLimitSec * 1000)
  const timeRemainingSec = computed(() => Math.max(0, Math.ceil(timeRemainingMs.value / 1000)))
  const isDefeat = computed(() => timeRemainingMs.value <= 0 && !isVictory.value)

  function clearTimers() {
    if (attackTimer.value) {
      window.clearTimeout(attackTimer.value)
    }

    if (statusTimer.value) {
      window.clearTimeout(statusTimer.value)
    }
  }

  function setStatus(message: string) {
    statusMessage.value = message

    if (statusTimer.value) {
      window.clearTimeout(statusTimer.value)
    }

    statusTimer.value = window.setTimeout(() => {
      statusMessage.value = 'Mantén el ritmo y evita las trampas.'
    }, GAME_CONFIG.statusMessageMs)
  }

  function resetGame() {
    clearTimers()
    captures.value = 0
    spawnSystem.reset()
    lastSpawnAt.value = 0
    startAt.value = 0
    timeRemainingMs.value = level.value.goal.timeLimitSec * 1000
    cat.value = {
      direction: 'idle',
      isAttacking: false,
      attackVector: null,
      attackRow: null,
      spriteFrame: 1
    }
    statusMessage.value = 'Toca un ratón para atacar.'
  }

  function tick(now: number) {
    if (startAt.value === 0) {
      startAt.value = now
    }

    timeRemainingMs.value = Math.max(0, level.value.goal.timeLimitSec * 1000 - (now - startAt.value))
    spawnSystem.removeExpired(now)

    if (isVictory.value || isDefeat.value) {
      return
    }

    if (now - lastSpawnAt.value >= level.value.spawnIntervalMs) {
      spawnSystem.trySpawn(now)
      lastSpawnAt.value = now
    }
  }

  function handleAttack(row: number, side: SpawnSide, attackVector: AttackVector) {
    cat.value = {
      direction: SIDE_TO_DIRECTION[side],
      isAttacking: true,
      attackVector,
      attackRow: row,
      spriteFrame: resolveCatFrame(row, side, attackVector)
    }

    if (attackTimer.value) {
      window.clearTimeout(attackTimer.value)
    }

    attackTimer.value = window.setTimeout(() => {
      cat.value = {
        direction: 'idle',
        isAttacking: false,
        attackVector: null,
        attackRow: null,
        spriteFrame: 1
      }
    }, GAME_CONFIG.attackAnimationMs)

    const result = spawnSystem.damageRat(row, side)

    if (!result.hit) {
      setStatus('Golpe al aire.')
      return
    }

    if (result.pointsDelta < 0) {
      setStatus('Bomba activada. Visibilidad reducida.')
      return
    }

    captures.value += 1

    setStatus(`Captura ${captures.value}/${targetCaptures.value}.`)
  }

  return {
    cat,
    rats: spawnSystem.rats,
    spawnPoints: spawnSystem.spawnPoints,
    captures,
    progress,
    statusMessage,
    isVictory,
    isDefeat,
    timeRemainingSec,
    targetCaptures,
    resetGame,
    tick,
    handleAttack
  }
}
