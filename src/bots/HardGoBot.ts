import type { GoBot } from '@/bots/GoBot'
import { evaluateMove } from '@/bots/botEvaluation'
import { getLegalMoves } from '@/domain/engine/goGameEngine'
import type { BoardPosition, GameState } from '@/domain/models/game'

export class HardGoBot implements GoBot {
  async findBestMove(gameState: GameState): Promise<BoardPosition | null> {
    const deadline = performance.now() + 220
    let bestMove: BoardPosition | null = null
    let bestScore = Number.NEGATIVE_INFINITY
    for (const position of getLegalMoves(gameState)) {
      if (performance.now() >= deadline) break
      const score = evaluateMove(gameState, position, true)
      if (score > bestScore) {
        bestMove = position
        bestScore = score
      }
    }
    return bestMove
  }
}
