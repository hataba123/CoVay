import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '@/stores/gameStore'

describe('local player mode', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('alternates turns and supports undo and redo', () => {
    const store = useGameStore()
    store.startGame({
      boardSize: 9,
      komi: 6.5,
      mode: 'local',
      blackPlayer: { name: 'A', color: 'black', type: 'human' },
      whitePlayer: { name: 'B', color: 'white', type: 'human' },
    })
    store.play({ row: 4, column: 4 })
    expect(store.game?.currentPlayer).toBe('white')
    store.undo()
    expect(store.game?.board[4][4]).toBeNull()
    store.redo()
    expect(store.game?.board[4][4]).toBe('black')
  })
})
