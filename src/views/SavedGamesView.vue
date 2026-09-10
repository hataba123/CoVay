<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteSavedGame, getSavedGames, type StoredGame } from '@/services/gameStorageService'
import { useGameStore } from '@/stores/gameStore'
import { useAudioHaptics } from '@/composables/useAudioHaptics'

const router = useRouter()
const gameStore = useGameStore()
const { playTapSound, triggerHaptic } = useAudioHaptics()

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
  playTapSound()
  triggerHaptic('light')
  gameStore.restoreGame(game)
  void router.push('/game')
}

async function remove(game: StoredGame): Promise<void> {
  triggerHaptic('error')
  if (
    !globalThis.confirm(
      `Xóa ván cờ của ${game.state.settings.blackPlayer.name} và ${game.state.settings.whitePlayer.name}?`,
    )
  )
    return
  await deleteSavedGame(game.id)
  games.value = games.value.filter((item) => item.id !== game.id)
  triggerHaptic('medium')
}

onMounted(() => {
  void loadGames()
})
</script>

<template>
  <section class="saved-page-container">
    <div class="page-intro">
      <p class="eyebrow">THƯ VIỆN CÁ NHÂN</p>
      <h1>Ván cờ đã lưu</h1>
      <p class="intro-sub">Các ván đấu được lưu trữ an toàn ngay trên thiết bị của bạn.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-notice">
      <span class="spinner" aria-hidden="true" />
      <p>Đang tải thư viện ván cờ…</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-notice error" role="alert">
      <p>{{ error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="games.length === 0" class="empty-state ios-card">
      <div class="empty-icon-ring">
        <span class="empty-stone" />
      </div>
      <h2>Chưa có ván cờ nào</h2>
      <p>Bắt đầu một ván cờ mới, các nước đi sẽ được tự động lưu ở đây.</p>
      <RouterLink class="ios-primary-btn" to="/new-game" @click="playTapSound">
        Tạo ván mới ↗
      </RouterLink>
    </div>

    <!-- Saved Games List -->
    <div v-else class="games-grid">
      <div v-for="game in games" :key="game.id" class="game-card ios-card">
        <div class="card-main" @click="resume(game)">
          <div class="card-top">
            <span class="size-badge">
              {{ game.state.settings.boardSize }} × {{ game.state.settings.boardSize }}
            </span>
            <span class="date-badge">
              {{
                new Date(game.updatedAt).toLocaleDateString('vi-VN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </span>
          </div>

          <div class="players-row">
            <div class="player-entry">
              <span class="stone-icon black" />
              <strong class="p-name">{{ game.state.settings.blackPlayer.name }}</strong>
            </div>
            <span class="vs-text">vs</span>
            <div class="player-entry">
              <span class="stone-icon white" />
              <strong class="p-name">{{ game.state.settings.whitePlayer.name }}</strong>
            </div>
          </div>

          <div class="card-meta">
            <span>{{ game.state.moveHistory.length }} nước đi</span>
            <span class="meta-dot">·</span>
            <span>
              {{
                game.state.status === 'playing'
                  ? 'Đang chơi'
                  : game.state.status === 'scoring'
                    ? 'Đang đếm'
                    : 'Đã xong'
              }}
            </span>
          </div>
        </div>

        <div class="card-actions">
          <button class="open-btn" type="button" @click="resume(game)">Tiếp tục ↗</button>
          <button class="delete-btn" type="button" title="Xóa ván này" @click="remove(game)">
            Xóa
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.saved-page-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  max-width: 48rem;
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

/* State Notices */
.state-notice {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--ios-secondary-label);
  padding: 2rem 0;
}

.state-notice.error {
  color: var(--ios-danger);
}

.spinner {
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid var(--ios-border);
  border-top-color: var(--ios-tint);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3.5rem 1.5rem;
  text-align: center;
  gap: 0.6rem;
}

.empty-icon-ring {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(125, 125, 125, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.empty-stone {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #1c1c1e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.ios-primary-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-pill);
  background: var(--ios-tint);
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
  margin-top: 0.5rem;
  box-shadow: 0 4px 14px var(--ios-tint-glow);
}

/* Games Grid */
.games-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.game-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  gap: var(--space-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition:
    transform var(--dur-instant) var(--ease-spring),
    box-shadow var(--dur-short) var(--ease-ios);
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.card-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.size-badge {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--ios-tint);
  background: rgba(0, 122, 255, 0.1);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-pill);
}

.date-badge {
  font-size: 0.72rem;
  color: var(--ios-tertiary-label);
}

.players-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.player-entry {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
}

.stone-icon {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.stone-icon.black {
  background: #1c1c1e;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.stone-icon.white {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.p-name {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--ios-label);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vs-text {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ios-tertiary-label);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-family: var(--font-mono);
  color: var(--ios-secondary-label);
}

.meta-dot {
  color: var(--ios-quaternary-label);
}

/* Actions */
.card-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.open-btn {
  padding: 0.55rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--ios-tint);
  color: #ffffff;
  font-size: var(--text-xs);
  font-weight: 700;
  border: none;
  box-shadow: 0 2px 8px var(--ios-tint-glow);
}

.delete-btn {
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--ios-danger);
  font-size: var(--text-xs);
  font-weight: 600;
  border: 1px solid rgba(255, 59, 48, 0.25);
}

.delete-btn:hover {
  background: rgba(255, 59, 48, 0.08);
}

@media (max-width: 34rem) {
  .game-card {
    flex-direction: column;
    align-items: stretch;
  }
  .card-actions {
    justify-content: flex-end;
    margin-top: 0.35rem;
  }
}
</style>
