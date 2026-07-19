import { createGameState, passTurn, tryPlayMove } from '@/domain/engine/goGameEngine'
import type { BoardSize, GameSettings, GameState, StoneColor } from '@/domain/models/game'

const validBoardSizes = new Set<BoardSize>([9, 13, 19])
const sgfLetters = 'abcdefghijklmnopqrstuvwxyz'

function escapeSgf(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/]/g, '\\]')
}
function colorName(color: StoneColor): string {
  return color === 'black' ? 'Đen' : 'Trắng'
}

type SgfNode = Map<string, string[]>

function parseSgfNodes(content: string): SgfNode[] {
  const source = content.trim()
  if (!source.startsWith('(;') || !source.endsWith(')')) throw new Error('Tệp SGF không hợp lệ.')

  const nodes: SgfNode[] = []
  let index = 1
  while (index < source.length - 1) {
    while (/\s/.test(source[index] ?? '')) index += 1
    if (source[index] === '(') throw new Error('SGF có biến thể chưa được hỗ trợ.')
    if (source[index] !== ';') throw new Error('Tệp SGF không hợp lệ.')
    index += 1

    const node: SgfNode = new Map()
    while (index < source.length - 1) {
      while (/\s/.test(source[index] ?? '')) index += 1
      if (!/[A-Z]/.test(source[index] ?? '')) break

      const identifierStart = index
      while (/[A-Z]/.test(source[index] ?? '')) index += 1
      const identifier = source.slice(identifierStart, index)
      const values: string[] = []
      while (source[index] === '[') {
        index += 1
        let value = ''
        while (index < source.length && source[index] !== ']') {
          if (source[index] === '\\' && index + 1 < source.length) index += 1
          value += source[index]
          index += 1
        }
        if (source[index] !== ']') throw new Error('Tệp SGF không hợp lệ.')
        index += 1
        values.push(value)
      }
      if (values.length === 0) throw new Error('Tệp SGF không hợp lệ.')
      node.set(identifier, values)
    }
    nodes.push(node)
  }

  if (nodes.length === 0) throw new Error('Tệp SGF không hợp lệ.')
  return nodes
}

function firstProperty(node: SgfNode, property: string): string | null {
  return node.get(property)?.[0] ?? null
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
  const nodes = parseSgfNodes(content)
  const root = nodes[0]
  if (root.has('AB') || root.has('AW') || root.has('AE') || root.has('HA') || root.has('PL'))
    throw new Error('SGF có thiết lập bàn cờ hoặc handicap chưa được hỗ trợ.')

  const size = Number(firstProperty(root, 'SZ')) as BoardSize
  if (!validBoardSizes.has(size)) throw new Error('Chỉ hỗ trợ bàn cờ 9×9, 13×13 hoặc 19×19.')
  const komi = Number(firstProperty(root, 'KM') ?? '6.5')
  if (!Number.isFinite(komi)) throw new Error('Komi trong tệp SGF không hợp lệ.')
  const settings: GameSettings = {
    boardSize: size,
    komi,
    mode: 'local',
    blackPlayer: {
      name: firstProperty(root, 'PB') ?? colorName('black'),
      color: 'black',
      type: 'human',
    },
    whitePlayer: {
      name: firstProperty(root, 'PW') ?? colorName('white'),
      color: 'white',
      type: 'human',
    },
  }
  let state = createGameState(settings)
  for (const node of nodes.slice(1)) {
    if (node.has('AB') || node.has('AW') || node.has('AE') || node.has('HA') || node.has('PL'))
      throw new Error('SGF có thiết lập bàn cờ hoặc handicap chưa được hỗ trợ.')
    const blackMove = firstProperty(node, 'B')
    const whiteMove = firstProperty(node, 'W')
    if (blackMove !== null && whiteMove !== null) throw new Error('Nút SGF có nhiều nước đi.')
    if (blackMove === null && whiteMove === null) continue

    const color = blackMove === null ? 'W' : 'B'
    const coordinate = blackMove ?? whiteMove ?? ''
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
