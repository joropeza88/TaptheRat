import type { CatDirection } from '../models/GameState'
import type { RatType, SpawnSide } from '../models/Rat'

export interface RatConfigEntry {
  points: number
  visibleTime: number
  health: number
  label: string
}

export const RAT_CONFIG: Record<RatType, RatConfigEntry> = {
  normal: {
    points: 1,
    visibleTime: 1200,
    health: 1,
    label: 'Ratón normal'
  },
  armored: {
    points: 3,
    visibleTime: 1500,
    health: 2,
    label: 'Ratón resistente'
  },
  fast: {
    points: 4,
    visibleTime: 700,
    health: 1,
    label: 'Ratón rápido'
  },
  trap: {
    points: -3,
    visibleTime: 1100,
    health: 1,
    label: 'Ratón trampa'
  }
}

export const GAME_CONFIG = {
  attackAnimationMs: 180,
  spawnIntervalMs: 680,
  statusMessageMs: 900,
  boardRows: 3
} as const

export const SIDE_TO_DIRECTION: Record<SpawnSide, CatDirection> = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom'
}
