import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'

const storageKey = 'co-vay-theme'

export const useSettingsStore = defineStore('settings', {
  state: () => ({ theme: 'light' as Theme }),
  actions: {
    initialize() {
      const storedTheme = globalThis.localStorage.getItem(storageKey)
      this.setTheme(storedTheme === 'dark' ? 'dark' : 'light')
    },
    setTheme(theme: Theme) {
      this.theme = theme
      globalThis.document.documentElement.dataset.theme = theme
      globalThis.localStorage.setItem(storageKey, theme)
    },
  },
})
