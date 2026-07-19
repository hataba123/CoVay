import type { GoBot } from '@/bots/GoBot'
import { evaluateMove } from '@/bots/botEvaluation'
import { getLegalMoves } from '@/domain/engine/goGameEngine'
import type { BoardPosition, GameState } from '@/domain/models/game'

export class MediumGoBot implements GoBot {
  async findBestMove(gameState: GameState): Promise<BoardPosition | null> {
    const evaluations = getLegalMoves(gameState).map((position) => ({
      position,
      score: evaluateMove(gameState, position),
    }))
    if (evaluations.length === 0) return null
    const bestScore = Math.max(...evaluations.map((evaluation) => evaluation.score))
    const candidates = evaluations.filter((evaluation) => evaluation.score >= bestScore - 12)
    return candidates[Math.floor(Math.random() * candidates.length)].position
  }
}
