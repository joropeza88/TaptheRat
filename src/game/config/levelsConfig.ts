import type { LevelConfig } from '../models/GameState'

export const LEVELS: LevelConfig[] = [
  {
    id: 'pantry-1',
    name: 'Alacena Traviesa',
    goal: {
      target: 18
    },
    maxActiveRats: 3,
    spawnIntervalMs: 680,
    activeSides: ['top', 'bottom'],
    ratTypes: {
      normal: 60,
      armored: 20,
      fast: 15,
      trap: 5
    }
  }
]
