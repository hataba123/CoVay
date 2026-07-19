<script setup lang="ts">
import type { KataGoAnalysis } from '@/bots/KataGoBot'

defineProps<{ analysis: KataGoAnalysis }>()

function formatPercent(value: number | null): string {
  return value === null ? '—' : `${(value * 100).toFixed(1)}%`
}

function formatScore(value: number | null): string {
  return value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(1)}`
}
</script>

<template>
  <section class="katago-analysis" aria-label="Phân tích KataGo">
    <h2>Phân tích KataGo</h2>
    <dl>
      <div>
        <dt>Winrate</dt>
        <dd>{{ formatPercent(analysis.rootWinrate) }}</dd>
      </div>
      <div>
        <dt>Score lead</dt>
        <dd>{{ formatScore(analysis.rootScoreLead) }}</dd>
      </div>
      <div>
        <dt>Visits</dt>
        <dd>{{ analysis.rootVisits ?? '—' }}</dd>
      </div>
    </dl>
    <p class="ownership-help">
      Heatmap: đen là Đen, trắng viền xanh là Trắng; đậm hơn nghĩa là dự đoán chắc hơn.
    </p>
    <h3>Biến thể đề xuất</h3>
    <ol v-if="analysis.variations.length">
      <li v-for="variation in analysis.variations" :key="variation.moveLabel">
        <strong>{{ variation.moveLabel }}</strong>
        <span>{{ formatPercent(variation.winrate) }} · {{ formatScore(variation.scoreLead) }}</span>
        <small
          >{{ variation.visits ?? 0 }} visits ·
          {{ variation.principalVariation.join(' → ') || 'Không có PV' }}</small
        >
      </li>
    </ol>
    <p v-else class="empty">KataGo không trả về biến thể cho vị trí này.</p>
  </section>
</template>

<style scoped>
.katago-analysis {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
}
h2,
h3 {
  color: #0f172a;
  margin: 0;
}
h3 {
  font-size: 0.95rem;
  margin-top: 1rem;
}
dl {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(3, 1fr);
  margin: 0.9rem 0;
}
dt {
  color: #64748b;
  font-size: 0.75rem;
}
dd {
  color: #0f172a;
  font-weight: 700;
  margin: 0.15rem 0 0;
}
.ownership-help,
.empty {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0;
}
ol {
  display: grid;
  gap: 0.6rem;
  margin: 0.7rem 0 0;
  padding-left: 1.25rem;
}
li {
  color: #334155;
  padding-left: 0.2rem;
}
li span,
li small {
  display: block;
}
li small {
  color: #64748b;
  margin-top: 0.15rem;
  overflow-wrap: anywhere;
}
</style>
