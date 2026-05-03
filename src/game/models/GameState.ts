import type { RatType, SpawnSide } from './Rat'

export type CatDirection = 'idle' | 'left' | 'right' | 'top' | 'bottom'
export type GameScreen = 'home' | 'playing' | 'victory'

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
  target: number
}

export interface LevelConfig {
  id: string
  name: string
  goal: GoalConfig
  maxActiveRats: number
  spawnIntervalMs: number
  activeSides: SpawnSide[]
  ratTypes: Record<RatType, number>
}

export interface AttackResult {
  hit: boolean
  side: SpawnSide
  row: number
  pointsDelta: number
  defeatedRatId?: string
}
