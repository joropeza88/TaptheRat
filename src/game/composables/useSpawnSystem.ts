import { computed, ref } from 'vue'
import type { LevelConfig } from '../models/GameState'
import type { RatInstance, SpawnPoint, SpawnSide } from '../models/Rat'
import { pickRatType } from '../services/probabilityService'
import { createRat } from '../services/ratFactory'
import { randomItem } from '../utils/random'

function buildSpawnPoints(rows: number, activeSides: SpawnSide[]): SpawnPoint[] {
  const allSides: SpawnSide[] = ['top', 'bottom']

  return Array.from({ length: rows }, (_, row) =>
    allSides.map((side) => ({
      id: `${row}-${side}`,
      row,
      side,
      isOccupied: false,
      enabled: activeSides.includes(side)
    }))
  ).flat()
}

export function useSpawnSystem(level: LevelConfig, rows: number) {
  const rats = ref<RatInstance[]>([])
  const spawnPoints = ref<SpawnPoint[]>(buildSpawnPoints(rows, level.activeSides))

  const activeRatCount = computed(() => rats.value.length)

  function syncOccupancy() {
    const occupied = new Set(rats.value.map((rat) => `${rat.row}-${rat.side}`))
    spawnPoints.value = spawnPoints.value.map((point) => ({
      ...point,
      isOccupied: occupied.has(point.id)
    }))
  }

  function reset() {
    rats.value = []
    spawnPoints.value = buildSpawnPoints(rows, level.activeSides)
  }

  function trySpawn(now: number) {
    if (activeRatCount.value >= level.maxActiveRats) {
      return
    }

    const available = spawnPoints.value.filter((point) => point.enabled && !point.isOccupied)

    if (available.length === 0) {
      return
    }

    const spawnPoint = randomItem(available)
    const type = pickRatType(level.ratTypes)
    rats.value = [...rats.value, createRat(type, spawnPoint, now)]
    syncOccupancy()
  }

  function removeExpired(now: number) {
    const next = rats.value.filter((rat) => rat.expiresAt > now)

    if (next.length !== rats.value.length) {
      rats.value = next
      syncOccupancy()
    }
  }

  function damageRat(row: number, side: SpawnSide) {
    let pointsDelta = 0
    let defeatedRatId: string | undefined
    let hit = false

    rats.value = rats.value.flatMap((rat) => {
      if (rat.row !== row || rat.side !== side) {
        return [rat]
      }

      hit = true

      if (rat.type === 'trap') {
        pointsDelta = rat.points
        defeatedRatId = rat.id
        return []
      }

      const nextHealth = rat.health - 1

      if (nextHealth <= 0) {
        pointsDelta = rat.points
        defeatedRatId = rat.id
        return []
      }

      return [
        {
          ...rat,
          health: nextHealth
        }
      ]
    })

    syncOccupancy()

    return {
      hit,
      pointsDelta,
      defeatedRatId
    }
  }

  function activeRatsForRow(row: number) {
    return rats.value.filter((rat) => rat.row === row)
  }

  return {
    rats,
    spawnPoints,
    activeRatCount,
    reset,
    trySpawn,
    removeExpired,
    damageRat,
    activeRatsForRow
  }
}
