import type {
  Board,
  BoardPosition,
  GameResult,
  GameScore,
  GameSettings,
  GameState,
  GameStateSnapshot,
  MoveResult,
  StoneColor,
} from '@/domain/models/game'

const defaultSettings: GameSettings = {
  boardSize: 9,
  komi: 6.5,
  mode: 'local',
  blackPlayer: { name: 'Đen', color: 'black', type: 'human' },
  whitePlayer: { name: 'Trắng', color: 'white', type: 'human' },
}

const directions: ReadonlyArray<BoardPosition> = [
  { row: -1, column: 0 },
  { row: 1, column: 0 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
]

function opposite(color: StoneColor): StoneColor {
  return color === 'black' ? 'white' : 'black'
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

function clonePosition(position: BoardPosition): BoardPosition {
  return { row: position.row, column: position.column }
}

function cloneSnapshot(snapshot: GameStateSnapshot): GameStateSnapshot {
  return {
    board: cloneBoard(snapshot.board),
    currentPlayer: snapshot.currentPlayer,
    captures: { ...snapshot.captures },
    consecutivePasses: snapshot.consecutivePasses,
    moveHistory: snapshot.moveHistory.map((move) => ({
      ...move,
      position: move.position ? clonePosition(move.position) : null,
    })),
    previousBoardHash: snapshot.previousBoardHash,
    status: snapshot.status,
    result: snapshot.result
      ? {
          ...snapshot.result,
          score: snapshot.result.score ? { ...snapshot.result.score } : undefined,
        }
      : null,
  }
}

function snapshotState(state: GameState): GameStateSnapshot {
  return cloneSnapshot(state)
}

function applySnapshot(
  state: GameState,
  snapshot: GameStateSnapshot,
  pastStates: GameStateSnapshot[],
  futureStates: GameStateSnapshot[],
): GameState {
  return {
    ...cloneSnapshot(snapshot),
    settings: state.settings,
    pastStates,
    futureStates,
  }
}

export function createGameState(settings: Partial<GameSettings> = {}): GameState {
  const gameSettings: GameSettings = {
    ...defaultSettings,
    ...settings,
    blackPlayer: settings.blackPlayer ?? defaultSettings.blackPlayer,
    whitePlayer: settings.whitePlayer ?? defaultSettings.whitePlayer,
  }

  return {
    settings: gameSettings,
    board: Array.from({ length: gameSettings.boardSize }, () =>
      Array.from({ length: gameSettings.boardSize }, () => null),
    ),
    currentPlayer: 'black',
    captures: { black: 0, white: 0 },
    consecutivePasses: 0,
    moveHistory: [],
    previousBoardHash: null,
    status: 'playing',
    result: null,
    pastStates: [],
    futureStates: [],
  }
}

export function isOnBoard(board: Board, position: BoardPosition): boolean {
  return (
    position.row >= 0 &&
    position.column >= 0 &&
    position.row < board.length &&
    position.column < board.length
  )
}

export function getAdjacentPositions(board: Board, position: BoardPosition): BoardPosition[] {
  return directions
    .map((direction) => ({
      row: position.row + direction.row,
      column: position.column + direction.column,
    }))
    .filter((adjacent) => isOnBoard(board, adjacent))
}

function positionKey(position: BoardPosition): string {
  return `${position.row}:${position.column}`
}

export function getConnectedGroup(board: Board, position: BoardPosition): BoardPosition[] {
  const color = board[position.row]?.[position.column]
  if (!color) {
    return []
  }

  const group: BoardPosition[] = []
  const visited = new Set<string>()
  const pending = [position]

  while (pending.length > 0) {
    const current = pending.pop()
    if (!current || visited.has(positionKey(current))) {
      continue
    }

    visited.add(positionKey(current))
    group.push(current)

    for (const adjacent of getAdjacentPositions(board, current)) {
      if (board[adjacent.row][adjacent.column] === color && !visited.has(positionKey(adjacent))) {
        pending.push(adjacent)
      }
    }
  }

  return group
}

export function getGroupLiberties(board: Board, group: BoardPosition[]): BoardPosition[] {
  const liberties = new Map<string, BoardPosition>()
  for (const stone of group) {
    for (const adjacent of getAdjacentPositions(board, stone)) {
      if (board[adjacent.row][adjacent.column] === null) {
        liberties.set(positionKey(adjacent), adjacent)
      }
    }
  }
  return [...liberties.values()]
}

export function boardHash(board: Board): string {
  return board.map((row) => row.map((stone) => stone?.[0] ?? '.').join('')).join('/')
}

function removeGroup(board: Board, group: BoardPosition[]): void {
  for (const stone of group) {
    board[stone.row][stone.column] = null
  }
}

function appendMove(
  state: GameState,
  type: 'play' | 'pass' | 'resign',
  position: BoardPosition | null,
  capturedStones: number,
): GameState['moveHistory'] {
  return [
    ...state.moveHistory,
    {
      number: state.moveHistory.length + 1,
      color: state.currentPlayer,
      type,
      position: position ? clonePosition(position) : null,
      capturedStones,
    },
  ]
}

function withCommittedState(
  state: GameState,
  changes: Omit<GameStateSnapshot, 'pastStates' | 'futureStates'>,
): GameState {
  return {
    ...changes,
    settings: state.settings,
    pastStates: [...state.pastStates, snapshotState(state)],
    futureStates: [],
  }
}

export function tryPlayMove(state: GameState, position: BoardPosition): MoveResult {
  if (state.status !== 'playing') {
    return { state, error: 'Ván cờ đã kết thúc.' }
  }
  if (!isOnBoard(state.board, position)) {
    return { state, error: 'Nước đi nằm ngoài bàn cờ.' }
  }
  if (state.board[position.row][position.column] !== null) {
    return { state, error: 'Giao điểm này đã có quân.' }
  }

  const board = cloneBoard(state.board)
  const player = state.currentPlayer
  const opponent = opposite(player)
  board[position.row][position.column] = player
  let capturedStones = 0
  const processedGroups = new Set<string>()

  for (const adjacent of getAdjacentPositions(board, position)) {
    if (
      board[adjacent.row][adjacent.column] !== opponent ||
      processedGroups.has(positionKey(adjacent))
    ) {
      continue
    }

    const group = getConnectedGroup(board, adjacent)
    group.forEach((stone) => processedGroups.add(positionKey(stone)))
    if (getGroupLiberties(board, group).length === 0) {
      removeGroup(board, group)
      capturedStones += group.length
    }
  }

  if (getGroupLiberties(board, getConnectedGroup(board, position)).length === 0) {
    return { state, error: 'Không được đi tự sát.' }
  }
  if (boardHash(board) === state.previousBoardHash) {
    return { state, error: 'Nước đi vi phạm luật Ko.' }
  }

  return {
    state: withCommittedState(state, {
      board,
      currentPlayer: opponent,
      captures: { ...state.captures, [player]: state.captures[player] + capturedStones },
      consecutivePasses: 0,
      moveHistory: appendMove(state, 'play', position, capturedStones),
      previousBoardHash: boardHash(state.board),
      status: 'playing',
      result: null,
    }),
    error: null,
  }
}

export function passTurn(state: GameState): MoveResult {
  if (state.status !== 'playing') {
    return { state, error: 'Ván cờ đã kết thúc.' }
  }

  const consecutivePasses = state.consecutivePasses + 1
  return {
    state: withCommittedState(state, {
      board: cloneBoard(state.board),
      currentPlayer: opposite(state.currentPlayer),
      captures: { ...state.captures },
      consecutivePasses,
      moveHistory: appendMove(state, 'pass', null, 0),
      previousBoardHash: boardHash(state.board),
      status: consecutivePasses >= 2 ? 'scoring' : 'playing',
      result: null,
    }),
    error: null,
  }
}

export function resignGame(state: GameState): MoveResult {
  if (state.status !== 'playing') {
    return { state, error: 'Ván cờ đã kết thúc.' }
  }

  const result: GameResult = { winner: opposite(state.currentPlayer), reason: 'resign' }
  return {
    state: withCommittedState(state, {
      board: cloneBoard(state.board),
      currentPlayer: state.currentPlayer,
      captures: { ...state.captures },
      consecutivePasses: state.consecutivePasses,
      moveHistory: appendMove(state, 'resign', null, 0),
      previousBoardHash: state.previousBoardHash,
      status: 'finished',
      result,
    }),
    error: null,
  }
}

export function calculateAreaScore(board: Board, komi: number): GameScore {
  let blackStones = 0
  let whiteStones = 0
  let blackTerritory = 0
  let whiteTerritory = 0
  const visited = new Set<string>()

  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board.length; column += 1) {
      const position = { row, column }
      const stone = board[row][column]
      if (stone === 'black') {
        blackStones += 1
      } else if (stone === 'white') {
        whiteStones += 1
      } else if (!visited.has(positionKey(position))) {
        const region: BoardPosition[] = []
        const borderingColors = new Set<StoneColor>()
        const pending = [position]
        visited.add(positionKey(position))

        while (pending.length > 0) {
          const current = pending.pop()
          if (!current) continue
          region.push(current)
          for (const adjacent of getAdjacentPositions(board, current)) {
            const adjacentStone = board[adjacent.row][adjacent.column]
            if (adjacentStone) {
              borderingColors.add(adjacentStone)
            } else if (!visited.has(positionKey(adjacent))) {
              visited.add(positionKey(adjacent))
              pending.push(adjacent)
            }
          }
        }

        if (borderingColors.size === 1) {
          if (borderingColors.has('black')) blackTerritory += region.length
          if (borderingColors.has('white')) whiteTerritory += region.length
        }
      }
    }
  }

  return {
    black: blackStones + blackTerritory,
    white: whiteStones + whiteTerritory + komi,
    blackTerritory,
    whiteTerritory,
    blackStones,
    whiteStones,
    komi,
  }
}

