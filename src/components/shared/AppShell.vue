<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAudioHaptics } from '@/composables/useAudioHaptics'

const route = useRoute()
const { playTapSound, triggerHaptic } = useAudioHaptics()

const navItems = [
  { label: 'Trang chủ', to: '/', icon: 'home' },
  { label: 'Bàn cờ', to: '/game', icon: 'board' },
  { label: 'Ván mới', to: '/new-game', icon: 'plus' },
  { label: 'Ván đã lưu', to: '/saved-games', icon: 'archive' },
  { label: 'Cài đặt', to: '/settings', icon: 'gear' },
]

function onTabClick() {
  playTapSound()
  triggerHaptic('light')
}
</script>

<template>
  <div class="app-shell">
    <!-- Apple Glass Top Bar -->
    <header class="app-header ios-glass">
      <div class="header-inner">
        <RouterLink class="brand" to="/" @click="onTabClick">
          <div class="brand-avatar" aria-hidden="true">
            <span class="stone-icon black" />
            <span class="stone-icon white" />
          </div>
          <div class="brand-lockup">
            <strong>Cờ Vây</strong>
            <span class="brand-sub">Zen & Intention</span>
          </div>
        </RouterLink>

        <!-- Desktop Navigation Pill Bar -->
        <nav class="desktop-nav" aria-label="Điều hướng chính">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            @click="onTabClick"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="app-content">
      <slot />
    </main>

    <!-- iPhone Native-style Bottom Tab Bar (Mobile only) -->
    <nav class="ios-tab-bar ios-glass" aria-label="Thanh điều hướng di động">
      <RouterLink
        v-for="item in navItems"
        :key="`tab-${item.to}`"
        :to="item.to"
        class="tab-item"
        :class="{ active: route.path === item.to }"
        @click="onTabClick"
      >
        <!-- Icons -->
        <div class="tab-icon-wrapper" aria-hidden="true">
          <!-- Home Icon -->
          <svg
            v-if="item.icon === 'home'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <!-- Board Icon -->
          <svg
            v-else-if="item.icon === 'board'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
          <!-- Plus Icon -->
          <svg
            v-else-if="item.icon === 'plus'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <!-- Archive Icon -->
          <svg
            v-else-if="item.icon === 'archive'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <!-- Settings Icon -->
          <svg
            v-else-if="item.icon === 'gear'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            />
          </svg>
        </div>
        <span class="tab-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app-shell {
  background: var(--ios-bg);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

/* Glass Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 800;
  border-bottom: 1px solid var(--ios-separator);
  background: var(--glass-bg);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 0.65rem var(--page-gutter);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  color: var(--ios-label);
}

.brand-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #eec988, #be8b46);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}

.brand-avatar .stone-icon {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  position: absolute;
}

.brand-avatar .stone-icon.black {
  background: #1c1c1e;
  transform: translate(-0.25rem, -0.25rem);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.brand-avatar .stone-icon.white {
  background: #ffffff;
  transform: translate(0.25rem, 0.25rem);
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.brand-lockup {
  display: flex;
  flex-direction: column;
}

.brand-lockup strong {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.025em;
}

.brand-sub {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ios-secondary-label);
}

/* Desktop Nav Pills */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(125, 125, 125, 0.08);
  padding: 0.25rem;
  border-radius: var(--radius-pill);
}

.nav-link {
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-pill);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--ios-secondary-label);
  text-decoration: none;
  transition: all var(--dur-instant) var(--ease-spring);
}

.nav-link:hover {
  color: var(--ios-label);
}

.nav-link.router-link-exact-active {
  background: var(--ios-card-solid);
  color: var(--ios-tint);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Main Content */
.app-content {
  flex: 1;
  max-width: var(--content-max);
  width: 100%;
  margin: 0 auto;
  padding: var(--space-md) var(--page-gutter) calc(var(--space-2xl) + var(--sab));
}

/* iPhone Native Bottom Tab Bar */
.ios-tab-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(3.6rem + var(--sab));
  padding-bottom: var(--sab);
  background: var(--glass-dock-bg);
  backdrop-filter: blur(30px) saturate(190%);
  -webkit-backdrop-filter: blur(30px) saturate(190%);
  border-top: 1px solid var(--ios-separator);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  z-index: 850;
  justify-content: space-around;
  align-items: center;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  text-decoration: none;
  color: var(--ios-tertiary-label);
  flex: 1;
  height: 100%;
  transition: color var(--dur-instant) var(--ease-ios);
}

.tab-item.active {
  color: var(--ios-tint);
}

.tab-icon-wrapper svg {
  width: 1.35rem;
  height: 1.35rem;
  stroke: currentColor;
}

.tab-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

@media (max-width: 48rem) {
  .desktop-nav {
    display: none;
  }
  .ios-tab-bar {
    display: flex;
  }
  .app-content {
    padding-bottom: calc(4.8rem + var(--sab));
  }
}
</style>
