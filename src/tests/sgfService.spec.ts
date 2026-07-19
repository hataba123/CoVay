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
    expect(() => importSgf('(;SZ[9];B[dd](;W[ee])(;W[ff]))')).toThrow('biến thể')
    expect(() => importSgf('(;SZ[9]HA[2]AB[dd][pp])')).toThrow('handicap')
  })

  it('parses escaped root values and ignores move-like text in comments', () => {
    const restored = importSgf(
      '(;GM[1]FF[4]SZ[9]PB[Người chơi \\] A]PW[Đối thủ];B[dd]C[Không phải nước ;W[ee\\]])',
    )

    expect(restored.settings.blackPlayer.name).toBe('Người chơi ] A')
    expect(restored.board[3][3]).toBe('black')
    expect(restored.moveHistory).toHaveLength(1)
  })
})
