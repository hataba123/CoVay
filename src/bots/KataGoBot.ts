import type { GoBot } from '@/bots/GoBot'
import type { BoardPosition, GameState } from '@/domain/models/game'

const katagoColumns = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'
const katagoApiUrl = import.meta.env.VITE_KATAGO_API_URL?.trim() || '/api/katago/analyze'

interface KataGoMoveInfo {
  move?: unknown
}

interface KataGoAnalysisResponse {
  moveInfos?: KataGoMoveInfo[]
  error?: unknown
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

export class KataGoBot implements GoBot {
  async findBestMove(gameState: GameState): Promise<BoardPosition | null> {
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
      }),
    })

    const payload = (await response.json().catch(() => null)) as KataGoAnalysisResponse | null
    if (!response.ok || !payload) {
      throw new Error('Không thể kết nối dịch vụ KataGo. Hãy kiểm tra cấu hình KataGo.')
    }
    if (typeof payload.error === 'string') throw new Error(`KataGo: ${payload.error}`)

    const move = payload.moveInfos?.[0]?.move
    if (typeof move !== 'string') throw new Error('KataGo không trả về nước đi phù hợp.')

    return fromKataGoCoordinate(move, gameState.settings.boardSize)
  }
}
