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

const router = useRouter()
const gameStore = useGameStore()
const boardSize = ref<BoardSize>(9)
const mode = ref<GameMode>('local')
const humanColor = ref<StoneColor>('black')
const botDifficulty = ref<BotDifficulty>('medium')
const blackName = ref('Đen')
const whiteName = ref('Trắng')
const komi = ref(6.5)

function startGame(): void {
  const isBotGame = mode.value === 'bot'
  const botName = botDifficulty.value === 'katago' ? 'KataGo' : 'Bot'
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
  <section class="new-game">
    <div class="page-intro">
      <p class="eyebrow">Thiết lập ván đấu</p>
      <h1>Tạo ván cờ mới</h1>
      <p>Chọn nhịp chơi, kích thước bàn và những người sẽ ngồi xuống cùng bạn.</p>
    </div>
    <form class="setup-card" @submit.prevent="startGame">
      <div class="form-heading">
        <span>01</span>
        <h2>Thông tin ván</h2>
      </div>
      <div class="form-grid">
        <label
          >Chế độ chơi<select v-model="mode">
            <option value="local">Hai người chơi</option>
            <option value="bot">Chơi với bot</option>
          </select></label
        >
        <label
          >Kích thước bàn cờ<select v-model="boardSize">
            <option :value="9">9 × 9</option>
            <option :value="13">13 × 13</option>
            <option :value="19">19 × 19</option>
          </select></label
        >
        <template v-if="mode === 'local'">
          <label>Tên người chơi Đen<input v-model="blackName" maxlength="30" /></label>
          <label>Tên người chơi Trắng<input v-model="whiteName" maxlength="30" /></label>
        </template>
        <template v-else>
          <label
            >Bạn cầm quân<select v-model="humanColor">
              <option value="black">Đen</option>
              <option value="white">Trắng</option>
            </select></label
          >
          <label
            >Độ khó bot<select v-model="botDifficulty">
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
              <option value="katago">KataGo</option>
            </select></label
          >
        </template>
        <label class="komi-field"
          >Komi<input v-model.number="komi" min="0" max="20" step="0.5" type="number"
        /></label>
      </div>
      <div class="form-footer">
        <p>Đen đi trước · Tự động lưu ván đang chơi</p>
        <button type="submit">Bắt đầu ván cờ <span aria-hidden="true">↗</span></button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.new-game {
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
.setup-card {
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: clamp(var(--space-md), 4vw, var(--space-xl));
}
.form-heading {
  align-items: baseline;
  border-bottom: 1px solid var(--color-rule);
  display: flex;
  gap: var(--space-sm);
  padding-bottom: var(--space-md);
}
.form-heading span {
  color: var(--color-accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}
.form-heading h2 {
  margin: 0;
}
.form-grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: var(--space-xl) 0;
}
label {
  color: var(--color-ink-2);
  display: grid;
  font-size: var(--text-sm);
  font-weight: 700;
  gap: var(--space-2xs);
  min-width: 0;
}
input,
select {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-sm);
  color: var(--color-ink);
  min-height: 3rem;
  padding: 0.75rem 0.85rem;
}
input:hover,
select:hover {
  border-color: var(--color-accent);
}
.komi-field {
  max-width: calc(50% - var(--space-2xs));
}
.form-footer {
  align-items: center;
  border-top: 1px solid var(--color-rule);
  display: flex;
  gap: var(--space-md);
  justify-content: space-between;
  padding-top: var(--space-md);
}
.form-footer p {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  margin: 0;
}
button {
  background: var(--color-accent);
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--color-accent-ink);
  cursor: pointer;
  font-weight: 750;
  padding: 0.9rem 1.1rem;
  white-space: nowrap;
}
button:hover {
  background: var(--color-accent-strong);
  transform: translateY(-2px);
}
button span {
  margin-left: 0.55rem;
}
@media (max-width: 38rem) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .komi-field {
    max-width: none;
  }
  .form-footer {
    align-items: stretch;
    flex-direction: column;
  }
  button {
    width: 100%;
  }
}
</style>
