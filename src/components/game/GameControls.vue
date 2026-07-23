<script setup lang="ts">
import type { GameState } from '@/domain/models/game'

defineProps<{ game: GameState; interactionDisabled?: boolean; kataGoAnalyzing?: boolean }>()
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
</script>

<template>
  <div class="controls" aria-label="Điều khiển ván cờ">
    <p v-if="game.status === 'scoring'" class="scoring-help">
      Nhấp vào một nhóm quân để đánh dấu hoặc bỏ đánh dấu quân chết.
    </p>
    <button
      type="button"
      :disabled="game.status !== 'playing' || interactionDisabled"
      @click="emit('pass')"
    >
      Bỏ lượt
    </button>
    <button
      type="button"
      :disabled="game.status !== 'playing' || interactionDisabled"
      @click="emit('resign')"
    >
      Đầu hàng
    </button>
    <button
      type="button"
      :disabled="game.pastStates.length === 0 || game.settings.mode !== 'local'"
      @click="emit('undo')"
    >
      Hoàn tác
    </button>
    <button
      type="button"
      :disabled="game.futureStates.length === 0 || game.settings.mode !== 'local'"
      @click="emit('redo')"
    >
      Làm lại
    </button>
    <button
      type="button"
      :disabled="game.status !== 'playing' || interactionDisabled || kataGoAnalyzing"
      @click="emit('analyzeKatago')"
    >
      {{ kataGoAnalyzing ? 'KataGo đang phân tích…' : 'Phân tích KataGo' }}
    </button>
    <button
      v-if="game.status === 'scoring'"
      class="primary"
      type="button"
      @click="emit('confirmScore')"
    >
      Xác nhận kết quả
    </button>
    <button type="button" @click="emit('exportSgf')">Xuất SGF</button>
    <button type="button" @click="emit('importSgf')">Nhập SGF</button>
    <button type="button" @click="emit('restart')">Ván mới</button>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs);
}
.scoring-help {
  color: var(--color-ink-2);
  flex-basis: 100%;
  margin: 0;
}
button {
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-sm);
  color: var(--color-ink-2);
  cursor: pointer;
  font-weight: 650;
  padding: 0.65rem 0.85rem;
}
button:hover:not(:disabled) {
  background: var(--color-paper-3);
  transform: translateY(-1px);
}
button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-accent-ink);
}
.primary:hover:not(:disabled) {
  background: var(--color-accent-strong);
}
</style>
