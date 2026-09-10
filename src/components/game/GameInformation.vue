<script setup lang="ts">
import { computed } from 'vue'
import type { GameState } from '@/domain/models/game'

const props = defineProps<{ game: GameState }>()

const isBlackTurn = computed(
  () => props.game.status === 'playing' && props.game.currentPlayer === 'black',
)
const isWhiteTurn = computed(
  () => props.game.status === 'playing' && props.game.currentPlayer === 'white',
)

const activePlayerName = computed(() =>
  props.game.currentPlayer === 'black'
    ? props.game.settings.blackPlayer.name
    : props.game.settings.whitePlayer.name,
)

const moveNumber = computed(() => props.game.moveHistory.length)
</script>

<template>
  <section class="game-hud ios-glass" aria-label="Thông tin ván cờ">
    <!-- Black Player Capsule -->
    <div
      class="player-capsule black"
      :class="{ 'is-turn': isBlackTurn }"
    >
      <div class="stone-avatar black-stone" aria-hidden="true" />
      <div class="player-details">
        <span class="player-name">{{ game.settings.blackPlayer.name }}</span>
        <span class="player-type">
          {{ game.settings.blackPlayer.type === 'bot' ? 'Bot' : 'Kỳ thủ' }}
        </span>
      </div>
      <div class="capture-badge" title="Quân đối phương đã bắt">
        <span class="capture-icon" aria-hidden="true">⚔</span>
        <span class="capture-count">{{ game.captures.black }}</span>
      </div>
    </div>

    <!-- Dynamic Island Turn & Game Status -->
    <div class="status-island">
      <div class="turn-pill" :class="{ 'turn-black': isBlackTurn, 'turn-white': isWhiteTurn }">
        <span class="pulse-indicator" aria-hidden="true" />
        <span class="turn-text">
          {{
            game.status === 'playing'
              ? `Lượt ${activePlayerName}`
              : game.status === 'scoring'
                ? 'Đếm điểm'
                : 'Kết thúc'
          }}
        </span>
      </div>
      <div class="hud-meta">
        <span class="move-badge">Nước {{ moveNumber }}</span>
        <span class="komi-badge">Komi {{ game.settings.komi }}</span>
      </div>
    </div>

    <!-- White Player Capsule -->
    <div
      class="player-capsule white"
      :class="{ 'is-turn': isWhiteTurn }"
    >
      <div class="capture-badge" title="Quân đối phương đã bắt">
        <span class="capture-icon" aria-hidden="true">⚔</span>
        <span class="capture-count">{{ game.captures.white }}</span>
      </div>
      <div class="player-details right">
        <span class="player-name">{{ game.settings.whitePlayer.name }}</span>
        <span class="player-type">
          {{ game.settings.whitePlayer.type === 'bot' ? 'Bot' : 'Kỳ thủ' }}
        </span>
      </div>
      <div class="stone-avatar white-stone" aria-hidden="true" />
    </div>
  </section>
</template>

<style scoped>
.game-hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs);
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-xl);
  background: var(--glass-bg);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-card);
  max-width: 46rem;
  margin: 0 auto;
  width: 100%;
}

/* Player Capsules */
.player-capsule {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-pill);
  background: rgba(125, 125, 125, 0.06);
  border: 1px solid transparent;
  transition: all var(--dur-short) var(--ease-spring);
  min-width: 0;
  flex: 1;
}

.player-capsule.is-turn {
  background: rgba(255, 255, 255, 0.88);
  border-color: var(--ios-border-strong);
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.08),
    0 0 0 1.5px var(--ios-tint);
  transform: scale(1.02);
}

:root[data-theme='dark'] .player-capsule.is-turn {
  background: rgba(45, 45, 48, 0.95);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.4),
    0 0 0 1.5px var(--ios-tint);
}

.player-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.player-details.right {
  text-align: right;
}

.player-name {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--ios-label);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 9ch;
}

.player-type {
  font-size: 0.68rem;
  color: var(--ios-secondary-label);
  font-weight: 500;
  line-height: 1.1;
}

/* 3D Mini Stones */
.stone-avatar {
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
}

.black-stone {
  background: radial-gradient(circle at 35% 28%, #4f535a 0%, #151618 60%, #000000 100%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
}

.white-stone {
  background: radial-gradient(circle at 35% 28%, #ffffff 0%, #edf0f5 65%, #c8ced8 100%);
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* Capture Badge */
.capture-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(125, 125, 125, 0.12);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--ios-label);
  flex-shrink: 0;
}

.capture-icon {
  font-size: 0.65rem;
  opacity: 0.7;
}

/* Status Center Island */
.status-island {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  flex-shrink: 0;
  padding: 0 0.4rem;
}

.turn-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-pill);
  background: rgba(0, 0, 0, 0.05);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--ios-label);
  white-space: nowrap;
  transition: all var(--dur-short) var(--ease-ios);
}

:root[data-theme='dark'] .turn-pill {
  background: rgba(255, 255, 255, 0.08);
}

.turn-black .pulse-indicator {
  background: #1c1c1e;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
}

:root[data-theme='dark'] .turn-black .pulse-indicator {
  background: #ffffff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

.turn-white .pulse-indicator {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

.pulse-indicator {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  display: inline-block;
  animation: ios-pulse 1.8s ease-in-out infinite;
}

@keyframes ios-pulse {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.25);
    opacity: 1;
  }
}

.hud-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.65rem;
  font-family: var(--font-mono);
  color: var(--ios-secondary-label);
}

.move-badge,
.komi-badge {
  letter-spacing: 0.02em;
}

/* Responsive Mobile Rules */
@media (max-width: 32rem) {
  .game-hud {
    padding: 0.45rem 0.55rem;
    gap: 0.35rem;
  }

  .player-capsule {
    padding: 0.25rem 0.45rem;
    gap: 0.35rem;
  }

  .player-name {
    max-width: 6ch;
    font-size: 0.8rem;
  }

  .player-type {
    display: none;
  }

  .hud-meta {
    display: none;
  }

  .turn-pill {
    padding: 0.25rem 0.55rem;
    font-size: 0.72rem;
  }
}
</style>
