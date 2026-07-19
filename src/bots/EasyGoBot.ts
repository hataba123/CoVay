import type { GoBot } from '@/bots/GoBot'
import { getLegalMoves } from '@/domain/engine/goGameEngine'
import type { BoardPosition, GameState } from '@/domain/models/game'

export class EasyGoBot implements GoBot {
  async findBestMove(gameState: GameState): Promise<BoardPosition | null> {
    const moves = getLegalMoves(gameState)
    return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null
  }
}
