export type RatType = 'normal' | 'bomb'

export type SpawnSide = 'left' | 'right' | 'top' | 'bottom'

export interface SpawnPoint {
  id: string
  side: SpawnSide
  row: number
  isOccupied: boolean
  enabled: boolean
}

export interface RatInstance {
  id: string
  type: RatType
  row: number
  side: SpawnSide
  xPercent: number
  health: number
  maxHealth: number
  points: number
  expiresAt: number
  isDying: boolean
  removeAt: number | null
}
