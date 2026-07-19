import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '@/stores/gameStore'

function createBotGame(humanColor: 'black' | 'white') {
  const store = useGameStore()
  store.startGame({
    boardSize: 9,
    komi: 6.5,
    mode: 'bot',
    botDifficulty: 'easy',
    blackPlayer: {
      name: humanColor === 'black' ? 'Người chơi' : 'Bot',
      color: 'black',
      type: humanColor === 'black' ? 'human' : 'bot',
    },
    whitePlayer: {
      name: humanColor === 'white' ? 'Người chơi' : 'Bot',
      color: 'white',
      type: humanColor === 'white' ? 'human' : 'bot',
    },
  })
  return store
}

describe('bot turn flow', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('responds after a human black move', async () => {
    const store = createBotGame('black')
    store.play({ row: 4, column: 4 })
    await store.makeBotMove()
    expect(store.game?.moveHistory).toHaveLength(2)
    expect(store.game?.currentPlayer).toBe('black')
  })

  it('makes the opening move when the human chooses white', async () => {
    const store = createBotGame('white')
    await store.makeBotMove()
    expect(store.game?.moveHistory).toHaveLength(1)
    expect(store.game?.currentPlayer).toBe('white')
    expect(store.canHumanAct()).toBe(true)
  })
})
