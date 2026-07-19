import type { GoBot } from '@/bots/GoBot'
import { EasyGoBot } from '@/bots/EasyGoBot'
import { HardGoBot } from '@/bots/HardGoBot'
import { MediumGoBot } from '@/bots/MediumGoBot'
import type { BotDifficulty } from '@/domain/models/game'

export function createGoBot(difficulty: BotDifficulty = 'medium'): GoBot {
  if (difficulty === 'easy') return new EasyGoBot()
  if (difficulty === 'hard') return new HardGoBot()
  return new MediumGoBot()
}
