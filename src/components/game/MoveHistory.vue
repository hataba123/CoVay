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
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  max-height: 25rem;
  overflow: auto;
  padding: var(--space-md);
}
h2 {
  font-size: var(--text-xl);
  margin: 0 0 var(--space-sm);
}
ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  align-items: center;
  border-top: 1px solid var(--color-rule);
  display: flex;
  font-size: 0.9rem;
  gap: var(--space-2xs);
  padding: 0.55rem 0;
}
li span:first-child {
  color: var(--color-muted);
  min-width: 1.5rem;
}
.move-stone {
  border-radius: 50%;
  display: inline-block;
  height: 0.7rem;
  width: 0.7rem;
}
.move-stone.black {
  background: var(--color-stone-black);
}
.move-stone.white {
  background: var(--color-stone-white);
  border: 1px solid var(--color-stone-white-shadow);
}
small {
  color: var(--color-success);
  margin-left: auto;
}
p {
  color: var(--color-muted);
  margin: 0;
}
</style>
