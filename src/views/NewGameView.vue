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
    <p class="eyebrow">Thiết lập ván đấu</p>
    <h1>Tạo ván cờ mới</h1>
    <form @submit.prevent="startGame">
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
      <template v-if="mode === 'local'"
        ><label>Tên người chơi Đen<input v-model="blackName" maxlength="30" /></label
        ><label>Tên người chơi Trắng<input v-model="whiteName" maxlength="30" /></label
      ></template>
      <template v-else
        ><label
          >Bạn cầm quân<select v-model="humanColor">
            <option value="black">Đen</option>
            <option value="white">Trắng</option>
          </select></label
        ><label
          >Độ khó bot<select v-model="botDifficulty">
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
            <option value="katago">KataGo</option>
          </select></label
        ></template
      >
      <label>Komi<input v-model.number="komi" min="0" max="20" step="0.5" type="number" /></label>
      <button type="submit">Bắt đầu ván cờ</button>
    </form>
  </section>
</template>

<style scoped>
.new-game {
  max-width: 36rem;
}
.eyebrow {
  color: #0369a1;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
}
h1 {
  margin: 0.5rem 0 1.5rem;
}
form {
  display: grid;
  gap: 1rem;
}
label {
  color: #334155;
  display: grid;
  font-weight: 650;
  gap: 0.4rem;
}
input,
select {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.7rem;
}
button {
  background: #0369a1;
  border: 0;
  border-radius: 0.5rem;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  margin-top: 0.5rem;
  padding: 0.8rem 1rem;
}
button:hover {
  background: #075985;
}
</style>
