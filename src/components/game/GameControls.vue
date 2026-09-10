<script setup lang="ts">
import type { GameState } from '@/domain/models/game'
import { useAudioHaptics } from '@/composables/useAudioHaptics'

defineProps<{
  game: GameState
  interactionDisabled?: boolean
  kataGoAnalyzing?: boolean
}>()

const emit = defineEmits<{
  pass: []
  resign: []
  undo: []
  redo: []
  confirmScore: []
  exportSgf: []
  importSgf: []
  restart: []
  analyzeKatago: []
}>()

const { playTapSound, triggerHaptic } = useAudioHaptics()

function handleAction(action: () => void, hapticType: 'light' | 'medium' = 'light') {
  playTapSound()
  triggerHaptic(hapticType)
  action()
}
</script>

<template>
  <div class="controls-wrapper">
    <!-- Helper prompt when in scoring mode -->
    <div v-if="game.status === 'scoring'" class="scoring-banner ios-glass">
      <span class="scoring-icon" aria-hidden="true">💡</span>
      <p>Chạm vào một nhóm quân trên bàn cờ để đánh dấu quân chết trước khi tính điểm.</p>
    </div>

    <!-- Confirm score prominent button in scoring mode -->
    <button
      v-if="game.status === 'scoring'"
      class="ios-primary-btn score-confirm-btn"
      type="button"
      @click="handleAction(() => emit('confirmScore'), 'medium')"
    >
      <span class="btn-icon">✓</span>
      <span>Xác nhận kết quả ván cờ</span>
    </button>

    <!-- Main Tactical Dock -->
    <div class="tactical-dock ios-glass">
      <!-- Undo -->
      <button
        class="dock-btn"
        type="button"
        title="Đi lại nước trước"
        :disabled="game.pastStates.length === 0 || game.settings.mode !== 'local'"
        @click="handleAction(() => emit('undo'))"
      >
        <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
        <span class="dock-label">Hoàn tác</span>
      </button>

      <!-- Pass Turn -->
      <button
        class="dock-btn highlight-pass"
        type="button"
        :disabled="game.status !== 'playing' || interactionDisabled"
        @click="handleAction(() => emit('pass'), 'medium')"
      >
        <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span class="dock-label">Bỏ lượt</span>
      </button>

      <!-- Redo -->
      <button
        class="dock-btn"
        type="button"
        title="Làm lại nước sau"
        :disabled="game.futureStates.length === 0 || game.settings.mode !== 'local'"
        @click="handleAction(() => emit('redo'))"
      >
        <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
        </svg>
        <span class="dock-label">Làm lại</span>
      </button>

      <div class="dock-divider" aria-hidden="true" />

      <!-- KataGo AI Analysis -->
      <button
        class="dock-btn ai-btn"
        type="button"
        :disabled="game.status !== 'playing' || interactionDisabled || kataGoAnalyzing"
        @click="handleAction(() => emit('analyzeKatago'))"
      >
        <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <span class="dock-label">{{ kataGoAnalyzing ? 'Đang soi…' : 'KataGo' }}</span>
      </button>

      <!-- Resign -->
      <button
        class="dock-btn danger-btn"
        type="button"
        title="Nhận thua ván cờ"
        :disabled="game.status !== 'playing' || interactionDisabled"
        @click="handleAction(() => emit('resign'), 'medium')"
      >
        <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        <span class="dock-label">Đầu hàng</span>
      </button>
    </div>

    <!-- Secondary Utilities -->
    <div class="utilities-bar">
      <button
        class="util-btn"
        type="button"
        @click="handleAction(() => emit('exportSgf'))"
      >
        <span>Xuất SGF</span>
      </button>
      <button
        class="util-btn"
        type="button"
        @click="handleAction(() => emit('importSgf'))"
      >
        <span>Nhập SGF</span>
      </button>
      <button
        class="util-btn"
        type="button"
        @click="handleAction(() => emit('restart'))"
      >
        <span>Ván mới</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.controls-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  width: 100%;
  max-width: 46rem;
  margin: 0 auto;
}

/* Scoring Help Banner */
.scoring-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  width: 100%;
  font-size: var(--text-xs);
  color: var(--ios-label);
  background: var(--ios-warning);
  border: 1px solid rgba(255, 149, 0, 0.3);
}

.scoring-icon {
  font-size: 1.1rem;
}

.score-confirm-btn {
  width: 100%;
  padding: 0.85rem;
  border-radius: var(--radius-pill);
  background: var(--ios-success);
  color: #ffffff;
  font-size: var(--text-md);
  font-weight: 700;
  border: none;
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Apple Tactical Glass Dock */
.tactical-dock {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  padding: 0.45rem 0.6rem;
  border-radius: var(--radius-xl);
  background: var(--glass-dock-bg);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-dock);
}

.dock-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.4rem 0.75rem;
  color: var(--ios-label);
  min-height: 3rem;
  flex: 1;
  transition: all var(--dur-instant) var(--ease-spring);
}

.dock-btn:hover:not(:disabled) {
  background: rgba(125, 125, 125, 0.08);
}

.dock-icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke: currentColor;
}

.dock-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.highlight-pass {
  background: rgba(0, 122, 255, 0.08);
  color: var(--ios-tint);
}

.highlight-pass .dock-icon {
  stroke: var(--ios-tint);
}

.ai-btn {
  color: var(--ios-accent);
}

.danger-btn {
  color: var(--ios-danger);
}

.dock-divider {
  width: 1px;
  height: 1.8rem;
  background: var(--ios-separator);
  margin: 0 0.2rem;
}

/* Utility Bar */
.utilities-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  width: 100%;
}

.util-btn {
  background: transparent;
  border: 1px solid var(--ios-border);
  border-radius: var(--radius-pill);
  padding: 0.35rem 0.85rem;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--ios-secondary-label);
  min-height: 2rem;
}

.util-btn:hover:not(:disabled) {
  background: var(--ios-bg-tertiary);
  color: var(--ios-label);
  border-color: var(--ios-border-strong);
}

@media (max-width: 32rem) {
  .dock-btn {
    padding: 0.35rem 0.4rem;
  }
  .dock-label {
    font-size: 0.64rem;
  }
  .dock-icon {
    width: 1.15rem;
    height: 1.15rem;
  }
}
</style>
