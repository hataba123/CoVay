import type { BoardPosition, GameState } from '@/domain/models/game'

export interface GoBot {
  findBestMove(gameState: GameState): Promise<BoardPosition | null>
}
