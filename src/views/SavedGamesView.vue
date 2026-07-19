<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteSavedGame, getSavedGames, type StoredGame } from '@/services/gameStorageService'
import { useGameStore } from '@/stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()
const games = ref<StoredGame[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadGames(): Promise<void> {
  try {
    games.value = await getSavedGames()
  } catch {
    error.value = 'Không thể đọc các ván cờ đã lưu.'
  } finally {
    loading.value = false
  }
}
function resume(game: StoredGame): void {
  gameStore.restoreGame(game)
  void router.push('/game')
}
async function remove(game: StoredGame): Promise<void> {
  if (
    !globalThis.confirm(
      `Xóa ván cờ của ${game.state.settings.blackPlayer.name} và ${game.state.settings.whitePlayer.name}?`,
    )
  )
    return
  await deleteSavedGame(game.id)
  games.value = games.value.filter((item) => item.id !== game.id)
}
onMounted(() => {
  void loadGames()
})
</script>

<template>
  <section>
    <h1>Ván đã lưu</h1>
    <p v-if="loading">Đang tải…</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <p v-else-if="games.length === 0">Chưa có ván cờ nào được lưu trên thiết bị này.</p>
    <ul v-else class="saved-games">
      <li v-for="game in games" :key="game.id">
        <div>
          <strong
            >{{ game.state.settings.blackPlayer.name }} vs
            {{ game.state.settings.whitePlayer.name }}</strong
          ><span
            >{{ game.state.settings.boardSize }}×{{ game.state.settings.boardSize }} ·
            {{ new Date(game.updatedAt).toLocaleString('vi-VN') }}</span
          >
        </div>
        <div>
          <button type="button" @click="resume(game)">Mở</button
          ><button type="button" @click="remove(game)">Xóa</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.saved-games {
  display: grid;
  gap: 0.75rem;
  list-style: none;
  margin: 1.5rem 0;
  max-width: 48rem;
  padding: 0;
}
.saved-games li {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
}
.saved-games strong,
.saved-games span {
  display: block;
}
.saved-games span {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.saved-games button {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-left: 0.5rem;
  padding: 0.5rem 0.7rem;
}
@media (max-width: 32rem) {
  .saved-games li {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.75rem;
  }
  .saved-games button {
    margin-left: 0;
    margin-right: 0.5rem;
  }
}
</style>
