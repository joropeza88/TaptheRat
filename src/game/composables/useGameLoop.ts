import { computed, ref } from 'vue'
import { GAME_CONFIG, SIDE_TO_DIRECTION } from '../config/gameConfig'
import type { AttackVector, CatState, LevelConfig } from '../models/GameState'
import type { SpawnSide } from '../models/Rat'
import { useScore } from './useScore'
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

export function useGameLoop(level: LevelConfig) {
  const cat = ref<CatState>({
    direction: 'idle',
    isAttacking: false,
    attackVector: null,
    attackRow: null,
    spriteFrame: 1
  })
  const statusMessage = ref('Toca un ratón para atacar.')
  const lastSpawnAt = ref(0)
  const attackTimer = ref<number | null>(null)
  const statusTimer = ref<number | null>(null)

  const scoreSystem = useScore(level.goal.target)
  const spawnSystem = useSpawnSystem(level, GAME_CONFIG.boardRows)

  const isVictory = computed(() => scoreSystem.hasWon.value)

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
    scoreSystem.resetScore()
    spawnSystem.reset()
    lastSpawnAt.value = 0
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
    spawnSystem.removeExpired(now)

    if (isVictory.value) {
      return
    }

    if (now - lastSpawnAt.value >= level.spawnIntervalMs) {
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

    scoreSystem.addPoints(result.pointsDelta)

    if (result.pointsDelta < 0) {
      setStatus(`${result.pointsDelta} puntos. Era una trampa.`)
      return
    }

    if (result.pointsDelta === 0) {
      setStatus('Ratón resistente dañado.')
      return
    }

    setStatus(`+${result.pointsDelta} puntos.`)
  }

  return {
    cat,
    rats: spawnSystem.rats,
    spawnPoints: spawnSystem.spawnPoints,
    score: scoreSystem.score,
    progress: scoreSystem.progress,
    statusMessage,
    isVictory,
    targetScore: level.goal.target,
    resetGame,
    tick,
    handleAttack
  }
}
