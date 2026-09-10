import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'

const STORAGE_KEY_THEME = 'co-vay-theme'
const STORAGE_KEY_SOUND = 'co-vay-sound'
const STORAGE_KEY_HAPTICS = 'co-vay-haptics'
const STORAGE_KEY_COORDINATES = 'co-vay-coordinates'
const STORAGE_KEY_VOLUME = 'co-vay-volume'

export interface SettingsState {
  theme: Theme
  soundEnabled: boolean
  hapticsEnabled: boolean
  showCoordinates: boolean
  volume: number
}

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(key, value)
  } catch {
    // Ignore storage quota or access errors
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    theme: 'light',
    soundEnabled: true,
    hapticsEnabled: true,
    showCoordinates: true,
    volume: 0.85,
  }),
  actions: {
    initialize() {
      if (typeof window === 'undefined') return

      // 1. Theme
      const storedTheme = safeGetItem(STORAGE_KEY_THEME)
      if (storedTheme === 'dark' || storedTheme === 'light') {
        this.setTheme(storedTheme)
      } else if (
        globalThis.matchMedia &&
        globalThis.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        this.setTheme('dark')
      } else {
        this.setTheme('light')
      }

      // 2. Sound
      const storedSound = safeGetItem(STORAGE_KEY_SOUND)
      if (storedSound !== null) {
        this.soundEnabled = storedSound === 'true'
      }

      // 3. Haptics
      const storedHaptics = safeGetItem(STORAGE_KEY_HAPTICS)
      if (storedHaptics !== null) {
        this.hapticsEnabled = storedHaptics === 'true'
      }

      // 4. Coordinates
      const storedCoords = safeGetItem(STORAGE_KEY_COORDINATES)
      if (storedCoords !== null) {
        this.showCoordinates = storedCoords !== 'false'
      }

      // 5. Volume
      const storedVol = safeGetItem(STORAGE_KEY_VOLUME)
      if (storedVol !== null) {
        const parsed = parseFloat(storedVol)
        if (!isNaN(parsed)) {
          this.volume = Math.max(0, Math.min(1, parsed))
        }
      }
    },

    setTheme(theme: Theme) {
      this.theme = theme
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = theme
        document.documentElement.setAttribute('data-theme', theme)
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
          document.documentElement.style.colorScheme = 'dark'
        } else {
          document.documentElement.classList.remove('dark')
          document.documentElement.style.colorScheme = 'light'
        }
      }
      safeSetItem(STORAGE_KEY_THEME, theme)
    },

    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark')
    },

    setSoundEnabled(enabled: boolean) {
      this.soundEnabled = enabled
      safeSetItem(STORAGE_KEY_SOUND, String(enabled))
    },

    setHapticsEnabled(enabled: boolean) {
      this.hapticsEnabled = enabled
      safeSetItem(STORAGE_KEY_HAPTICS, String(enabled))
    },

    setShowCoordinates(show: boolean) {
      this.showCoordinates = show
      safeSetItem(STORAGE_KEY_COORDINATES, String(show))
    },

    setVolume(volume: number) {
      this.volume = Math.max(0, Math.min(1, volume))
      safeSetItem(STORAGE_KEY_VOLUME, String(this.volume))
    },
  },
})
