import type { RatType } from '../models/Rat'

export function pickRatType(weights: Record<RatType, number>): RatType {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
  const roll = Math.random() * total
  let cursor = 0

  for (const [type, weight] of Object.entries(weights) as [RatType, number][]) {
    cursor += weight

    if (roll <= cursor) {
      return type
    }
  }

  return 'normal'
}
