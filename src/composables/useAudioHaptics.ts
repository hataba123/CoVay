import { useSettingsStore } from '@/stores/settingsStore'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

export function useAudioHaptics() {
  const settings = useSettingsStore()

  /**
   * Sound of a Go stone placed on a Kaya wood board.
   * Synthesizes the crisp stone snap combined with the deep wood resonance.
   */
  function playStoneSound(volumeMultiplier = 1) {
    if (!settings.soundEnabled) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(
      Math.min(1, Math.max(0, settings.volume * volumeMultiplier * 0.85)),
      now,
    )
    masterGain.connect(ctx.destination)

    // Slight pitch randomization for natural realism
    const pitchJitter = 0.94 + Math.random() * 0.12

    // 1. High transient "clack" (slate/clamshell impact)
    const oscClick = ctx.createOscillator()
    const gainClick = ctx.createGain()
    oscClick.type = 'triangle'
    oscClick.frequency.setValueAtTime(2600 * pitchJitter, now)
    oscClick.frequency.exponentialRampToValueAtTime(800 * pitchJitter, now + 0.025)

    gainClick.gain.setValueAtTime(0.8, now)
    gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.028)

    oscClick.connect(gainClick)
    gainClick.connect(masterGain)

    // 2. Wood body "thock" (wooden Goban resonance)
    const oscWood = ctx.createOscillator()
    const gainWood = ctx.createGain()
    oscWood.type = 'sine'
    oscWood.frequency.setValueAtTime(380 * pitchJitter, now)
    oscWood.frequency.exponentialRampToValueAtTime(140 * pitchJitter, now + 0.12)

    gainWood.gain.setValueAtTime(0.7, now)
    gainWood.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

    oscWood.connect(gainWood)
    gainWood.connect(masterGain)

    // 3. Subtle low-frequency table resonance
    const oscSub = ctx.createOscillator()
    const gainSub = ctx.createGain()
    oscSub.type = 'sine'
    oscSub.frequency.setValueAtTime(160 * pitchJitter, now)
    oscSub.frequency.exponentialRampToValueAtTime(70 * pitchJitter, now + 0.18)

    gainSub.gain.setValueAtTime(0.35, now)
    gainSub.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    oscSub.connect(gainSub)
    gainSub.connect(masterGain)

    oscClick.start(now)
    oscClick.stop(now + 0.035)

    oscWood.start(now)
    oscWood.stop(now + 0.16)

    oscSub.start(now)
    oscSub.stop(now + 0.2)
  }

  /**
   * Sound of capturing stones off the board.
   */
  function playCaptureSound() {
    if (!settings.soundEnabled) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(settings.volume * 0.7, now)
    masterGain.connect(ctx.destination)

    // Rapid double clack
    ;[0, 0.055].forEach((offset, idx) => {
      const t = now + offset
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(1800 + idx * 300, t)
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.04)

      gain.gain.setValueAtTime(0.6, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)

      osc.connect(gain)
      gain.connect(masterGain)

      osc.start(t)
      osc.stop(t + 0.06)
    })
  }

  /**
   * Subtle tactile tick for UI buttons (like iOS wheel/button feedback).
   */
  function playTapSound() {
    if (!settings.soundEnabled) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.012)

    gain.gain.setValueAtTime(settings.volume * 0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.02)
  }

  /**
   * Victory / completion chime
   */
  function playWinSound() {
    if (!settings.soundEnabled) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const chords = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      const t = now + idx * 0.09
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)

      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(settings.volume * 0.25, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t)
      osc.stop(t + 0.65)
    })
  }

  /**
   * Haptic vibration for mobile devices (simulating Apple Taptic Engine)
   */
  function triggerHaptic(type: 'light' | 'medium' | 'success' | 'error' = 'light') {
    if (!settings.hapticsEnabled) return
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return

    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10)
          break
        case 'medium':
          navigator.vibrate(18)
          break
        case 'success':
          navigator.vibrate([10, 35, 20])
          break
        case 'error':
          navigator.vibrate([30, 40, 30])
          break
      }
    } catch {
      // Ignore devices that block vibration without gesture
    }
  }

  return {
    playStoneSound,
    playCaptureSound,
    playTapSound,
    playWinSound,
    triggerHaptic,
  }
}
