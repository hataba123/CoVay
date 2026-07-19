import type { GoBot } from '@/bots/GoBot'
import { evaluateMove } from '@/bots/botEvaluation'
import { getLegalMoves, tryPlayMove } from '@/domain/engine/goGameEngine'
import type { BoardPosition, GameState } from '@/domain/models/game'

interface EvaluatedMove {
  position: BoardPosition
  score: number
}

export class HardGoBot implements GoBot {
  async findBestMove(gameState: GameState): Promise<BoardPosition | null> {
    const deadline = performance.now() + 220
    const candidates: EvaluatedMove[] = []
    for (const position of getLegalMoves(gameState)) {
      if (performance.now() >= deadline && candidates.length > 0) break
      candidates.push({ position, score: evaluateMove(gameState, position, true) })
    }
    if (candidates.length === 0) return null

    candidates.sort((left, right) => right.score - left.score)
    let bestMove = candidates[0]
    let bestScore = bestMove.score
    for (const candidate of candidates.slice(0, 12)) {
      if (performance.now() >= deadline) break
      const played = tryPlayMove(gameState, candidate.position)
      if (played.error) continue

      let strongestReply = 0
      for (const reply of getLegalMoves(played.state)) {
        if (performance.now() >= deadline) break
        strongestReply = Math.max(strongestReply, evaluateMove(played.state, reply, true))
      }
      const score = candidate.score - strongestReply * 0.6
      if (score > bestScore) {
        bestMove = candidate
        bestScore = score
      }
    }
    return bestMove.position
  }
}
