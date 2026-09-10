<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAudioHaptics } from '@/composables/useAudioHaptics'

const settingsStore = useSettingsStore()
const { playStoneSound, playTapSound, triggerHaptic } = useAudioHaptics()

const resetNotice = ref<string | null>(null)

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

function clearAllSavedGames() {
  triggerHaptic('error')
  if (!globalThis.confirm('Bạn có chắc muốn xóa toàn bộ các ván cờ đã lưu trên thiết bị này?')) {
    return
  }

  try {
    // Clear localStorage backup
    localStorage.removeItem('co-vay-saved-games-backup')
    // Clear IndexedDB if available
    if (typeof indexedDB !== 'undefined') {
      indexedDB.deleteDatabase('co-vay')
    }
    resetNotice.value = 'Đã dọn sạch bộ nhớ ván cờ trên thiết bị.'
    setTimeout(() => {
      resetNotice.value = null
    }, 3000)
    triggerHaptic('medium')
  } catch {
    resetNotice.value = 'Không thể xóa dữ liệu bộ nhớ.'
  }
}
</script>

<template>
  <section class="settings-container">
    <div class="page-intro">
      <p class="eyebrow">TÙY CHỈNH HỆ THỐNG</p>
      <h1>Cài đặt</h1>
      <p class="intro-sub">Cá nhân hóa âm thanh, độ rung và không gian chơi cờ vây.</p>
    </div>

    <!-- Feedback Notice -->
    <div v-if="resetNotice" class="settings-notice" role="status">
      <span>✓</span>
      <p>{{ resetNotice }}</p>
    </div>

    <!-- Section 1: Audio & Haptics (iOS Settings Group) -->
    <div class="settings-group ios-card">
      <span class="group-title">ÂM THANH & PHẢN HỒI XÚC GIÁC</span>

      <!-- Row: Sound Toggle -->
      <div
        class="setting-row clickable"
        role="button"
        tabindex="0"
        @click="toggleSound"
        @keydown.enter.prevent="toggleSound"
      >
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
          @click.stop="toggleSound"
        >
          <span class="switch-knob" />
        </button>
      </div>

      <div class="row-divider" />

      <!-- Row: Haptic Feedback Toggle -->
      <div
        class="setting-row clickable"
        role="button"
        tabindex="0"
        @click="toggleHaptics"
        @keydown.enter.prevent="toggleHaptics"
      >
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
          @click.stop="toggleHaptics"
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
      <div
        class="setting-row clickable"
        role="button"
        tabindex="0"
        @click="toggleCoords"
        @keydown.enter.prevent="toggleCoords"
      >
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
          @click.stop="toggleCoords"
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
            <span class="row-title">Chế độ màu</span>
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

    <!-- Section 4: Storage Management -->
    <div class="settings-group ios-card">
      <span class="group-title">DỮ LIỆU & BỘ NHỚ</span>

      <div class="setting-row">
        <div class="row-info">
          <div class="icon-bubble storage-icon" aria-hidden="true">
            <span>🗑</span>
          </div>
          <div class="row-texts">
            <span class="row-title">Xóa bộ nhớ ván cờ</span>
            <span class="row-desc">Đặt lại toàn bộ danh sách các ván đã lưu</span>
          </div>
        </div>
        <button type="button" class="danger-action-btn" @click="clearAllSavedGames">Xóa hết</button>
      </div>
    </div>

    <!-- Section 5: App Info & About -->
    <div class="settings-group ios-card">
      <span class="group-title">THÔNG TIN ỨNG DỤNG</span>
      <div class="app-info-content">
        <p><strong>Cờ Vây Web (Zen & Intention)</strong></p>
        <p class="info-text">
          Chạy thuần bằng Vue 3, Pinia, Web Audio API, KataGo AI và IndexedDB/LocalStorage. Hỗ trợ
          cài đặt như ứng dụng iOS native qua Progressive Web App (PWA).
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

.settings-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: rgba(52, 199, 89, 0.15);
  color: var(--ios-success);
  font-size: var(--text-xs);
  font-weight: 700;
  border: 1px solid rgba(52, 199, 89, 0.3);
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
  padding: 0.45rem 0.25rem;
  border-radius: var(--radius-sm);
  outline: none;
}

.setting-row.clickable {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  transition: background-color var(--dur-instant) var(--ease-ios);
}

.setting-row.clickable:hover {
  background: rgba(125, 125, 125, 0.06);
}

.setting-row.clickable:focus-visible {
  outline: 2px solid var(--ios-tint);
  outline-offset: 2px;
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
.storage-icon {
  background: rgba(255, 59, 48, 0.12);
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

/* iOS Switch with strict dimensions to override global button min-height */
.ios-switch {
  position: relative;
  width: 3.1rem !important;
  min-width: 3.1rem !important;
  max-width: 3.1rem !important;
  height: 1.9rem !important;
  min-height: 1.9rem !important;
  max-height: 1.9rem !important;
  border-radius: var(--radius-pill);
  background: var(--ios-border-strong);
  border: none;
  cursor: pointer;
  padding: 2px;
  transition: background-color var(--dur-short) var(--ease-ios);
  flex-shrink: 0;
  box-sizing: border-box;
}

.ios-switch:active {
  transform: none !important;
  opacity: 1 !important;
}

.ios-switch:focus-visible {
  outline: 2px solid var(--ios-tint);
  outline-offset: 2px;
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
  pointer-events: none;
}

.ios-switch.checked .switch-knob {
  transform: translateX(1.2rem);
}

/* Slider */
.ios-slider {
  width: 9rem;
  accent-color: var(--ios-tint);
  cursor: pointer;
  min-height: unset !important;
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
  padding: 0.4rem 0.95rem;
  border-radius: var(--radius-pill);
  background: transparent;
  border: none;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--ios-secondary-label);
  transition: all var(--dur-instant) var(--ease-spring);
  min-height: 2.2rem !important;
}

.seg-item.active {
  background: var(--ios-card-solid);
  color: var(--ios-label);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Danger Button */
.danger-action-btn {
  padding: 0.45rem 1rem;
  border-radius: var(--radius-pill);
  background: rgba(255, 59, 48, 0.1);
  color: var(--ios-danger);
  border: 1px solid rgba(255, 59, 48, 0.25);
  font-size: var(--text-xs);
  font-weight: 700;
  min-height: unset !important;
}

.danger-action-btn:hover {
  background: var(--ios-danger);
  color: #ffffff;
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
