import { defineStore } from 'pinia'
import { createGoBot } from '@/bots/botFactory'
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
  isBotThinking: boolean
}

export const useGameStore = defineStore('game', {
  state: (): GameStoreState => ({ game: null, message: null, isBotThinking: false }),
  actions: {
    startGame(settings: GameSettings) {
      this.game = createGameState(settings)
      this.message = null
      this.isBotThinking = false
    },
    play(position: BoardPosition) {
      const activePlayer =
        this.game?.settings[this.game.currentPlayer === 'black' ? 'blackPlayer' : 'whitePlayer']
      if (activePlayer?.type === 'bot') {
        this.message = 'Đang đến lượt của bot.'
        return
      }
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
    async makeBotMove() {
      const game = this.game
      const player = game?.settings[game.currentPlayer === 'black' ? 'blackPlayer' : 'whitePlayer']
      if (!game || game.status !== 'playing' || player?.type !== 'bot' || this.isBotThinking) return

      this.isBotThinking = true
      this.message = 'Bot đang suy nghĩ…'
      try {
        await new Promise<void>((resolve) => window.setTimeout(resolve, 120))
        const position = await createGoBot(game.settings.botDifficulty).findBestMove(game)
        if (this.game !== game) return
        this.applyResult(position ? tryPlayMove(game, position) : passTurn(game))
      } catch {
        this.message = 'Bot không thể thực hiện nước đi. Bạn có thể tiếp tục ván cờ.'
      } finally {
        this.isBotThinking = false
        if (this.message === 'Bot đang suy nghĩ…') this.message = null
      }
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
