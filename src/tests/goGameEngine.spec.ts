import { describe, expect, it } from 'vitest'
import {
  calculateAreaScore,
  confirmScore,
  createGameState,
  getConnectedGroup,
  passTurn,
  redoMove,
  tryPlayMove,
  undoMove,
} from '@/domain/engine/goGameEngine'
import type { BoardPosition, GameState } from '@/domain/models/game'

function play(state: GameState, position: BoardPosition): GameState {
  const result = tryPlayMove(state, position)
  expect(result.error).toBeNull()
  return result.state
}

describe('goGameEngine', () => {
  it('places a stone at an empty intersection', () => {
    const result = tryPlayMove(createGameState(), { row: 4, column: 4 })
    expect(result.error).toBeNull()
    expect(result.state.board[4][4]).toBe('black')
    expect(result.state.currentPlayer).toBe('white')
  })

  it('rejects an occupied intersection', () => {
    const state = play(createGameState(), { row: 4, column: 4 })
    expect(tryPlayMove(state, { row: 4, column: 4 }).error).toBe('Giao điểm này đã có quân.')
  })

  it('captures a single stone', () => {
    let state = createGameState()
    state = play(state, { row: 0, column: 1 })
    state = play(state, { row: 1, column: 1 })
    state = play(state, { row: 1, column: 0 })
    state = play(state, { row: 8, column: 8 })
    state = play(state, { row: 1, column: 2 })
    state = play(state, { row: 8, column: 7 })
    state = play(state, { row: 2, column: 1 })
    expect(state.board[1][1]).toBeNull()
    expect(state.captures.black).toBe(1)
  })

  it('captures every stone in a connected group', () => {
    const state = createGameState()
    state.board[2][3] = 'black'
    state.board[2][4] = 'black'
    state.board[3][2] = 'black'
    state.board[4][3] = 'black'
    state.board[4][4] = 'black'
    state.board[3][3] = 'white'
    state.board[3][4] = 'white'
    const result = tryPlayMove(state, { row: 3, column: 5 })
    expect(result.error).toBeNull()
    state.board = result.state.board
    expect(getConnectedGroup(state.board, { row: 3, column: 3 })).toEqual([])
    expect(result.state.captures.black).toBe(2)
  })

  it('rejects suicide but permits a capture that creates liberties', () => {
    let suicide = createGameState()
    suicide = play(suicide, { row: 0, column: 1 })
    suicide = play(suicide, { row: 8, column: 8 })
    suicide = play(suicide, { row: 1, column: 0 })
    suicide = play(suicide, { row: 8, column: 7 })
    suicide = play(suicide, { row: 1, column: 2 })
    suicide = play(suicide, { row: 8, column: 6 })
    suicide = play(suicide, { row: 2, column: 1 })
    expect(tryPlayMove(suicide, { row: 1, column: 1 }).error).toBe('Không được đi tự sát.')

    const capture = createGameState()
    capture.currentPlayer = 'white'
    capture.board[1][1] = 'black'
    capture.board[0][1] = 'black'
    capture.board[1][0] = 'black'
    capture.board[1][2] = 'black'
    expect(tryPlayMove(capture, { row: 2, column: 1 }).error).toBeNull()
  })

  it('applies simple Ko', () => {
    const state = createGameState()
    state.board[0][1] = 'black'
    state.board[1][0] = 'black'
    state.board[2][1] = 'black'
    state.board[1][1] = 'white'
    state.board[0][2] = 'white'
    state.board[1][3] = 'white'
    state.board[2][2] = 'white'
    const capture = tryPlayMove(state, { row: 1, column: 2 })
    expect(capture.error).toBeNull()
    expect(tryPlayMove(capture.state, { row: 1, column: 1 }).error).toBe('Nước đi vi phạm luật Ko.')
  })

  it('moves to scoring after two consecutive passes and confirms the score', () => {
    let state = passTurn(createGameState()).state
    state = passTurn(state).state
    expect(state.status).toBe('scoring')
    expect(confirmScore(state).state.status).toBe('finished')
  })

  it('undoes and redoes a move', () => {
    const initial = createGameState()
    const moved = play(initial, { row: 4, column: 4 })
    const undone = undoMove(moved).state
    expect(undone.board[4][4]).toBeNull()
    expect(redoMove(undone).state.board[4][4]).toBe('black')
  })

  it('calculates basic area scoring including komi', () => {
    const state = createGameState({ boardSize: 9 })
    const board = state.board.map((row) => [...row])
    board[0][0] = 'black'
    const score = calculateAreaScore(board, 6.5)
    expect(score.blackStones).toBe(1)
    expect(score.komi).toBe(6.5)
    expect(score.black).toBe(81)
    expect(score.white).toBe(6.5)
  })
})
