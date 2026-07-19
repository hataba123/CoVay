<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { BoardSize, GameSettings } from '@/domain/models/game'
import { useGameStore } from '@/stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()
const boardSize = ref<BoardSize>(9)
const blackName = ref('Đen')
const whiteName = ref('Trắng')
const komi = ref(6.5)

function startGame(): void {
  const settings: GameSettings = {
    boardSize: boardSize.value,
    komi: komi.value,
    mode: 'local',
    blackPlayer: { name: blackName.value.trim() || 'Đen', color: 'black', type: 'human' },
    whitePlayer: { name: whiteName.value.trim() || 'Trắng', color: 'white', type: 'human' },
  }
  gameStore.startGame(settings)
  void router.push('/game')
}
</script>

<template>
  <section class="new-game">
    <p class="eyebrow">Chơi cùng nhau</p>
    <h1>Tạo ván cờ địa phương</h1>
    <form @submit.prevent="startGame">
      <label
        >Kích thước bàn cờ<select v-model="boardSize">
          <option :value="9">9 × 9</option>
          <option :value="13">13 × 13</option>
          <option :value="19">19 × 19</option>
        </select></label
      ><label>Tên người chơi Đen<input v-model="blackName" maxlength="30" /></label
      ><label>Tên người chơi Trắng<input v-model="whiteName" maxlength="30" /></label
      ><label>Komi<input v-model.number="komi" min="0" max="20" step="0.5" type="number" /></label
      ><button type="submit">Bắt đầu ván cờ</button>
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
