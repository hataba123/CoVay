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
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}
h2,
h3 {
  color: var(--color-ink);
  margin: 0;
}
h3 {
  font-size: 0.95rem;
  margin-top: 1rem;
}
dl {
  display: grid;
  gap: var(--space-2xs);
  grid-template-columns: repeat(3, 1fr);
  margin: 0.9rem 0;
}
dt {
  color: var(--color-muted);
  font-size: 0.75rem;
}
dd {
  color: var(--color-ink);
  font-weight: 700;
  margin: 0.15rem 0 0;
}
.ownership-help,
.empty {
  color: var(--color-muted);
  font-size: 0.8rem;
  margin: 0;
}
ol {
  display: grid;
  gap: var(--space-2xs);
  margin: 0.7rem 0 0;
  padding-left: 1.25rem;
}
li {
  color: var(--color-ink-2);
  padding-left: 0.2rem;
}
li span,
li small {
  display: block;
}
li small {
  color: var(--color-muted);
  margin-top: 0.15rem;
  overflow-wrap: anywhere;
}
</style>
