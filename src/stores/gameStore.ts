import { defineStore } from 'pinia'
import { createGoBot } from '@/bots/botFactory'
import { KataGoBot, type KataGoAnalysis } from '@/bots/KataGoBot'
import { saveGame, type StoredGame } from '@/services/gameStorageService'
import {
  confirmScore,
  createGameState,
  passTurn,
  redoMove,
  resignGame,
  toggleDeadGroup,
  tryPlayMove,
  undoMove,
} from '@/domain/engine/goGameEngine'
import type { BoardPosition, GameSettings, GameState, MoveResult } from '@/domain/models/game'

interface GameStoreState {
  game: GameState | null
  message: string | null
  isBotThinking: boolean
  isKataGoAnalyzing: boolean
  kataGoAnalysis: KataGoAnalysis | null
  activeGameId: string | null
  createdAt: string | null
}

export const useGameStore = defineStore('game', {
  state: (): GameStoreState => ({
    game: null,
    message: null,
    isBotThinking: false,
    isKataGoAnalyzing: false,
    kataGoAnalysis: null,
    activeGameId: null,
    createdAt: null,
  }),
  actions: {
    startGame(settings: GameSettings) {
      this.game = createGameState(settings)
      this.message = null
      this.isBotThinking = false
      this.isKataGoAnalyzing = false
      this.kataGoAnalysis = null
      this.activeGameId = crypto.randomUUID()
      this.createdAt = new Date().toISOString()
      void this.persistCurrentGame()
    },
    restoreGame(game: StoredGame) {
      this.game = game.state
      this.activeGameId = game.id
      this.createdAt = game.createdAt
      this.message = null
      this.kataGoAnalysis = null
    },
    loadImportedGame(game: GameState) {
      this.game = game
      this.activeGameId = crypto.randomUUID()
      this.createdAt = new Date().toISOString()
      this.message = null
      this.kataGoAnalysis = null
      void this.persistCurrentGame()
    },
    setMessage(message: string | null) {
      this.message = message
    },
    play(position: BoardPosition) {
      if (!this.canHumanAct()) {
        this.message = 'Đang đến lượt của bot.'
        return
      }
      this.applyResult(this.game ? tryPlayMove(this.game, position) : null)
    },
    pass() {
      if (!this.canHumanAct()) {
        this.message = 'Đang đến lượt của bot.'
        return
      }
      this.applyResult(this.game ? passTurn(this.game) : null)
    },
    resign() {
      if (!this.canHumanAct()) {
        this.message = 'Đang đến lượt của bot.'
        return
      }
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
    toggleDeadGroup(position: BoardPosition) {
      this.applyResult(this.game ? toggleDeadGroup(this.game, position) : null)
    },
    clearMessage() {
      this.message = null
    },
    async analyzeWithKataGo() {
      const game = this.game
      if (!game || game.status !== 'playing' || this.isKataGoAnalyzing) return

      this.isKataGoAnalyzing = true
      this.message = 'KataGo đang phân tích…'
      try {
        const analysis = await new KataGoBot().analyze(game)
        if (this.game !== game) return
        this.kataGoAnalysis = analysis
      } catch (error) {
        this.message =
          error instanceof Error ? error.message : 'KataGo không thể phân tích vị trí này.'
      } finally {
        this.isKataGoAnalyzing = false
        if (this.message === 'KataGo đang phân tích…') this.message = null
      }
    },
    canHumanAct(): boolean {
      if (!this.game || this.game.status !== 'playing' || this.isBotThinking) return false
      const activePlayer =
        this.game.settings[this.game.currentPlayer === 'black' ? 'blackPlayer' : 'whitePlayer']
      return activePlayer.type === 'human'
    },
    async makeBotMove() {
      const game = this.game
      const player = game?.settings[game.currentPlayer === 'black' ? 'blackPlayer' : 'whitePlayer']
      if (!game || game.status !== 'playing' || player?.type !== 'bot' || this.isBotThinking) return

      this.isBotThinking = true
      this.message = 'Bot đang suy nghĩ…'
      try {
        await new Promise<void>((resolve) => window.setTimeout(resolve, 120))
        const bot = createGoBot(game.settings.botDifficulty)
        const position = await bot.findBestMove(game)
        if (this.game !== game) return
        this.applyResult(position ? tryPlayMove(game, position) : passTurn(game))
      } catch (error) {
        this.message =
          error instanceof Error
            ? error.message
            : 'Bot không thể thực hiện nước đi. Bạn có thể tiếp tục ván cờ.'
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
      if (!result.error) this.kataGoAnalysis = null
      this.message = result.error
      if (!result.error) void this.persistCurrentGame()
    },
    async persistCurrentGame() {
      if (!this.game || !this.activeGameId || !this.createdAt) return
      try {
        await saveGame({
          id: this.activeGameId,
          createdAt: this.createdAt,
          updatedAt: new Date().toISOString(),
          state: this.game,
        })
      } catch {
        this.message = 'Không thể tự động lưu ván cờ trên thiết bị này.'
      }
    },
  },
})
