<script setup lang="ts">
import { computed } from 'vue'
import type { GameResult } from '@/domain/models/game'

const props = defineProps<{ result: GameResult }>()
const title = computed(() =>
  props.result.winner === 'draw'
    ? 'Ván cờ hòa'
    : `${props.result.winner === 'black' ? 'Đen' : 'Trắng'} chiến thắng`,
)
</script>

<template>
  <section class="result" role="status">
    <h2>{{ title }}</h2>
    <p v-if="result.reason === 'resign'">Đối phương đã đầu hàng.</p>
    <template v-else-if="result.score"
      ><p>Đen: {{ result.score.black }} điểm · Trắng: {{ result.score.white }} điểm</p>
      <small>Komi: {{ result.score.komi }}</small></template
    >
  </section>
</template>

<style scoped>
.result {
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 0.75rem;
  color: #164e63;
  padding: 1rem;
}
.result h2 {
  margin: 0 0 0.25rem;
}
.result p {
  margin: 0;
}
.result small {
  color: #0e7490;
}
</style>
