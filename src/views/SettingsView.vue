<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore'
import { useAudioHaptics } from '@/composables/useAudioHaptics'

const settingsStore = useSettingsStore()
const { playStoneSound, playTapSound, triggerHaptic } = useAudioHaptics()

function toggleSound() {
  playTapSound()
  triggerHaptic('light')
  settingsStore.setSoundEnabled(!settingsStore.soundEnabled)
  if (settingsStore.soundEnabled) {
    playStoneSound()
  }
}

function toggleHaptics() {
  playTapSound()
  settingsStore.setHapticsEnabled(!settingsStore.hapticsEnabled)
  if (settingsStore.hapticsEnabled) {
    triggerHaptic('medium')
  }
}

function toggleCoords() {
  playTapSound()
  triggerHaptic('light')
  settingsStore.setShowCoordinates(!settingsStore.showCoordinates)
}

function setTheme(theme: 'light' | 'dark') {
  playTapSound()
  triggerHaptic('light')
  settingsStore.setTheme(theme)
}
</script>

<template>
  <section class="settings-container">
    <div class="page-intro">
      <p class="eyebrow">TÙY CHỈNH HỆ THỐNG</p>
      <h1>Cài đặt</h1>
      <p class="intro-sub">Cá nhân hóa âm thanh, độ rung và không gian chơi cờ vây.</p>
    </div>

    <!-- Section 1: Audio & Haptics (iOS Settings Group) -->
    <div class="settings-group ios-card">
      <span class="group-title">ÂM THANH & PHẢN HỒI XÚC GIÁC</span>

      <!-- Row: Sound Toggle -->
      <div class="setting-row">
        <div class="row-info">
          <div class="icon-bubble sound-icon" aria-hidden="true">
            <span>🔊</span>
          </div>
          <div class="row-texts">
            <span class="row-title">Hiệu ứng âm thanh</span>
            <span class="row-desc">Tiếng gõ đá cờ và tiếng thu quân bắt</span>
          </div>
        </div>
        <button
          type="button"
          class="ios-switch"
          :class="{ checked: settingsStore.soundEnabled }"
          role="switch"
          :aria-checked="settingsStore.soundEnabled"
          @click="toggleSound"
        >
          <span class="switch-knob" />
        </button>
      </div>

      <div class="row-divider" />

      <!-- Row: Haptic Feedback Toggle -->
      <div class="setting-row">
        <div class="row-info">
          <div class="icon-bubble haptic-icon" aria-hidden="true">
            <span>📳</span>
          </div>
          <div class="row-texts">
            <span class="row-title">Rung xúc giác (Taptic)</span>
            <span class="row-desc">Rung nhẹ khi đặt quân cờ trên thiết bị di động</span>
          </div>
        </div>
        <button
          type="button"
          class="ios-switch"
          :class="{ checked: settingsStore.hapticsEnabled }"
          role="switch"
          :aria-checked="settingsStore.hapticsEnabled"
          @click="toggleHaptics"
        >
          <span class="switch-knob" />
        </button>
      </div>

      <div class="row-divider" />

      <!-- Row: Volume Slider -->
      <div class="setting-row volume-row">
        <div class="row-info">
          <div class="icon-bubble vol-icon" aria-hidden="true">
            <span>🎚</span>
          </div>
          <div class="row-texts">
            <span class="row-title">Âm lượng gõ cờ</span>
            <span class="row-desc">{{ Math.round(settingsStore.volume * 100) }}%</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="settingsStore.volume"
          class="ios-slider"
          :disabled="!settingsStore.soundEnabled"
          @input="settingsStore.setVolume(parseFloat(($event.target as HTMLInputElement).value))"
          @change="playStoneSound()"
        />
      </div>
    </div>

    <!-- Section 2: Board Settings -->
    <div class="settings-group ios-card">
      <span class="group-title">BÀN CỜ & TỌA ĐỘ</span>

      <!-- Row: Coordinates Toggle -->
      <div class="setting-row">
        <div class="row-info">
          <div class="icon-bubble board-icon" aria-hidden="true">
            <span>📐</span>
          </div>
          <div class="row-texts">
            <span class="row-title">Hiển thị tọa độ</span>
            <span class="row-desc">Nhãn A-T và 1-19 quanh viền bàn cờ</span>
          </div>
        </div>
        <button
          type="button"
          class="ios-switch"
          :class="{ checked: settingsStore.showCoordinates }"
          role="switch"
          :aria-checked="settingsStore.showCoordinates"
          @click="toggleCoords"
        >
          <span class="switch-knob" />
        </button>
      </div>
    </div>

    <!-- Section 3: Appearance -->
    <div class="settings-group ios-card">
      <span class="group-title">GIAO DIỆN HỆ THỐNG</span>

      <div class="setting-row theme-row">
        <div class="row-info">
          <div class="icon-bubble theme-icon" aria-hidden="true">
            <span>◐</span>
          </div>
          <div class="row-texts">
            <span class="row-title">Chế độ hiển thị</span>
            <span class="row-desc">Tối ưu cho ban ngày hoặc ban đêm</span>
          </div>
        </div>

        <div class="segmented-control" role="radiogroup">
          <button
            type="button"
            class="seg-item"
            :class="{ active: settingsStore.theme === 'light' }"
            @click="setTheme('light')"
          >
            ☀️ Sáng
          </button>
          <button
            type="button"
            class="seg-item"
            :class="{ active: settingsStore.theme === 'dark' }"
            @click="setTheme('dark')"
          >
            🌙 Tối
          </button>
        </div>
      </div>
    </div>

    <!-- Section 4: App Info & About -->
    <div class="settings-group ios-card">
      <span class="group-title">THÔNG TIN ỨNG DỤNG</span>
      <div class="app-info-content">
        <p><strong>Cờ Vây Web (Zen & Intention)</strong></p>
        <p class="info-text">
          Chạy thuần bằng Vue 3, Pinia, Web Audio API, KataGo AI và IndexedDB. Hỗ trợ cài đặt như
          ứng dụng iOS native qua Progressive Web App (PWA).
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  max-width: 44rem;
  margin: 0 auto;
}

