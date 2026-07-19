export const boardSizes = [9, 13, 19] as const

export type BoardSize = (typeof boardSizes)[number]
export type StoneColor = 'black' | 'white'
export type BoardIntersection = StoneColor | null
export type Board = BoardIntersection[][]
export type GameMode = 'local' | 'bot'
export type PlayerType = 'human' | 'bot'
export type GameStatus = 'playing' | 'scoring' | 'finished'

export interface BoardPosition {
  row: number
  column: number
}

export interface Player {
  name: string
  color: StoneColor
  type: PlayerType
}

export interface GameSettings {
  boardSize: BoardSize
  komi: number
  mode: GameMode
  blackPlayer: Player
  whitePlayer: Player
}

export interface GoMove {
  number: number
  color: StoneColor
  type: 'play' | 'pass' | 'resign'
  position: BoardPosition | null
  capturedStones: number
}

export interface GameScore {
  black: number
  white: number
  blackTerritory: number
  whiteTerritory: number
  blackStones: number
  whiteStones: number
  komi: number
}

export interface GameResult {
  winner: StoneColor | 'draw'
  reason: 'score' | 'resign'
  score?: GameScore
}

export interface GameStateSnapshot {
  board: Board
  currentPlayer: StoneColor
  captures: Record<StoneColor, number>
  consecutivePasses: number
  moveHistory: GoMove[]
  previousBoardHash: string | null
  status: GameStatus
  result: GameResult | null
}

export interface GameState extends GameStateSnapshot {
  settings: GameSettings
  pastStates: GameStateSnapshot[]
  futureStates: GameStateSnapshot[]
}

export interface MoveResult {
  state: GameState
  error: string | null
}
