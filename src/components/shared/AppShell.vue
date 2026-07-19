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
      <RouterLink class="brand" to="/">Cờ Vây</RouterLink>
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
  min-height: 100svh;
}
.app-header {
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  padding: 1rem max(1.25rem, calc((100% - 72rem) / 2));
}
.brand {
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}
nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
nav a {
  border-radius: 0.375rem;
  color: #475569;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
}
nav a:hover,
nav a.router-link-exact-active {
  background: #e0f2fe;
  color: #0369a1;
}
.app-content {
  margin: 0 auto;
  max-width: 72rem;
  padding: 2.5rem 1.25rem;
}
@media (max-width: 38rem) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.75rem;
  }
  .app-content {
    padding-top: 1.5rem;
  }
}
</style>
