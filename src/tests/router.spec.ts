import { describe, expect, it } from 'vitest'
import router from '@/router'

describe('router', () => {
  it('registers all initial application routes', () => {
    expect(router.getRoutes().map((route) => route.path)).toEqual(
      expect.arrayContaining(['/', '/new-game', '/game', '/saved-games', '/settings']),
    )
  })
})
