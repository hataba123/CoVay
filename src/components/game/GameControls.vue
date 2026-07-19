<script setup lang="ts">
import type { GameState } from '@/domain/models/game'

defineProps<{ game: GameState }>()
const emit = defineEmits<{
  pass: []
  resign: []
  undo: []
  redo: []
  confirmScore: []
  exportSgf: []
  importSgf: []
  restart: []
}>()
</script>

<template>
  <div class="controls" aria-label="Điều khiển ván cờ">
    <button type="button" :disabled="game.status !== 'playing'" @click="emit('pass')">
      Bỏ lượt
    </button>
    <button type="button" :disabled="game.status !== 'playing'" @click="emit('resign')">
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
  gap: 0.5rem;
}
button {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  color: #334155;
  cursor: pointer;
  font-weight: 650;
  padding: 0.65rem 0.8rem;
}
button:hover:not(:disabled) {
  background: #f1f5f9;
}
button:focus-visible {
  outline: 3px solid #7dd3fc;
  outline-offset: 2px;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.primary {
  background: #0369a1;
  border-color: #0369a1;
  color: #fff;
}
.primary:hover:not(:disabled) {
  background: #075985;
}
</style>
