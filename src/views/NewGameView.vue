<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type {
  BoardSize,
  BotDifficulty,
  GameMode,
  GameSettings,
  StoneColor,
} from '@/domain/models/game'
import { useGameStore } from '@/stores/gameStore'
import { useAudioHaptics } from '@/composables/useAudioHaptics'

const router = useRouter()
const gameStore = useGameStore()
const { playStoneSound, playTapSound, triggerHaptic } = useAudioHaptics()

const boardSize = ref<BoardSize>(9)
const mode = ref<GameMode>('local')
const humanColor = ref<StoneColor>('black')
const botDifficulty = ref<BotDifficulty>('medium')
const blackName = ref('Đen')
const whiteName = ref('Trắng')
const komi = ref(6.5)

function setBoardSize(size: BoardSize) {
  playTapSound()
  triggerHaptic('light')
  boardSize.value = size
}

function setMode(m: GameMode) {
  playTapSound()
  triggerHaptic('light')
  mode.value = m
}

function setHumanColor(color: StoneColor) {
  playTapSound()
  triggerHaptic('light')
  humanColor.value = color
}

function setBotDifficulty(diff: BotDifficulty) {
  playTapSound()
  triggerHaptic('light')
  botDifficulty.value = diff
}

function decreaseKomi() {
  komi.value = Math.max(0, komi.value - 0.5)
  playTapSound()
  triggerHaptic('light')
}

function increaseKomi() {
  komi.value = Math.min(20, komi.value + 0.5)
  playTapSound()
  triggerHaptic('light')
}

function startGame(): void {
  playStoneSound(1.1)
  triggerHaptic('success')

  const isBotGame = mode.value === 'bot'
  const botName = botDifficulty.value === 'katago' ? 'KataGo AI' : 'Bot'
  const settings: GameSettings = {
    boardSize: boardSize.value,
    komi: komi.value,
    mode: mode.value,
    botDifficulty: isBotGame ? botDifficulty.value : undefined,
    blackPlayer: {
      name: isBotGame && humanColor.value === 'white' ? botName : blackName.value.trim() || 'Đen',
      color: 'black',
      type: isBotGame && humanColor.value === 'white' ? 'bot' : 'human',
    },
    whitePlayer: {
      name: isBotGame && humanColor.value === 'black' ? botName : whiteName.value.trim() || 'Trắng',
      color: 'white',
      type: isBotGame && humanColor.value === 'black' ? 'bot' : 'human',
    },
  }
  gameStore.startGame(settings)
  void router.push('/game')
}
</script>

