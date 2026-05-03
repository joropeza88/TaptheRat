import { RAT_CONFIG } from '../config/gameConfig'
import type { RatInstance, RatType, SpawnPoint } from '../models/Rat'
import { uniqueId } from '../utils/random'

export function createRat(type: RatType, spawnPoint: SpawnPoint, now: number): RatInstance {
  const config = RAT_CONFIG[type]
  const xPercent = 14 + Math.random() * 72

  return {
    id: uniqueId('rat'),
    type,
    row: spawnPoint.row,
    side: spawnPoint.side,
    xPercent,
    health: config.health,
    maxHealth: config.health,
    points: config.points,
    expiresAt: now + config.visibleTime
  }
}
