<script setup lang="ts">
const navigationItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Ván mới', to: '/new-game' },
  { label: 'Ván đã lưu', to: '/saved-games' },
  { label: 'Cài đặt', to: '/settings' },
]
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink class="brand" to="/">
        <span class="brand-mark" aria-hidden="true"><span /></span>
        <span class="brand-lockup"><strong>Cờ Vây</strong><small>Play with intention</small></span>
      </RouterLink>
      <nav aria-label="Điều hướng chính">
        <RouterLink v-for="item in navigationItems" :key="item.to" :to="item.to">
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="app-content"><slot /></main>
  </div>
</template>

<style scoped>
.app-shell {
  background:
    radial-gradient(circle at 86% 5%, var(--color-glow), transparent 26rem), var(--color-paper);
  min-height: 100svh;
}
.app-header {
  align-items: center;
  border-bottom: 1px solid var(--color-rule);
  display: flex;
  gap: var(--space-lg);
  justify-content: space-between;
  margin: 0 auto;
  max-width: 92rem;
  padding: var(--space-md) max(var(--space-md), 4vw);
}
.brand {
  align-items: center;
  color: var(--color-ink);
  display: inline-flex;
  gap: var(--space-xs);
  text-decoration: none;
  white-space: nowrap;
}
.brand-mark {
  align-items: center;
  background: var(--color-board-frame);
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  display: inline-flex;
  height: 2.35rem;
  justify-content: center;
  position: relative;
  width: 2.35rem;
}
.brand-mark::before,
.brand-mark::after,
.brand-mark span {
  background: var(--color-paper);
  border-radius: 50%;
  content: '';
  height: 0.28rem;
  position: absolute;
  width: 0.28rem;
}
.brand-mark::before {
  transform: translate(-0.34rem, -0.34rem);
}
.brand-mark::after {
  transform: translate(0.34rem, 0.34rem);
}
.brand-mark span {
  background: var(--color-accent);
  transform: translate(0.34rem, -0.34rem);
}
.brand-lockup {
  display: grid;
  gap: 0.05rem;
}
.brand-lockup strong {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.035em;
}
.brand-lockup small {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
nav {
  display: flex;
  gap: var(--space-2xs);
}
nav a {
  border-radius: var(--radius-pill);
  color: var(--color-ink-2);
  font-size: var(--text-sm);
  padding: 0.6rem 0.85rem;
  text-decoration: none;
}
nav a:hover,
nav a.router-link-exact-active {
  background: var(--color-paper-3);
  color: var(--color-accent-strong);
  transform: translateY(-1px);
}
.app-content {
  margin: 0 auto;
  max-width: 92rem;
  padding: var(--space-2xl) max(var(--space-md), 4vw) var(--space-3xl);
}
@media (max-width: 46rem) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-sm);
    padding-bottom: var(--space-sm);
  }
  nav {
    flex-wrap: wrap;
  }
  nav a {
    padding-inline: 0.65rem;
  }
  .app-content {
    padding-top: var(--space-xl);
  }
}
</style>
