import { createGameState, passTurn, tryPlayMove } from '@/domain/engine/goGameEngine'
import type { BoardSize, GameSettings, GameState, StoneColor } from '@/domain/models/game'

const validBoardSizes = new Set<BoardSize>([9, 13, 19])
const sgfLetters = 'abcdefghijklmnopqrstuvwxyz'

function escapeSgf(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/]/g, '\\]')
}
function propertyValue(source: string, property: string): string | null {
  return new RegExp(`${property}\\[([^\\]]*)\\]`).exec(source)?.[1] ?? null
}
function colorName(color: StoneColor): string {
  return color === 'black' ? 'Đen' : 'Trắng'
}

export function exportSgf(state: GameState): string {
  const result =
    state.result?.reason === 'resign'
      ? `${state.result.winner === 'black' ? 'B' : 'W'}+R`
      : state.result?.score
        ? `${state.result.winner === 'draw' ? '0' : state.result.winner === 'black' ? 'B' : 'W'}+${Math.abs(state.result.score.black - state.result.score.white)}`
        : ''
  const root = `(;GM[1]FF[4]CA[UTF-8]SZ[${state.settings.boardSize}]KM[${state.settings.komi}]PB[${escapeSgf(state.settings.blackPlayer.name)}]PW[${escapeSgf(state.settings.whitePlayer.name)}]${result ? `RE[${result}]` : ''}`
  const moves = state.moveHistory
    .map((move) => {
      const color = move.color === 'black' ? 'B' : 'W'
      const coordinate =
        move.type === 'play' && move.position
          ? `${sgfLetters[move.position.column]}${sgfLetters[move.position.row]}`
          : ''
      return `;${color}[${coordinate}]`
    })
    .join('')
  return `${root}${moves})`
}

export function importSgf(content: string): GameState {
  if (!content.trim().startsWith('(;') || !content.trim().endsWith(')'))
    throw new Error('Tệp SGF không hợp lệ.')
  const size = Number(propertyValue(content, 'SZ')) as BoardSize
  if (!validBoardSizes.has(size)) throw new Error('Chỉ hỗ trợ bàn cờ 9×9, 13×13 hoặc 19×19.')
  const komi = Number(propertyValue(content, 'KM') ?? '6.5')
  if (!Number.isFinite(komi)) throw new Error('Komi trong tệp SGF không hợp lệ.')
  const settings: GameSettings = {
    boardSize: size,
    komi,
    mode: 'local',
    blackPlayer: {
      name: propertyValue(content, 'PB') ?? colorName('black'),
      color: 'black',
      type: 'human',
    },
    whitePlayer: {
      name: propertyValue(content, 'PW') ?? colorName('white'),
      color: 'white',
      type: 'human',
    },
  }
  let state = createGameState(settings)
  const moves = [...content.matchAll(/;([BW])\[([^\]]*)\]/g)]
  for (const [, color, coordinate] of moves) {
    const expectedColor = state.currentPlayer === 'black' ? 'B' : 'W'
    if (color !== expectedColor) throw new Error('Thứ tự nước đi trong SGF không hợp lệ.')
    if (coordinate === '') {
      const result = passTurn(state)
      if (result.error) throw new Error(result.error)
      state = result.state
      continue
    }
    if (coordinate.length !== 2) throw new Error('Tọa độ SGF không hợp lệ.')
    const position = {
      column: sgfLetters.indexOf(coordinate[0]),
      row: sgfLetters.indexOf(coordinate[1]),
    }
    if (position.row < 0 || position.column < 0 || position.row >= size || position.column >= size)
      throw new Error('Tọa độ SGF nằm ngoài bàn cờ.')
    const result = tryPlayMove(state, position)
    if (result.error) throw new Error(`Nước đi SGF không hợp lệ: ${result.error}`)
    state = result.state
  }
  return state
}
