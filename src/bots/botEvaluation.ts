import {
  getAdjacentPositions,
  getConnectedGroup,
  getGroupLiberties,
  tryPlayMove,
} from '@/domain/engine/goGameEngine'
import type { BoardPosition, GameState } from '@/domain/models/game'

export function evaluateMove(state: GameState, position: BoardPosition, advanced = false): number {
  const result = tryPlayMove(state, position)
  if (result.error) return Number.NEGATIVE_INFINITY
  const move = result.state.moveHistory.at(-1)
  const group = getConnectedGroup(result.state.board, position)
  const liberties = getGroupLiberties(result.state.board, group).length
  const boardCenter = (state.board.length - 1) / 2
  const centerDistance =
    Math.abs(position.row - boardCenter) + Math.abs(position.column - boardCenter)
  const nearbyStones = getAdjacentPositions(state.board, position).filter(
    (adjacent) => state.board[adjacent.row][adjacent.column] !== null,
  ).length
  let score = (move?.capturedStones ?? 0) * 1_000 + liberties * 10 + nearbyStones * 3

  const inspectedGroups = new Set<string>()
  for (let row = 0; row < state.board.length; row += 1) {
    for (let column = 0; column < state.board.length; column += 1) {
      if (state.board[row][column] !== state.currentPlayer) continue
      const ownGroup = getConnectedGroup(state.board, { row, column })
      const groupKey = ownGroup
        .map((stone) => `${stone.row}:${stone.column}`)
        .sort()
        .join('|')
      if (inspectedGroups.has(groupKey)) continue
      inspectedGroups.add(groupKey)
      const atariLiberties = getGroupLiberties(state.board, ownGroup)
      if (
        atariLiberties.length === 1 &&
        atariLiberties[0].row === position.row &&
        atariLiberties[0].column === position.column
      )
        score += 500
    }
  }
  if (advanced) score += liberties * 12 - centerDistance * 1.5 + group.length * 2
  return score
}
