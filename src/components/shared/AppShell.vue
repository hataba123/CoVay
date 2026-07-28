<script setup lang="ts">
import { ref } from 'vue'

const navigationItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Ván mới', to: '/new-game' },
  { label: 'Ván đã lưu', to: '/saved-games' },
  { label: 'Cài đặt', to: '/settings' },
]

const isMenuOpen = ref(false)
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink class="brand" to="/">
        <span class="brand-mark" aria-hidden="true"><span /></span>
        <span class="brand-lockup"><strong>Cờ Vây</strong><small>Play with intention</small></span>
      </RouterLink>
      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-controls="primary-navigation"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span>Menu</span><i aria-hidden="true" />
      </button>
      <nav id="primary-navigation" :class="{ open: isMenuOpen }" aria-label="Điều hướng chính">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          @click="isMenuOpen = false"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="app-content"><slot /></main>
  </div>
</template>

<style scoped>
.app-shell {
  background: var(--color-paper);
  min-height: 100svh;
}
.app-header {
  align-items: center;
  display: flex;
  gap: var(--space-lg);
  justify-content: space-between;
  margin: 0 auto;
  max-width: var(--content-max);
  padding: var(--space-md) var(--page-gutter);
  position: relative;
}
.brand {
  align-items: center;
  color: var(--color-ink);
  display: inline-flex;
  gap: var(--space-xs);
  text-decoration: none;
  white-space: nowrap;
  min-height: 2.75rem;
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
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-pill);
  display: flex;
  gap: var(--space-2xs);
  padding: var(--space-3xs);
}
nav a {
  align-items: center;
  border-radius: var(--radius-pill);
  color: var(--color-ink-2);
  display: inline-flex;
  font-size: var(--text-sm);
  min-height: 2.75rem;
  padding: 0.6rem 0.85rem;
  text-decoration: none;
  white-space: nowrap;
}
nav a.router-link-exact-active {
  background: var(--color-paper-3);
  color: var(--color-accent-strong);
}
.menu-toggle {
  align-items: center;
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-pill);
  color: var(--color-ink);
  cursor: pointer;
  display: none;
  font-size: var(--text-sm);
  font-weight: 700;
  gap: var(--space-xs);
  padding-inline: var(--space-sm);
  white-space: nowrap;
}
.menu-toggle i,
.menu-toggle i::before {
  background: currentColor;
  content: '';
  display: block;
  height: 1px;
  transition: transform var(--dur-short) var(--ease-out);
  width: 1rem;
}
.menu-toggle i::before {
  transform: translateY(0.3rem);
}
.menu-toggle[aria-expanded='true'] i {
  transform: translateY(0.15rem) rotate(45deg);
}
.menu-toggle[aria-expanded='true'] i::before {
  transform: rotate(-90deg);
}
.app-content {
  margin: 0 auto;
  max-width: var(--content-max);
  padding: clamp(var(--space-xl), 6vw, var(--space-2xl)) var(--page-gutter) var(--space-3xl);
}
@media (hover: hover) and (pointer: fine) {
  nav a:hover {
    background: var(--color-paper-3);
    color: var(--color-accent-strong);
  }
}
@media (max-width: 46rem) {
  .menu-toggle {
    display: inline-flex;
  }
  nav {
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    display: none;
    inset: calc(100% - var(--space-2xs)) var(--page-gutter) auto;
    padding: var(--space-2xs);
    position: absolute;
    z-index: 100;
  }
  nav.open {
    display: grid;
  }
  nav a {
    padding: 0.75rem var(--space-sm);
  }
  .app-content {
    padding-top: var(--space-xl);
  }
}
@media (max-width: 25rem) {
  .brand-lockup small {
    display: none;
  }
  .brand-mark {
    height: 2.1rem;
    width: 2.1rem;
  }
}
</style>
