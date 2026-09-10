import type { GameState } from '@/domain/models/game'

const databaseName = 'co-vay'
const storeName = 'games'
const databaseVersion = 1
const LOCAL_STORAGE_KEY = 'co-vay-saved-games-backup'

export interface StoredGame {
  id: string
  createdAt: string
  updatedAt: string
  state: GameState
}

function cloneDomainState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState
}

// LocalStorage Fallback Helpers
function getLocalStorageGames(): StoredGame[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredGame[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocalStorageGame(game: StoredGame): void {
  try {
    if (typeof localStorage === 'undefined') return
    const games = getLocalStorageGames().filter((g) => g.id !== game.id)
    games.unshift(game)
    // Keep max 30 saved games in local storage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(games.slice(0, 30)))
  } catch {
    // Ignore storage quota errors
  }
}

function deleteLocalStorageGame(id: string): void {
  try {
    if (typeof localStorage === 'undefined') return
    const games = getLocalStorageGames().filter((g) => g.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(games))
  } catch {
    // Ignore errors
  }
}

// Reusable IndexedDB Connection
let dbInstance: IDBDatabase | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance)
  }

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB không được hỗ trợ trên thiết bị này.'))
      return
    }

    try {
      const request = indexedDB.open(databaseName, databaseVersion)

      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: 'id' })
        }
      }

      request.onsuccess = () => {
        dbInstance = request.result
        dbInstance.onversionchange = () => {
          dbInstance?.close()
          dbInstance = null
        }
        dbInstance.onclose = () => {
          dbInstance = null
        }
        resolve(dbInstance)
      }

      request.onerror = () => {
        reject(request.error ?? new Error('Không thể mở IndexedDB.'))
      }
    } catch (err) {
      reject(err)
    }
  })
}

async function completeRequest<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase()
  return new Promise<T>((resolve, reject) => {
    try {
      const transaction = database.transaction(storeName, mode)
      const store = transaction.objectStore(storeName)
      const request = action(store)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        reject(request.error ?? new Error('Không thể thao tác với IndexedDB.'))
      }
      transaction.onerror = () => {
        reject(transaction.error ?? new Error('Lỗi giao dịch IndexedDB.'))
      }
    } catch (err) {
      reject(err)
    }
  })
}

export async function saveGame(game: StoredGame): Promise<void> {
  const clonedGame = {
    ...game,
    state: cloneDomainState(game.state),
    updatedAt: game.updatedAt || new Date().toISOString(),
  }

  // Always backup to localStorage
  saveLocalStorageGame(clonedGame)

  try {
    await completeRequest<IDBValidKey>('readwrite', (store) => store.put(clonedGame))
  } catch {
    // If IndexedDB fails, localStorage backup succeeded
  }
}

export async function getSavedGames(): Promise<StoredGame[]> {
  try {
    const games = await completeRequest<StoredGame[]>('readonly', (store) => store.getAll())
    if (Array.isArray(games) && games.length > 0) {
      return games
        .map((game) => ({ ...game, state: cloneDomainState(game.state) }))
        .sort((left, right) => (right.updatedAt || '').localeCompare(left.updatedAt || ''))
    }
  } catch {
    // Fall back to localStorage
  }

  // Fallback
  return getLocalStorageGames().sort((left, right) =>
    (right.updatedAt || '').localeCompare(left.updatedAt || ''),
  )
}

export async function getSavedGame(id: string): Promise<StoredGame | null> {
  try {
    const game = await completeRequest<StoredGame | undefined>('readonly', (store) => store.get(id))
    if (game) {
      return { ...game, state: cloneDomainState(game.state) }
    }
  } catch {
    // Fall back to localStorage
  }

  const localGame = getLocalStorageGames().find((g) => g.id === id)
  return localGame ? { ...localGame, state: cloneDomainState(localGame.state) } : null
}

export async function deleteSavedGame(id: string): Promise<void> {
  deleteLocalStorageGame(id)
  try {
    await completeRequest<undefined>('readwrite', (store) => store.delete(id))
  } catch {
    // Ignored if indexedDB is unavailable
  }
}
