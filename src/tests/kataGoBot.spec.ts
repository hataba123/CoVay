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

  it('returns score, ownership and principal variations for the analysis panel', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        rootInfo: { winrate: 0.63, scoreLead: 4.5, visits: 300 },
        ownership: Array.from({ length: 81 }, () => 0.5),
        moveInfos: [
          {
            move: 'D4',
            order: 0,
            winrate: 0.65,
            scoreLead: 5,
            visits: 150,
            pv: ['Q16', 'C3'],
          },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const analysis = await new KataGoBot().analyze(createGameState({ boardSize: 9 }))

    expect(analysis).toMatchObject({
      rootWinrate: 0.63,
      rootScoreLead: 4.5,
      rootVisits: 300,
      ownership: Array.from({ length: 81 }, () => 0.5),
      variations: [
        {
          moveLabel: 'D4',
          principalVariation: ['Q16', 'C3'],
          winrate: 0.65,
          scoreLead: 5,
          visits: 150,
        },
      ],
    })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      includeOwnership: true,
      analysisPVLen: 12,
    })
  })
})
