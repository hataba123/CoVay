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
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  display: grid;
  gap: var(--space-md);
  grid-template-columns: 1fr auto 1fr;
  padding: var(--space-sm) var(--space-md);
}
.player {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  gap: var(--space-2xs);
  min-width: 0;
}
.player.right {
  justify-content: flex-end;
}
.player.active {
  color: var(--color-ink);
  font-weight: 700;
}
.player strong {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
}
.stone,
.turn-stone {
  border-radius: 999px;
  display: inline-block;
  flex: 0 0 auto;
  height: 0.9rem;
  width: 0.9rem;
}
.stone.black,
.turn-stone.black {
  background: var(--color-stone-black);
}
.stone.white,
.turn-stone.white {
  background: var(--color-stone-white);
  border: 1px solid var(--color-stone-white-shadow);
}
.turn {
  align-items: center;
  color: var(--color-accent-strong);
  display: flex;
  font-weight: 700;
  gap: var(--space-2xs);
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