.page-intro {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--ios-tint);
  letter-spacing: 0.1em;
}

h1 {
  font-size: clamp(1.85rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--ios-label);
}

.intro-sub {
  font-size: var(--text-md);
  color: var(--ios-secondary-label);
}

/* Settings Group */
.settings-group {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-title {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ios-tertiary-label);
  letter-spacing: 0.06em;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: 0.4rem 0;
}

.row-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.icon-bubble {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.sound-icon {
  background: rgba(0, 122, 255, 0.12);
}
.haptic-icon {
  background: rgba(52, 199, 89, 0.12);
}
.vol-icon {
  background: rgba(255, 149, 0, 0.12);
}
.board-icon {
  background: rgba(175, 82, 222, 0.12);
}
.theme-icon {
  background: rgba(255, 45, 85, 0.12);
}

.row-texts {
  display: flex;
  flex-direction: column;
}

.row-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--ios-label);
}

.row-desc {
  font-size: 0.72rem;
  color: var(--ios-secondary-label);
}

.row-divider {
  height: 1px;
  background: var(--ios-separator);
}

/* iOS Authentic Switch */
.ios-switch {
  position: relative;
  width: 3.1rem;
  height: 1.9rem;
  border-radius: var(--radius-pill);
  background: var(--ios-border-strong);
  border: none;
  cursor: pointer;
  padding: 2px;
  transition: background-color var(--dur-short) var(--ease-ios);
  flex-shrink: 0;
}

.ios-switch.checked {
  background: var(--ios-success);
}

.switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
  transition: transform var(--dur-short) var(--ease-spring);
}

.ios-switch.checked .switch-knob {
  transform: translateX(1.2rem);
}

/* Slider */
.ios-slider {
  width: 9rem;
  accent-color: var(--ios-tint);
  cursor: pointer;
}

/* Segmented Theme Picker */
.segmented-control {
  display: flex;
  background: rgba(125, 125, 125, 0.09);
  padding: 0.25rem;
  border-radius: var(--radius-pill);
  gap: 0.2rem;
}

.seg-item {
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-pill);
  background: transparent;
  border: none;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--ios-secondary-label);
  transition: all var(--dur-instant) var(--ease-spring);
}

.seg-item.active {
  background: var(--ios-card-solid);
  color: var(--ios-label);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* App Info */
.app-info-content {
  font-size: var(--text-xs);
  color: var(--ios-secondary-label);
  line-height: 1.6;
}

@media (max-width: 34rem) {
  .theme-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .volume-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .ios-slider {
    width: 100%;
    margin-top: 0.4rem;
  }
}
</style>
