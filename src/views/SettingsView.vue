<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()
</script>

<template>
  <section class="settings">
    <p class="eyebrow">Cá nhân hóa</p>
    <h1>Cài đặt</h1>
    <label
      >Giao diện<select
        :value="settingsStore.theme"
        @change="
          settingsStore.setTheme(($event.target as HTMLSelectElement).value as 'light' | 'dark')
        "
      >
        <option value="light">Sáng</option>
        <option value="dark">Tối</option>
      </select></label
    >
    <p>Giao diện được lưu trên thiết bị này.</p>
  </section>
</template>

<style scoped>
.settings {
  max-width: 30rem;
}
.eyebrow {
  color: #0369a1;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
}
label {
  display: grid;
  font-weight: 650;
  gap: 0.4rem;
}
select {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.7rem;
}
.settings p:last-child {
  color: #64748b;
}
</style>
