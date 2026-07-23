<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()
</script>

<template>
  <section class="settings-page">
    <div class="page-intro">
      <p class="eyebrow">Cá nhân hóa</p>
      <h1>Cài đặt</h1>
      <p>Điều chỉnh không gian chơi cho đôi mắt và nhịp tập trung của bạn.</p>
    </div>
    <div class="settings-card">
      <div class="setting-copy">
        <span class="setting-icon" aria-hidden="true">◐</span>
        <div>
          <h2>Giao diện</h2>
          <p>Chế độ màu được lưu trên thiết bị này.</p>
        </div>
      </div>
      <label
        ><span class="visually-hidden">Chọn giao diện</span
        ><select
          :value="settingsStore.theme"
          @change="
            settingsStore.setTheme(($event.target as HTMLSelectElement).value as 'light' | 'dark')
          "
        >
          <option value="light">Sáng</option>
          <option value="dark">Tối</option>
        </select></label
      >
    </div>
  </section>
</template>

<style scoped>
.settings-page {
  display: grid;
  gap: var(--space-xl);
  max-width: 58rem;
}
.page-intro {
  max-width: 37rem;
}
.eyebrow {
  color: var(--color-accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  margin: 0 0 var(--space-md);
  text-transform: uppercase;
}
h1 {
  margin: 0;
}
.page-intro > p:last-child {
  color: var(--color-ink-2);
  font-size: var(--text-lg);
  line-height: 1.5;
  margin: var(--space-md) 0 0;
}
.settings-card {
  align-items: center;
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  display: flex;
  gap: var(--space-lg);
  justify-content: space-between;
  max-width: 44rem;
  padding: var(--space-lg);
}
.setting-copy {
  align-items: flex-start;
  display: flex;
  gap: var(--space-sm);
}
.setting-icon {
  color: var(--color-accent-strong);
  font-size: 1.6rem;
  line-height: 1;
}
h2 {
  font-size: var(--text-xl);
  margin: 0;
}
.setting-copy p {
  color: var(--color-muted);
  margin: var(--space-3xs) 0 0;
}
select {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-sm);
  color: var(--color-ink);
  min-height: 3rem;
  min-width: 8rem;
  padding: 0.7rem 0.8rem;
}
.visually-hidden {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
@media (max-width: 36rem) {
  .settings-card {
    align-items: stretch;
    flex-direction: column;
  }
  select {
    width: 100%;
  }
}
</style>