export function confirmScore(state: GameState): MoveResult {
  if (state.status !== 'scoring') {
    return { state, error: 'Chưa thể xác nhận điểm số.' }
  }
  const score = calculateAreaScore(state.board, state.settings.komi)
  const result: GameResult = {
    winner: score.black === score.white ? 'draw' : score.black > score.white ? 'black' : 'white',
    reason: 'score',
    score,
  }
  return {
    state: { ...state, status: 'finished', result },
    error: null,
  }
}

export function undoMove(state: GameState): MoveResult {
  const previous = state.pastStates.at(-1)
  if (!previous) return { state, error: 'Không có nước đi để hoàn tác.' }

  return {
    state: applySnapshot(state, previous, state.pastStates.slice(0, -1), [
      snapshotState(state),
      ...state.futureStates,
    ]),
    error: null,
  }
}

export function redoMove(state: GameState): MoveResult {
  const next = state.futureStates[0]
  if (!next) return { state, error: 'Không có nước đi để làm lại.' }

  return {
    state: applySnapshot(
      state,
      next,
      [...state.pastStates, snapshotState(state)],
      state.futureStates.slice(1),
    ),
    error: null,
  }
}

export function getLegalMoves(state: GameState): BoardPosition[] {
  if (state.status !== 'playing') return []
  const moves: BoardPosition[] = []
  for (let row = 0; row < state.board.length; row += 1) {
    for (let column = 0; column < state.board.length; column += 1) {
      const position = { row, column }
      if (tryPlayMove(state, position).error === null) moves.push(position)
    }
  }
  return moves
}
