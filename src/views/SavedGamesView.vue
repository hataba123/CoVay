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
  <section class="saved-page">
    <div class="page-intro">
      <p class="eyebrow">Thư viện cá nhân</p>
      <h1>Ván đã lưu</h1>
      <p>Những ván cờ đang chờ bạn quay lại, ngay trên thiết bị này.</p>
    </div>
    <p v-if="loading" class="status-copy">Đang tải…</p>
    <p v-else-if="error" class="status-copy error" role="alert">{{ error }}</p>
    <div v-else-if="games.length === 0" class="empty-state">
      <span class="empty-stone" aria-hidden="true" />
      <h2>Chưa có ván cờ nào</h2>
      <p>Bắt đầu một ván mới, rồi những nước đi của bạn sẽ xuất hiện ở đây.</p>
      <RouterLink to="/new-game">Tạo ván mới <span aria-hidden="true">↗</span></RouterLink>
    </div>
    <ul v-else class="saved-games">
      <li v-for="(game, index) in games" :key="game.id">
        <div class="game-index">{{ String(index + 1).padStart(2, '0') }}</div>
        <div class="game-meta">
          <strong
            >{{ game.state.settings.blackPlayer.name }} <span>vs</span>
            {{ game.state.settings.whitePlayer.name }}</strong
          >
          <span
            >{{ game.state.settings.boardSize }} × {{ game.state.settings.boardSize }} ·
            {{ new Date(game.updatedAt).toLocaleString('vi-VN') }}</span
          >
        </div>
        <div class="game-actions">
          <button class="open" type="button" @click="resume(game)">
            Mở ván <span aria-hidden="true">↗</span></button
          ><button class="delete" type="button" @click="remove(game)">Xóa</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.saved-page {
  display: grid;
  gap: var(--space-xl);
  max-width: 64rem;
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
.status-copy {
  color: var(--color-muted);
}
.status-copy.error {
  color: var(--color-danger);
}
.saved-games {
  display: grid;
  gap: var(--space-2xs);
  list-style: none;
  margin: 0;
  padding: 0;
}
.saved-games li {
  align-items: center;
  border-bottom: 1px solid var(--color-rule);
  display: grid;
  gap: var(--space-md);
  grid-template-columns: 2.5rem minmax(0, 1fr) auto;
  padding: var(--space-md) 0;
}
.saved-games li:first-child {
  border-top: 1px solid var(--color-rule);
}
.game-index {
  color: var(--color-accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}
.game-meta {
  display: grid;
  gap: var(--space-3xs);
  min-width: 0;
}
.game-meta strong {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  overflow-wrap: anywhere;
}
.game-meta strong span {
  color: var(--color-muted);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
}
.game-meta > span {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}
.game-actions {
  align-items: center;
  display: flex;
  gap: var(--space-xs);
}
button,
.empty-state a {
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 700;
  padding: 0.65rem 0.8rem;
  text-decoration: none;
}
.open,
.empty-state a {
  background: var(--color-accent);
  border: 1px solid var(--color-accent);
  color: var(--color-accent-ink);
}
.open:hover,
.empty-state a:hover {
  background: var(--color-accent-strong);
  transform: translateY(-1px);
}
.delete {
  background: transparent;
  border: 1px solid var(--color-rule);
  color: var(--color-ink-2);
}
.delete:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
.empty-state {
  align-items: center;
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  padding: clamp(var(--space-xl), 8vw, var(--space-3xl)) var(--space-md);
  text-align: center;
}
.empty-stone {
  background: var(--color-stone-black);
  border-radius: 50%;
  box-shadow: var(--shadow-stone-soft);
  height: 3rem;
  margin-bottom: var(--space-md);
  width: 3rem;
}
.empty-state h2 {
  margin: 0;
}
.empty-state p {
  color: var(--color-muted);
  margin: var(--space-2xs) 0 var(--space-md);
}
@media (max-width: 40rem) {
  .saved-games li {
    align-items: start;
    grid-template-columns: 2rem minmax(0, 1fr);
  }
  .game-actions {
    grid-column: 2;
  }
}
</style>
