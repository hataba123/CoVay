import { defineStore } from 'pinia'
import {
  confirmScore,
  createGameState,
  passTurn,
  redoMove,
  resignGame,
  tryPlayMove,
  undoMove,
} from '@/domain/engine/goGameEngine'
import type { BoardPosition, GameSettings, GameState, MoveResult } from '@/domain/models/game'

interface GameStoreState {
  game: GameState | null
  message: string | null
}

export const useGameStore = defineStore('game', {
  state: (): GameStoreState => ({ game: null, message: null }),
  actions: {
    startGame(settings: GameSettings) {
      this.game = createGameState(settings)
      this.message = null
    },
    play(position: BoardPosition) {
      this.applyResult(this.game ? tryPlayMove(this.game, position) : null)
    },
    pass() {
      this.applyResult(this.game ? passTurn(this.game) : null)
    },
    resign() {
      this.applyResult(this.game ? resignGame(this.game) : null)
    },
    undo() {
      this.applyResult(this.game ? undoMove(this.game) : null)
    },
    redo() {
      this.applyResult(this.game ? redoMove(this.game) : null)
    },
    confirmScore() {
      this.applyResult(this.game ? confirmScore(this.game) : null)
    },
    clearMessage() {
      this.message = null
    },
    applyResult(result: MoveResult | null) {
      if (!result) {
        this.message = 'Chưa có ván cờ đang hoạt động.'
        return
      }
      this.game = result.state
      this.message = result.error
    },
  },
})
