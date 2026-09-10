<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { GameResult } from '@/domain/models/game'
import { useAudioHaptics } from '@/composables/useAudioHaptics'

const props = defineProps<{ result: GameResult }>()
defineEmits<{ restart: [] }>()

const { playWinSound, triggerHaptic } = useAudioHaptics()

onMounted(() => {
  playWinSound()
  triggerHaptic('success')
})

const title = computed(() =>
  props.result.winner === 'draw'
    ? 'Ván cờ hòa'
    : `${props.result.winner === 'black' ? 'Đen' : 'Trắng'} chiến thắng!`,
)

const subtitle = computed(() => {
  if (props.result.reason === 'resign') {
    return 'Đối phương đã nhận thua (Đầu hàng).'
  }
  return 'Ván cờ kết thúc bằng cách tính điểm diện tích.'
})
</script>

<template>
  <div class="result-modal-backdrop">
    <section class="result-card ios-card" role="status" aria-labelledby="result-title">
      <!-- iOS Victory Badge -->
      <div class="victory-icon-wrapper" aria-hidden="true">
        <span class="victory-icon">🏆</span>
      </div>

      <h2 id="result-title" class="result-title">{{ title }}</h2>
      <p class="result-subtitle">{{ subtitle }}</p>

      <!-- Score Breakdown Card -->
      <div v-if="result.score" class="score-breakdown">
        <div class="score-column black-col">
          <div class="score-stone black" aria-hidden="true" />
          <span class="score-label">Đen</span>
          <span class="score-value">{{ result.score.black }}</span>
          <span class="score-unit">điểm</span>
        </div>

        <div class="score-divider" aria-hidden="true">
          <span>vs</span>
        </div>

        <div class="score-column white-col">
          <div class="score-stone white" aria-hidden="true" />
          <span class="score-label">Trắng</span>
          <span class="score-value">{{ result.score.white }}</span>
          <span class="score-unit">điểm</span>
        </div>
      </div>

      <p v-if="result.score" class="komi-note">
        Đã tính Komi: +{{ result.score.komi }} cho bên Trắng
      </p>

      <div class="action-buttons">
        <RouterLink class="ios-btn primary" to="/new-game"> Ván mới ↗ </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.result-modal-backdrop {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  z-index: 999;
  animation: backdrop-fade 250ms var(--ease-ios) both;
}

.result-card {
  width: 100%;
  max-width: 26rem;
  padding: clamp(1.5rem, 5vw, 2.2rem);
  text-align: center;
  background: var(--ios-card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  animation: card-spring 360ms var(--ease-spring) both;
}

.victory-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 214, 10, 0.25) 0%, rgba(255, 214, 10, 0.05) 70%);
  margin-bottom: var(--space-sm);
}

.victory-icon {
  font-size: 2.2rem;
}

.result-title {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--ios-label);
  margin-bottom: 0.35rem;
}

.result-subtitle {
  font-size: var(--text-sm);
  color: var(--ios-secondary-label);
  margin-bottom: var(--space-md);
}

/* Score Breakdown */
.score-breakdown {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(125, 125, 125, 0.08);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: var(--space-sm);
}

.score-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.score-stone {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  margin-bottom: 0.2rem;
}

.score-stone.black {
  background: radial-gradient(circle at 35% 28%, #4f535a 0%, #151618 60%, #000000 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.score-stone.white {
  background: radial-gradient(circle at 35% 28%, #ffffff 0%, #edf0f5 65%, #c8ced8 100%);
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.score-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--ios-secondary-label);
}

.score-value {
  font-family: var(--font-mono);
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--ios-label);
  line-height: 1;
}

.score-unit {
  font-size: 0.7rem;
  color: var(--ios-tertiary-label);
}

.score-divider span {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--ios-tertiary-label);
  text-transform: uppercase;
}

.komi-note {
  font-size: 0.78rem;
  font-family: var(--font-mono);
  color: var(--ios-tertiary-label);
  margin-bottom: var(--space-md);
}

/* Button */
.action-buttons {
  margin-top: var(--space-md);
}

.ios-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: var(--control-height);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-pill);
  font-size: var(--text-md);
  font-weight: 700;
  text-decoration: none;
  border: none;
  background: var(--ios-tint);
  color: #ffffff;
  box-shadow: 0 4px 14px var(--ios-tint-glow);
}

@keyframes backdrop-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes card-spring {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
