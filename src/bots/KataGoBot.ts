import type { GoBot } from '@/bots/GoBot'
import type { BoardPosition, GameState } from '@/domain/models/game'

const katagoColumns = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'
const katagoApiUrl = import.meta.env.VITE_KATAGO_API_URL?.trim() || '/api/katago/analyze'

interface KataGoMoveInfo {
  move?: unknown
  order?: unknown
  pv?: unknown
  scoreLead?: unknown
  visits?: unknown
  winrate?: unknown
}

interface KataGoRootInfo {
  scoreLead?: unknown
  visits?: unknown
  winrate?: unknown
}

interface KataGoAnalysisResponse {
  moveInfos?: KataGoMoveInfo[]
  error?: unknown
  ownership?: unknown
  rootInfo?: KataGoRootInfo
}

export interface KataGoVariation {
  move: BoardPosition | null
  moveLabel: string
  principalVariation: string[]
  scoreLead: number | null
  visits: number | null
  winrate: number | null
}

export interface KataGoAnalysis {
  ownership: number[]
  rootScoreLead: number | null
  rootVisits: number | null
  rootWinrate: number | null
  variations: KataGoVariation[]
}

function toKataGoCoordinate(position: BoardPosition, boardSize: number): string {
  return `${katagoColumns[position.column]}${boardSize - position.row}`
}

function fromKataGoCoordinate(move: string, boardSize: number): BoardPosition | null {
  if (move.toLowerCase() === 'pass') return null

  const coordinate = /^([A-HJ-Z])(\d+)$/i.exec(move.trim())
  if (!coordinate) throw new Error('KataGo trả về tọa độ nước đi không hợp lệ.')

  const column = katagoColumns.indexOf(coordinate[1].toUpperCase())
  const row = boardSize - Number(coordinate[2])
  if (column < 0 || column >= boardSize || row < 0 || row >= boardSize) {
    throw new Error('KataGo trả về nước đi nằm ngoài bàn cờ.')
  }

  return { row, column }
}

function createQueryId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `katago-${Date.now()}-${Math.random()}`
}

function toNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function parseOwnership(value: unknown, boardSize: number): number[] {
  if (!Array.isArray(value) || value.length !== boardSize * boardSize) return []
  return value.map((point) => {
    const ownership = toNumberOrNull(point)
    return ownership === null ? 0 : Math.max(-1, Math.min(1, ownership))
  })
}

function parseVariation(moveInfo: KataGoMoveInfo, boardSize: number): KataGoVariation | null {
  if (typeof moveInfo.move !== 'string') return null

  const move = fromKataGoCoordinate(moveInfo.move, boardSize)
  return {
    move,
    moveLabel: move === null ? 'Pass' : moveInfo.move.toUpperCase(),
    principalVariation: Array.isArray(moveInfo.pv)
      ? moveInfo.pv.filter((position): position is string => typeof position === 'string')
      : [],
    scoreLead: toNumberOrNull(moveInfo.scoreLead),
    visits: toNumberOrNull(moveInfo.visits),
    winrate: toNumberOrNull(moveInfo.winrate),
  }
}

export class KataGoBot implements GoBot {
  async analyze(gameState: GameState): Promise<KataGoAnalysis> {
    const response = await fetch(katagoApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createQueryId(),
        moves: gameState.moveHistory.map((move) => [
          move.color === 'black' ? 'B' : 'W',
          move.position ? toKataGoCoordinate(move.position, gameState.settings.boardSize) : 'pass',
        ]),
        rules: 'tromp-taylor',
        komi: gameState.settings.komi,
        boardXSize: gameState.settings.boardSize,
        boardYSize: gameState.settings.boardSize,
        analyzeTurns: [gameState.moveHistory.length],
        maxVisits: 300,
        analysisPVLen: 12,
        includeOwnership: true,
      }),
    })

    const payload = (await response.json().catch(() => null)) as KataGoAnalysisResponse | null
    if (!response.ok || !payload) {
      throw new Error('Không thể kết nối dịch vụ KataGo. Hãy kiểm tra cấu hình KataGo.')
    }
    if (typeof payload.error === 'string') throw new Error(`KataGo: ${payload.error}`)

    const variations = (payload.moveInfos ?? [])
      .map((moveInfo) => ({
        variation: parseVariation(moveInfo, gameState.settings.boardSize),
        order: toNumberOrNull(moveInfo.order) ?? Number.MAX_SAFE_INTEGER,
      }))
      .filter(
        (candidate): candidate is { variation: KataGoVariation; order: number } =>
          candidate.variation !== null,
      )
      .sort((left, right) => left.order - right.order)
      .slice(0, 5)
      .map((candidate) => candidate.variation)

    return {
      ownership: parseOwnership(payload.ownership, gameState.settings.boardSize),
      rootScoreLead: toNumberOrNull(payload.rootInfo?.scoreLead),
      rootVisits: toNumberOrNull(payload.rootInfo?.visits),
      rootWinrate: toNumberOrNull(payload.rootInfo?.winrate),
      variations,
    }
  }

  async findBestMoveWithAnalysis(
    gameState: GameState,
  ): Promise<{ analysis: KataGoAnalysis; position: BoardPosition | null }> {
    const analysis = await this.analyze(gameState)
    return { analysis, position: analysis.variations[0]?.move ?? null }
  }

  async findBestMove(gameState: GameState): Promise<BoardPosition | null> {
    return (await this.findBestMoveWithAnalysis(gameState)).position
  }
}
