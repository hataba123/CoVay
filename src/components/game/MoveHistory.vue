<script setup lang="ts">
import { computed } from 'vue'
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
</script>

<template>
  <aside class="move-history">
    <h2>Lịch sử nước đi</h2>
    <ol v-if="entries.length">
      <li v-for="move in entries" :key="move.number">
        <span>{{ move.number }}.</span><span :class="['move-stone', move.color]" />{{ move.label
        }}<small v-if="move.capturedStones">+{{ move.capturedStones }}</small>
      </li>
    </ol>
    <p v-else>Chưa có nước đi nào.</p>
  </aside>
</template>

<style scoped>
.move-history {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  max-height: 25rem;
  overflow: auto;
  padding: 1rem;
}
h2 {
  font-size: 1rem;
  margin: 0 0 0.75rem;
}
ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  align-items: center;
  border-top: 1px solid #f1f5f9;
  display: flex;
  font-size: 0.9rem;
  gap: 0.45rem;
  padding: 0.45rem 0;
}
li span:first-child {
  color: #64748b;
  min-width: 1.5rem;
}
.move-stone {
  border-radius: 50%;
  display: inline-block;
  height: 0.7rem;
  width: 0.7rem;
}
.move-stone.black {
  background: #111827;
}
.move-stone.white {
  background: #fff;
  border: 1px solid #94a3b8;
}
small {
  color: #15803d;
  margin-left: auto;
}
p {
  color: #64748b;
  margin: 0;
}
</style>