<template>
  <section class="new-game-container">
    <div class="page-intro">
      <p class="eyebrow">KHỞI TẠO TRẬN ĐẤU</p>
      <h1>Thiết lập ván cờ mới</h1>
      <p class="intro-sub">Chọn kích thước bàn, đối thủ và màu quân để bắt đầu.</p>
    </div>

    <form class="setup-form" @submit.prevent="startGame">
      <!-- Group 1: Board Size (Segmented Control) -->
      <div class="ios-group ios-card">
        <span class="group-title">KÍCH THƯỚC BÀN CỜ</span>
        <div class="segmented-control" role="radiogroup">
          <button
            type="button"
            class="segment-item"
            :class="{ active: boardSize === 9 }"
            @click="setBoardSize(9)"
          >
            <strong>9 × 9</strong>
            <span>Nhập môn</span>
          </button>
          <button
            type="button"
            class="segment-item"
            :class="{ active: boardSize === 13 }"
            @click="setBoardSize(13)"
          >
            <strong>13 × 13</strong>
            <span>Chiến thuật</span>
          </button>
          <button
            type="button"
            class="segment-item"
            :class="{ active: boardSize === 19 }"
            @click="setBoardSize(19)"
          >
            <strong>19 × 19</strong>
            <span>Chuẩn thi đấu</span>
          </button>
        </div>
      </div>

      <!-- Group 2: Mode Selector (Segmented Control) -->
      <div class="ios-group ios-card">
        <span class="group-title">CHẾ ĐỘ CHƠI</span>
        <div class="segmented-control" role="radiogroup">
          <button
            type="button"
            class="segment-item"
            :class="{ active: mode === 'local' }"
            @click="setMode('local')"
          >
            <strong>Hai người</strong>
            <span>Chơi cùng thiết bị</span>
          </button>
          <button
            type="button"
            class="segment-item"
            :class="{ active: mode === 'bot' }"
            @click="setMode('bot')"
          >
            <strong>Đấu Bot</strong>
            <span>Luyện tập với AI</span>
          </button>
        </div>
      </div>

      <!-- Group 3: Players Configuration -->
      <div v-if="mode === 'local'" class="ios-group ios-card">
        <span class="group-title">TÊN KỲ THỦ</span>
        <div class="form-rows">
          <div class="input-row">
            <span class="stone-badge black" aria-hidden="true" />
            <label for="black-name" class="row-label">Quân Đen</label>
            <input
              id="black-name"
              v-model="blackName"
              class="ios-input"
              maxlength="25"
              placeholder="Tên kỳ thủ Đen"
            />
          </div>
          <div class="row-separator" />
          <div class="input-row">
            <span class="stone-badge white" aria-hidden="true" />
            <label for="white-name" class="row-label">Quân Trắng</label>
            <input
              id="white-name"
              v-model="whiteName"
              class="ios-input"
              maxlength="25"
              placeholder="Tên kỳ thủ Trắng"
            />
          </div>
        </div>
      </div>

      <!-- Group 3B: Bot Settings -->
      <div v-else class="ios-group ios-card">
        <span class="group-title">CẤU HÌNH ĐỐI ĐẦU VỚI BOT</span>
        <div class="form-rows">
          <!-- Color Picker -->
          <div class="setting-row">
            <span class="row-label">Bạn cầm quân</span>
            <div class="color-picker-pills">
              <button
                type="button"
                class="color-pill"
                :class="{ active: humanColor === 'black' }"
                @click="setHumanColor('black')"
              >
                <span class="stone-badge black" />
                <span>Đen (đi trước)</span>
              </button>
              <button
                type="button"
                class="color-pill"
                :class="{ active: humanColor === 'white' }"
                @click="setHumanColor('white')"
              >
                <span class="stone-badge white" />
                <span>Trắng</span>
              </button>
            </div>
          </div>

          <div class="row-separator" />

          <!-- Bot Difficulty -->
          <div class="setting-row">
            <span class="row-label">Độ khó Bot</span>
            <div class="diff-pills">
              <button
                type="button"
                class="diff-btn"
                :class="{ active: botDifficulty === 'easy' }"
                @click="setBotDifficulty('easy')"
              >
                Dễ
              </button>
              <button
                type="button"
                class="diff-btn"
                :class="{ active: botDifficulty === 'medium' }"
                @click="setBotDifficulty('medium')"
              >
                Vừa
              </button>
              <button
                type="button"
                class="diff-btn"
                :class="{ active: botDifficulty === 'hard' }"
                @click="setBotDifficulty('hard')"
              >
                Khó
              </button>
              <button
                type="button"
                class="diff-btn katago"
                :class="{ active: botDifficulty === 'katago' }"
                @click="setBotDifficulty('katago')"
              >
                ✨ KataGo
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Group 4: Komi & Rules -->
      <div class="ios-group ios-card">
        <span class="group-title">ĐIỂM MỤC BÙ (KOMI)</span>
        <div class="input-row">
          <label for="komi-input" class="row-label">Komi cho bên Trắng</label>
          <div class="komi-stepper">
            <button type="button" class="stepper-btn" :disabled="komi <= 0" @click="decreaseKomi">
              −
            </button>
            <span class="stepper-val">{{ komi }}</span>
            <button type="button" class="stepper-btn" :disabled="komi >= 20" @click="increaseKomi">
              +
            </button>
          </div>
        </div>
      </div>

      <!-- Submit CTA Button -->
      <div class="form-submit">
        <p class="submit-hint">Ván cờ sẽ tự động lưu liên tục trong suốt quá trình chơi.</p>
        <button type="submit" class="ios-large-btn">
          <span>Bắt đầu ván đấu</span>
          <span class="arrow-icon">↗</span>
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.new-game-container {
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

/* Form Styles */
.setup-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.ios-group {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.group-title {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ios-tertiary-label);
  letter-spacing: 0.06em;
}

/* iOS Segmented Controls */
.segmented-control {
  display: flex;
  background: rgba(125, 125, 125, 0.09);
  padding: 0.3rem;
  border-radius: var(--radius-md);
  gap: 0.3rem;
}

.segment-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.4rem;
  border-radius: calc(var(--radius-md) - 0.2rem);
  background: transparent;
  border: none;
  color: var(--ios-secondary-label);
  transition: all var(--dur-instant) var(--ease-spring);
}

