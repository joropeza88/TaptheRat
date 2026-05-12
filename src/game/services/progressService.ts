const STORAGE_KEY = 'tap-the-rat-progress'

export interface ProgressState {
  highestUnlockedLevel: number
  completedLevels: number[]
  hasStarted: boolean
}

const DEFAULT_PROGRESS: ProgressState = {
  highestUnlockedLevel: 1,
  completedLevels: [],
  hasStarted: false
}

function sanitizeHighestUnlockedLevel(level: unknown, maxLevel: number) {
  if (typeof level !== 'number' || Number.isNaN(level)) {
    return DEFAULT_PROGRESS.highestUnlockedLevel
  }

  return Math.min(Math.max(1, Math.floor(level)), maxLevel)
}

function sanitizeCompletedLevels(levels: unknown, maxLevel: number) {
  if (!Array.isArray(levels)) {
    return DEFAULT_PROGRESS.completedLevels
  }

  const uniqueLevels = new Set<number>()

  for (const level of levels) {
    if (typeof level !== 'number' || Number.isNaN(level)) {
      continue
    }

    uniqueLevels.add(Math.min(Math.max(1, Math.floor(level)), maxLevel))
  }

  return [...uniqueLevels].sort((a, b) => a - b)
}

export function loadProgress(maxLevel: number): ProgressState {
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return DEFAULT_PROGRESS
    }

    const parsed = JSON.parse(raw) as Partial<ProgressState>

    return {
      completedLevels: sanitizeCompletedLevels(parsed.completedLevels, maxLevel),
      hasStarted: Boolean(parsed.hasStarted),
      highestUnlockedLevel: sanitizeHighestUnlockedLevel(parsed.highestUnlockedLevel, maxLevel)
    }
  } catch {
    return DEFAULT_PROGRESS
  }
}

export function saveProgress(progress: ProgressState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markGameStarted(maxLevel: number): ProgressState {
  const current = loadProgress(maxLevel)
  const nextProgress = {
    ...current,
    hasStarted: true
  }

  saveProgress(nextProgress)
  return nextProgress
}

export function completeLevel(levelNumber: number, maxLevel: number): ProgressState {
  const current = loadProgress(maxLevel)
  const sanitizedLevel = sanitizeHighestUnlockedLevel(levelNumber, maxLevel)
  const nextUnlockedLevel = Math.min(sanitizedLevel + 1, maxLevel)
  const nextProgress = {
    hasStarted: true,
    completedLevels: sanitizeCompletedLevels(
      [...current.completedLevels, sanitizedLevel],
      maxLevel
    ),
    highestUnlockedLevel: Math.max(
      current.highestUnlockedLevel,
      nextUnlockedLevel
    )
  }

  saveProgress(nextProgress)
  return nextProgress
}
