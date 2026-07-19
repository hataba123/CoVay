import type { GoBot } from '@/bots/GoBot'
import { EasyGoBot } from '@/bots/EasyGoBot'
import { HardGoBot } from '@/bots/HardGoBot'
import { KataGoBot } from '@/bots/KataGoBot'
import { MediumGoBot } from '@/bots/MediumGoBot'
import type { BotDifficulty } from '@/domain/models/game'

export function createGoBot(difficulty: BotDifficulty = 'medium'): GoBot {
  if (difficulty === 'easy') return new EasyGoBot()
  if (difficulty === 'hard') return new HardGoBot()
  if (difficulty === 'katago') return new KataGoBot()
  return new MediumGoBot()
}
