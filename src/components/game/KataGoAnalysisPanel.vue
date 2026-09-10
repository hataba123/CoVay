<script setup lang="ts">
import { computed } from 'vue'
import type { KataGoAnalysis } from '@/bots/KataGoBot'

const props = defineProps<{ analysis: KataGoAnalysis }>()

function formatPercent(value: number | null): string {
  return value === null ? '—' : `${(value * 100).toFixed(1)}%`
}

function formatScore(value: number | null): string {
  return value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(1)}`
}

const blackWinratePercent = computed(() => {
  if (props.analysis.rootWinrate === null) return 50
  return Math.max(0, Math.min(100, props.analysis.rootWinrate * 100))
})
const whiteWinratePercent = computed(() => 100 - blackWinratePercent.value)
</script>

<template>
  <section class="katago-panel ios-card" aria-label="Phân tích KataGo AI">
    <div class="panel-header">
      <div class="header-badge">
        <span class="ai-sparkle">✨</span>
        <h2>Phân tích KataGo</h2>
      </div>
      <span class="visits-badge">{{ analysis.rootVisits ?? 0 }} visits</span>
    </div>

    <!-- Dual Winrate Progress Bar (Black vs White) -->
    <div class="winrate-section">
      <div class="winrate-labels">
        <span class="winrate-side black">
          <span class="stone-dot black" /> Đen {{ blackWinratePercent.toFixed(1) }}%
        </span>
        <span class="winrate-side white">
          Trắng {{ whiteWinratePercent.toFixed(1) }}% <span class="stone-dot white" />
        </span>
      </div>
      <div class="winrate-track">
        <div class="winrate-fill black" :style="{ width: `${blackWinratePercent}%` }" />
        <div class="winrate-fill white" :style="{ width: `${whiteWinratePercent}%` }" />
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="stats-grid">
      <div class="stat-box">
        <span class="stat-label">Chênh lệch điểm</span>
        <span
          class="stat-val"
          :class="{
            positive: (analysis.rootScoreLead ?? 0) > 0,
            negative: (analysis.rootScoreLead ?? 0) < 0,
          }"
        >
          {{ formatScore(analysis.rootScoreLead) }}
        </span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Độ sâu</span>
        <span class="stat-val">{{ analysis.rootVisits ?? '—' }} v</span>
      </div>
    </div>

    <!-- Top Variations -->
    <div class="variations-section">
      <h3 class="variations-title">Nước đi tối ưu đề xuất</h3>
      <div v-if="analysis.variations.length" class="variations-list">
        <div
          v-for="(variation, idx) in analysis.variations"
          :key="variation.moveLabel"
          class="var-chip"
        >
          <div class="var-main">
            <span class="var-rank">{{ idx + 1 }}</span>
            <strong class="var-move">{{ variation.moveLabel }}</strong>
            <span class="var-wr">{{ formatPercent(variation.winrate) }}</span>
            <span class="var-score">{{ formatScore(variation.scoreLead) }}</span>
          </div>
          <p v-if="variation.principalVariation.length" class="var-pv">
            {{ variation.principalVariation.slice(0, 4).join(' → ') }}
          </p>
        </div>
      </div>
      <p v-else class="empty-var">Chưa có biến thể cho trạng thái này.</p>
    </div>
  </section>
</template>

<style scoped>
.katago-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: 0.85rem;
  background: var(--ios-card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--ios-border);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--ios-separator);
}

.header-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.ai-sparkle {
  font-size: 0.95rem;
}

h2 {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--ios-label);
  margin: 0;
}

.visits-badge {
  font-size: 0.68rem;
  font-family: var(--font-mono);
  color: var(--ios-secondary-label);
  background: rgba(125, 125, 125, 0.1);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-pill);
}

/* Winrate Dual Bar */
.winrate-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.winrate-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  font-weight: 700;
}

.winrate-side {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.stone-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  display: inline-block;
}

.stone-dot.black {
  background: #1c1c1e;
}

.stone-dot.white {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.winrate-track {
  display: flex;
  height: 0.65rem;
  border-radius: var(--radius-pill);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
  background: rgba(125, 125, 125, 0.2);
}

.winrate-fill {
  height: 100%;
  transition: width var(--dur-medium) var(--ease-spring);
}

.winrate-fill.black {
  background: #1c1c1e;
}

:root[data-theme='dark'] .winrate-fill.black {
  background: #42464d;
}

.winrate-fill.white {
  background: #ffffff;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem;
}

.stat-box {
  background: rgba(125, 125, 125, 0.07);
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.stat-label {
  font-size: 0.65rem;
  color: var(--ios-secondary-label);
}

.stat-val {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 800;
  color: var(--ios-label);
}

.stat-val.positive {
  color: var(--ios-tint);
}

.stat-val.negative {
  color: var(--ios-accent);
}

/* Variations */
.variations-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.variations-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ios-secondary-label);
  margin: 0;
}

.variations-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.var-chip {
  background: rgba(125, 125, 125, 0.05);
  border: 1px solid var(--ios-border);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.var-main {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

.var-rank {
  font-size: 0.65rem;
  color: var(--ios-tertiary-label);
  font-family: var(--font-mono);
}

.var-move {
  color: var(--ios-tint);
  font-family: var(--font-mono);
}

.var-wr {
  font-weight: 700;
  color: var(--ios-label);
}

.var-score {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--ios-secondary-label);
}

.var-pv {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  color: var(--ios-tertiary-label);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-var {
  font-size: 0.72rem;
  color: var(--ios-tertiary-label);
  margin: 0;
}
</style>
