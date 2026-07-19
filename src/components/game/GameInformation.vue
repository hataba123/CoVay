<script setup lang="ts">
import { computed } from 'vue'
import type { GameState } from '@/domain/models/game'

const props = defineProps<{ game: GameState }>()
const currentPlayer = computed(() =>
  props.game.currentPlayer === 'black'
    ? props.game.settings.blackPlayer
    : props.game.settings.whitePlayer,
)
</script>

<template>
  <section class="game-information" aria-label="Thông tin ván cờ">
    <div class="player" :class="{ active: game.currentPlayer === 'black' }">
      <span class="stone black" />{{ game.settings.blackPlayer.name
      }}<strong>{{ game.captures.black }} bắt</strong>
    </div>
    <div class="turn">
      <span class="turn-stone" :class="game.currentPlayer" />{{
        game.status === 'playing'
          ? `Lượt ${currentPlayer.name}`
          : game.status === 'scoring'
            ? 'Xác nhận điểm số'
            : 'Ván cờ đã kết thúc'
      }}
    </div>
    <div class="player right" :class="{ active: game.currentPlayer === 'white' }">
      <span class="stone white" />{{ game.settings.whitePlayer.name
      }}<strong>{{ game.captures.white }} bắt</strong>
    </div>
  </section>
</template>

<style scoped>
.game-information {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr auto 1fr;
  padding: 1rem;
}
.player {
  align-items: center;
  color: #475569;
  display: flex;
  gap: 0.5rem;
  min-width: 0;
}
.player.right {
  justify-content: flex-end;
}
.player.active {
  color: #0f172a;
  font-weight: 700;
}
.player strong {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}
.stone,
.turn-stone {
  border-radius: 999px;
  display: inline-block;
  flex: 0 0 auto;
  height: 1rem;
  width: 1rem;
}
.stone.black,
.turn-stone.black {
  background: #111827;
}
.stone.white,
.turn-stone.white {
  background: #fff;
  border: 1px solid #94a3b8;
}
.turn {
  align-items: center;
  color: #0369a1;
  display: flex;
  font-weight: 700;
  gap: 0.5rem;
  text-align: center;
}
@media (max-width: 40rem) {
  .game-information {
    grid-template-columns: 1fr;
  }
  .player.right {
    justify-content: flex-start;
  }
  .turn {
    order: -1;
  }
}
</style>
