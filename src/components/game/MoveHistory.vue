<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { GoMove } from '@/domain/models/game'

const props = defineProps<{ moves: GoMove[] }>()
const columns = 'ABCDEFGHJKLMNOPQRST'

const entries = computed(() =>
  props.moves.map((move) => ({
    ...move,
    label:
      move.type === 'pass'
        ? 'Bỏ lượt'
        : move.type === 'resign'
          ? 'Đầu hàng'
          : `${columns[move.position?.column ?? 0]}${(move.position?.row ?? 0) + 1}`,
  })),
)

const listRef = ref<HTMLElement | null>(null)

// Auto scroll to newest move
watch(
  () => props.moves.length,
  async () => {
    await nextTick()
    if (listRef.value) {
      listRef.value.scrollTo({
        top: listRef.value.scrollHeight,
        behavior: 'smooth',
      })
    }
  },
)
</script>

<template>
  <aside class="move-history-card ios-card" aria-label="Lịch sử nước đi">
    <div class="card-header">
      <div class="header-title">
        <span class="header-icon" aria-hidden="true">📜</span>
        <h2>Lịch sử</h2>
      </div>
      <span class="badge-count">{{ entries.length }} nước</span>
    </div>

    <div ref="listRef" class="scroll-area">
      <ol v-if="entries.length" class="moves-list">
        <li
          v-for="(move, index) in entries"
          :key="move.number"
          class="move-item"
          :class="{ 'is-latest': index === entries.length - 1 }"
        >
          <span class="move-num">{{ String(move.number).padStart(2, '0') }}</span>
          <span class="stone-icon" :class="move.color" aria-hidden="true" />
          <span class="move-coord">{{ move.label }}</span>
          <span v-if="move.capturedStones" class="capture-pill"> +{{ move.capturedStones }} </span>
        </li>
      </ol>
      <div v-else class="empty-state">
        <p>Ván cờ chưa bắt đầu.</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.move-history-card {
  display: flex;
  flex-direction: column;
  padding: 0.85rem;
  height: 100%;
  max-height: 22rem;
  background: var(--ios-card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--ios-border);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--ios-separator);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.header-icon {
  font-size: 1rem;
}

h2 {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--ios-label);
  margin: 0;
}

.badge-count {
  font-size: 0.72rem;
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--ios-secondary-label);
  background: rgba(125, 125, 125, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-pill);
}

.scroll-area {
  overflow-y: auto;
  flex: 1;
  padding-right: 0.2rem;
}

.moves-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.move-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
  transition: background-color var(--dur-instant) var(--ease-ios);
}

.move-item:hover {
  background: rgba(125, 125, 125, 0.06);
}

.move-item.is-latest {
  background: rgba(0, 122, 255, 0.08);
  font-weight: 700;
}

.move-num {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--ios-tertiary-label);
  min-width: 1.4rem;
}

.stone-icon {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.stone-icon.black {
  background: radial-gradient(circle at 35% 28%, #4f535a 0%, #151618 60%, #000000 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.stone-icon.white {
  background: radial-gradient(circle at 35% 28%, #ffffff 0%, #edf0f5 65%, #c8ced8 100%);
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.move-coord {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--ios-label);
}

.capture-pill {
  margin-left: auto;
  font-size: 0.7rem;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--ios-success);
  background: rgba(52, 199, 89, 0.12);
  padding: 0.08rem 0.4rem;
  border-radius: var(--radius-pill);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 6rem;
  color: var(--ios-tertiary-label);
  font-size: var(--text-xs);
}
</style>