.segment-item strong {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--ios-label);
}

.segment-item span {
  font-size: 0.68rem;
  color: var(--ios-tertiary-label);
}

.segment-item.active {
  background: var(--ios-card-solid);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.segment-item.active strong {
  color: var(--ios-tint);
}

/* Form Rows */
.form-rows {
  display: flex;
  flex-direction: column;
}

.input-row,
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  gap: var(--space-sm);
}

.row-separator {
  height: 1px;
  background: var(--ios-separator);
  margin: 0.35rem 0;
}

.row-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--ios-label);
}

.stone-badge {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.stone-badge.black {
  background: radial-gradient(circle at 35% 28%, #4f535a 0%, #151618 60%, #000000 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.stone-badge.white {
  background: radial-gradient(circle at 35% 28%, #ffffff 0%, #edf0f5 65%, #c8ced8 100%);
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.ios-input {
  flex: 1;
  max-width: 14rem;
  background: rgba(125, 125, 125, 0.08);
  border: 1px solid var(--ios-border);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.85rem;
  font-size: var(--text-sm);
  color: var(--ios-label);
  outline: none;
  text-align: right;
}

.ios-input:focus {
  border-color: var(--ios-tint);
  background: var(--ios-card-solid);
}

/* Color Pills */
.color-picker-pills,
.diff-pills {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.color-pill,
.diff-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(125, 125, 125, 0.08);
  border: 1px solid var(--ios-border);
  border-radius: var(--radius-pill);
  padding: 0.45rem 0.85rem;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--ios-secondary-label);
}

.color-pill.active,
.diff-btn.active {
  background: var(--ios-tint);
  color: #ffffff;
  border-color: var(--ios-tint);
  box-shadow: 0 2px 8px var(--ios-tint-glow);
}

.diff-btn.katago.active {
  background: var(--ios-accent);
  border-color: var(--ios-accent);
  box-shadow: 0 2px 8px var(--ios-accent-glow);
}

/* Stepper */
.komi-stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  background: rgba(125, 125, 125, 0.08);
  padding: 0.25rem 0.4rem;
  border-radius: var(--radius-pill);
}

.stepper-btn {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  border: none;
  background: var(--ios-card-solid);
  color: var(--ios-tint);
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stepper-val {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ios-label);
  min-width: 2.2rem;
  text-align: center;
}

/* Submit */
.form-submit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.submit-hint {
  font-size: var(--text-xs);
  color: var(--ios-tertiary-label);
  text-align: center;
}

.ios-large-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  border-radius: var(--radius-pill);
  background: var(--ios-tint);
  color: #ffffff;
  font-size: var(--text-md);
  font-weight: 700;
  border: none;
  box-shadow: 0 6px 20px var(--ios-tint-glow);
}
</style>
