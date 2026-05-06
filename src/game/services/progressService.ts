const STORAGE_KEY = 'tap-the-rat-progress'

export interface ProgressState {
  highestUnlockedLevel: number
  hasStarted: boolean
}

const DEFAULT_PROGRESS: ProgressState = {
  highestUnlockedLevel: 1,
  hasStarted: false
}

function sanitizeHighestUnlockedLevel(level: unknown, maxLevel: number) {
  if (typeof level !== 'number' || Number.isNaN(level)) {
    return DEFAULT_PROGRESS.highestUnlockedLevel
  }

  return Math.min(Math.max(1, Math.floor(level)), maxLevel)
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

export function unlockLevel(levelNumber: number, maxLevel: number): ProgressState {
  const current = loadProgress(maxLevel)
  const nextProgress = {
    hasStarted: true,
    highestUnlockedLevel: Math.max(
      current.highestUnlockedLevel,
      sanitizeHighestUnlockedLevel(levelNumber, maxLevel)
    )
  }

  saveProgress(nextProgress)
  return nextProgress
}
