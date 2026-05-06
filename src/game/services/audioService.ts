type AudioBufferMap = Map<string, AudioBuffer>
type LoopHandleMap = Map<string, { source: AudioBufferSourceNode; gain: GainNode }>

class AudioService {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  private buffers: AudioBufferMap = new Map()
  private preloadPromises = new Map<string, Promise<void>>()
  private loopHandles: LoopHandleMap = new Map()

  private ensureContext() {
    if (!this.context) {
      const AudioContextCtor = window.AudioContext || (window as typeof window & {
        webkitAudioContext?: typeof AudioContext
      }).webkitAudioContext

      if (!AudioContextCtor) {
        throw new Error('Web Audio API no disponible')
      }

      this.context = new AudioContextCtor()
      this.masterGain = this.context.createGain()
      this.masterGain.gain.value = 1
      this.masterGain.connect(this.context.destination)
    }

    return {
      context: this.context,
      masterGain: this.masterGain!
    }
  }

  async resume() {
    const { context } = this.ensureContext()

    if (context.state !== 'running') {
      await context.resume()
    }
  }

  async preload(srcList: string[], onProgress?: (loaded: number, total: number) => void) {
    const uniqueSources = Array.from(new Set(srcList))
    let loaded = 0
    const total = uniqueSources.length

    if (total === 0) {
      onProgress?.(0, 0)
      return
    }

    await Promise.all(
      uniqueSources.map(async (src) => {
        await this.loadBuffer(src)
        loaded += 1
        onProgress?.(loaded, total)
      })
    )
  }

  async loadBuffer(src: string) {
    if (this.buffers.has(src)) {
      return
    }

    const existingPromise = this.preloadPromises.get(src)
    if (existingPromise) {
      return existingPromise
    }

    const promise = (async () => {
      const { context } = this.ensureContext()
      const response = await fetch(src)

      if (!response.ok) {
        throw new Error(`No se pudo cargar audio: ${src}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const decoded = await context.decodeAudioData(arrayBuffer.slice(0))
      this.buffers.set(src, decoded)
    })()

    this.preloadPromises.set(src, promise)

    try {
      await promise
    } finally {
      this.preloadPromises.delete(src)
    }
  }

  play(src: string, options?: { volume?: number }) {
    const buffer = this.buffers.get(src)

    if (!buffer) {
      return
    }

    const { context, masterGain } = this.ensureContext()
    const source = context.createBufferSource()
    const gain = context.createGain()

    source.buffer = buffer
    gain.gain.value = options?.volume ?? 1

    source.connect(gain)
    gain.connect(masterGain)
    source.start()
  }

  playLoop(key: string, src: string, options?: { volume?: number }) {
    const buffer = this.buffers.get(src)

    if (!buffer) {
      return
    }

    this.stopLoop(key)

    const { context, masterGain } = this.ensureContext()
    const source = context.createBufferSource()
    const gain = context.createGain()

    source.buffer = buffer
    source.loop = true
    gain.gain.value = options?.volume ?? 1

    source.connect(gain)
    gain.connect(masterGain)
    source.start()

    this.loopHandles.set(key, { source, gain })
  }

  stopLoop(key: string) {
    const handle = this.loopHandles.get(key)

    if (!handle) {
      return
    }

    handle.source.stop()
    handle.source.disconnect()
    handle.gain.disconnect()
    this.loopHandles.delete(key)
  }
}

export const audioService = new AudioService()
