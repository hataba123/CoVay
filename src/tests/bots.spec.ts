import { describe, expect, it } from 'vitest'
import { EasyGoBot } from '@/bots/EasyGoBot'
import { MediumGoBot } from '@/bots/MediumGoBot'
import { createGameState, getLegalMoves, tryPlayMove } from '@/domain/engine/goGameEngine'

describe('Go bots', () => {
  it('easy bot returns a legal move without mutating game state', async () => {
    const state = createGameState()
    const originalBoard = state.board.map((row) => [...row])
    const move = await new EasyGoBot().findBestMove(state)
    expect(move).not.toBeNull()
    expect(getLegalMoves(state)).toContainEqual(move)
    expect(state.board).toEqual(originalBoard)
  })

  it('medium bot prioritizes capturing an opponent stone', async () => {
    const state = createGameState()
    state.board[3][4] = 'black'
    state.board[4][3] = 'black'
    state.board[5][4] = 'black'
    state.board[4][4] = 'white'
    const move = await new MediumGoBot().findBestMove(state)
    expect(move).toEqual({ row: 4, column: 5 })
    expect(tryPlayMove(state, move!).error).toBeNull()
  })
})
