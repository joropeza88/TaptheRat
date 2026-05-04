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
  bomb: {
    points: -3,
    visibleTime: 1100,
    health: 1,
    label: 'Ratón bomba'
  }
}

export const GAME_CONFIG = {
  attackAnimationMs: 180,
  ratDefeatAnimationMs: 260,
  scratchAnimationMs: 260,
  bombExplosionAnimationMs: 420,
  bombBlurOverlayMs: 2000,
  spawnIntervalMs: 680,
  statusMessageMs: 900,
  boardRows: 3
} as const

export const LEVEL_SYSTEM_CONFIG = {
  maxLevel: 13
} as const

export const CAT_MOTION_CONFIG = {
  upwardLiftRem: 0.35,
  upwardLiftFactorRem: 0.35,
  rowSideOffsetRem: {
    '0-top': -14,
    '0-bottom': -8,
    '1-top': -4,
    '2-bottom': 9.2
  } as const
} as const

export const SIDE_TO_DIRECTION: Record<SpawnSide, CatDirection> = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom'
}
