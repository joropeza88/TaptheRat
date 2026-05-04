import { LEVEL_SYSTEM_CONFIG } from './gameConfig'
import type { LevelConfig } from '../models/GameState'

export const MAX_LEVEL = LEVEL_SYSTEM_CONFIG.maxLevel

function buildLevel(levelNumber: number): LevelConfig {
  const timeLimitSec = 18 + (levelNumber - 1) * 2
  const spawnIntervalMs = Math.max(760, 1450 - (levelNumber - 1) * 55)
  const visibleTimeMultiplier = Math.max(0.95, 1.45 - (levelNumber - 1) * 0.035)
  const maxActiveRats = Math.min(4, 1 + Math.floor((levelNumber - 1) / 3))
  const bombChance = levelNumber < 3 ? 0 : Math.min(34, 6 + (levelNumber - 3) * 2)
  const normalChance = 100 - bombChance
  const spawnWindows = Math.floor((timeLimitSec * 1000) / spawnIntervalMs)
  const expectedNormals = Math.max(8, Math.floor(spawnWindows * (normalChance / 100)))
  const targetCaptures = Math.min(expectedNormals - 2, 8 + (levelNumber - 1) * 2)

  return {
    id: `pantry-${levelNumber}`,
    number: levelNumber,
    name: `Nivel ${levelNumber}`,
    goal: {
      targetCaptures: Math.max(8, targetCaptures),
      timeLimitSec
    },
    maxActiveRats,
    spawnIntervalMs,
    visibleTimeMultiplier,
    activeSides: ['top', 'bottom'],
    ratTypes: {
      normal: normalChance,
      bomb: bombChance
    }
  }
}

export const LEVELS: LevelConfig[] = Array.from({ length: MAX_LEVEL }, (_, index) =>
  buildLevel(index + 1)
)
