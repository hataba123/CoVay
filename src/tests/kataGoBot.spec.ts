import { afterEach, describe, expect, it, vi } from 'vitest'
import { KataGoBot } from '@/bots/KataGoBot'
import { createGameState, tryPlayMove } from '@/domain/engine/goGameEngine'

describe('KataGoBot', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('sends the game history in KataGo coordinates and maps its response to the board', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ moveInfos: [{ move: 'J9' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const state = tryPlayMove(createGameState({ boardSize: 9 }), { row: 8, column: 0 }).state

    const move = await new KataGoBot().findBestMove(state)

    expect(move).toEqual({ row: 0, column: 8 })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      moves: [['B', 'A1']],
      boardXSize: 9,
      boardYSize: 9,
      analyzeTurns: [1],
    })
  })

  it('rejects a response containing an out-of-board move', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ moveInfos: [{ move: 'T19' }] }),
      }),
    )

    await expect(new KataGoBot().findBestMove(createGameState({ boardSize: 9 }))).rejects.toThrow(
      'nằm ngoài bàn cờ',
    )
  })
})
