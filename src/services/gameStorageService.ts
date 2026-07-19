import type { GameState } from '@/domain/models/game'

const databaseName = 'co-vay'
const storeName = 'games'
const databaseVersion = 1

export interface StoredGame {
  id: string
  createdAt: string
  updatedAt: string
  state: GameState
}

function cloneDomainState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(storeName))
        database.createObjectStore(storeName, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Không thể mở IndexedDB.'))
  })
}

async function completeRequest<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase()
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, mode)
    const request = action(transaction.objectStore(storeName))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Không thể thao tác với IndexedDB.'))
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => database.close()
  })
}

export async function saveGame(game: StoredGame): Promise<void> {
  await completeRequest<IDBValidKey>('readwrite', (store) =>
    store.put({ ...game, state: cloneDomainState(game.state) }),
  )
}

export async function getSavedGames(): Promise<StoredGame[]> {
  const games = await completeRequest<StoredGame[]>('readonly', (store) => store.getAll())
  return games
    .map((game) => ({ ...game, state: cloneDomainState(game.state) }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export async function getSavedGame(id: string): Promise<StoredGame | null> {
  const game = await completeRequest<StoredGame | undefined>('readonly', (store) => store.get(id))
  return game ? { ...game, state: cloneDomainState(game.state) } : null
}

export async function deleteSavedGame(id: string): Promise<void> {
  await completeRequest<undefined>('readwrite', (store) => store.delete(id))
}
