import type { RatType, SpawnSide } from './Rat'

export type CatDirection = 'idle' | 'left' | 'right' | 'top' | 'bottom'
export type GameScreen = 'home' | 'playing' | 'victory' | 'defeat'

export interface AttackVector {
  x: number
  y: number
}

export interface CatState {
  direction: CatDirection
  isAttacking: boolean
  attackVector: AttackVector | null
  attackRow: number | null
  spriteFrame: number
}

export interface GoalConfig {
  targetCaptures: number
  timeLimitSec: number
}

export interface LevelConfig {
  id: string
  number: number
  name: string
  goal: GoalConfig
  maxActiveRats: number
  spawnIntervalMs: number
  visibleTimeMultiplier: number
  activeSides: SpawnSide[]
  ratTypes: Record<RatType, number>
}
