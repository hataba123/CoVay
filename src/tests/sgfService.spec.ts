import { describe, expect, it } from 'vitest'
import { createGameState, tryPlayMove } from '@/domain/engine/goGameEngine'
import { exportSgf, importSgf } from '@/services/sgfService'

describe('SGF service', () => {
  it('exports and imports basic game data and moves', () => {
    const moved = tryPlayMove(createGameState(), { row: 4, column: 4 }).state
    const restored = importSgf(exportSgf(moved))
    expect(restored.settings.boardSize).toBe(9)
    expect(restored.settings.komi).toBe(6.5)
    expect(restored.board[4][4]).toBe('black')
  })
  it('rejects unsupported or malformed SGF', () => {
    expect(() => importSgf('not sgf')).toThrow('Tệp SGF không hợp lệ.')
    expect(() => importSgf('(;GM[1]SZ[11])')).toThrow('Chỉ hỗ trợ')
  })
})
