<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import GameControls from '@/components/game/GameControls.vue'
import GameInformation from '@/components/game/GameInformation.vue'
import KataGoAnalysisPanel from '@/components/game/KataGoAnalysisPanel.vue'
import GameResultDialog from '@/components/game/GameResultDialog.vue'
import GoBoard from '@/components/game/GoBoard.vue'
import MoveHistory from '@/components/game/MoveHistory.vue'
import type { BoardPosition } from '@/domain/models/game'
import { exportSgf, importSgf } from '@/services/sgfService'
import { useGameStore } from '@/stores/gameStore'
import { useAudioHaptics } from '@/composables/useAudioHaptics'

const gameStore = useGameStore()
const router = useRouter()
const { triggerHaptic } = useAudioHaptics()

const game = computed(() => gameStore.game)
const lastMove = computed(() => {
  const move = game.value?.moveHistory.at(-1)
  return move?.type === 'play' ? move.position : null
})

const isBotTurn = computed(() => {
  if (!game.value) return false
  return (
    game.value.settings[game.value.currentPlayer === 'black' ? 'blackPlayer' : 'whitePlayer']
      .type === 'bot'
  )
})

const pendingResign = ref(false)
const sgfInput = ref<HTMLInputElement | null>(null)
const mobileActiveTab = ref<'game' | 'history' | 'analysis'>('game')

watch(
  () => [game.value?.moveHistory.length, game.value?.currentPlayer, game.value?.status],
  () => {
    void gameStore.makeBotMove()
  },
  { immediate: true },
)

function play(position: BoardPosition): void {
  gameStore.play(position)
}

function restart(): void {
  void router.push('/new-game')
}

function requestResign(): void {
  triggerHaptic('error')
  pendingResign.value = true
}

function confirmResign(): void {
  gameStore.resign()
  pendingResign.value = false
}

function downloadSgf(): void {
  if (!game.value) return
  const url = URL.createObjectURL(
    new Blob([exportSgf(game.value)], { type: 'application/x-go-sgf' }),
  )
  const link = globalThis.document.createElement('a')
  link.href = url
  link.download = 'co-vay.sgf'
  link.click()
  URL.revokeObjectURL(url)
}

function selectSgf(): void {
  sgfInput.value?.click()
}

async function loadSgf(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    gameStore.loadImportedGame(importSgf(await file.text()))
  } catch (error) {
    gameStore.setMessage(error instanceof Error ? error.message : 'Không thể nhập tệp SGF.')
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <section v-if="game" class="game-view-wrapper">
    <!-- Top Player HUD -->
    <GameInformation :game="game" />

    <!-- iOS Message Banner -->
    <transition name="toast-slide">
      <div v-if="gameStore.message" class="ios-toast" role="alert">
        <span class="toast-dot" />
        <span>{{ gameStore.message }}</span>
      </div>
    </transition>

    <!-- Victory Dialog Modal -->
    <GameResultDialog
      v-if="game.result"
      :result="game.result"
      @restart="restart"
    />

    <!-- Main Board Area & Desktop Sidebar -->
    <div class="game-main-layout">
      <div class="board-column">
        <GoBoard
          :board="game.board"
          :current-player="game.currentPlayer"
          :dead-stones="game.manualDeadStones"
          :ownership="gameStore.kataGoAnalysis?.ownership"
          :last-move="lastMove"
          :scoring-mode="game.status === 'scoring'"
          :disabled="
            (game.status !== 'playing' && game.status !== 'scoring') ||
            gameStore.isBotThinking ||
            isBotTurn
          "
          @play="play"
          @toggle-dead-group="gameStore.toggleDeadGroup"
        />

        <!-- Tactical Controls Dock -->
        <GameControls
          :game="game"
          :interaction-disabled="gameStore.isBotThinking || isBotTurn"
          :kata-go-analyzing="gameStore.isKataGoAnalyzing"
          @pass="gameStore.pass"
          @resign="requestResign"
          @undo="gameStore.undo"
          @redo="gameStore.redo"
          @confirm-score="gameStore.confirmScore"
          @export-sgf="downloadSgf"
          @import-sgf="selectSgf"
          @restart="restart"
          @analyze-katago="gameStore.analyzeWithKataGo"
        />
      </div>

      <!-- Desktop Sidebar -->
      <aside class="desktop-sidebar">
        <MoveHistory :moves="game.moveHistory" />
        <KataGoAnalysisPanel
          v-if="gameStore.kataGoAnalysis"
          :analysis="gameStore.kataGoAnalysis"
        />
      </aside>
    </div>

    <!-- Mobile Secondary Drawer Toggle Pill -->
    <div class="mobile-drawer-tabs">
      <button
        class="tab-btn"
        :class="{ active: mobileActiveTab === 'history' }"
        type="button"
        @click="mobileActiveTab = mobileActiveTab === 'history' ? 'game' : 'history'"
      >
        <span>📜 Lịch sử ({{ game.moveHistory.length }})</span>
      </button>

      <button
        v-if="gameStore.kataGoAnalysis"
        class="tab-btn ai-tab"
        :class="{ active: mobileActiveTab === 'analysis' }"
        type="button"
        @click="mobileActiveTab = mobileActiveTab === 'analysis' ? 'game' : 'analysis'"
      >
        <span>✨ KataGo AI</span>
      </button>
    </div>

    <!-- Mobile Expandable Bottom Sheet for History/Analysis -->
    <div
      v-if="mobileActiveTab !== 'game'"
      class="mobile-bottom-sheet ios-glass"
    >
      <div class="sheet-header">
        <div class="sheet-grabber" aria-hidden="true" />
        <button
          class="sheet-close-btn"
          type="button"
          @click="mobileActiveTab = 'game'"
        >
          ✕
        </button>
      </div>

      <div class="sheet-content">
        <MoveHistory
          v-if="mobileActiveTab === 'history'"
          :moves="game.moveHistory"
        />
        <KataGoAnalysisPanel
          v-if="mobileActiveTab === 'analysis' && gameStore.kataGoAnalysis"
          :analysis="gameStore.kataGoAnalysis"
        />
      </div>
    </div>

    <!-- iOS Style Action Sheet for Resign Confirmation -->
    <div
      v-if="pendingResign"
      class="ios-action-sheet-backdrop"
      role="presentation"
      @click.self="pendingResign = false"
    >
      <div class="ios-action-sheet" role="alertdialog" aria-labelledby="resign-title">
        <div class="action-sheet-content">
          <h3 id="resign-title">Đầu hàng ván cờ?</h3>
          <p>Bạn có chắc muốn đầu hàng và chấp nhận thua ván cờ này?</p>
          <button
            class="action-sheet-btn danger"
            type="button"
            @click="confirmResign"
          >
            Đầu hàng
          </button>
        </div>
        <div class="action-sheet-cancel">
          <button
            class="action-sheet-btn cancel"
            type="button"
            @click="pendingResign = false"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Empty Game State -->
  <section v-else class="empty-state-card ios-card">
    <div class="empty-icon-ring" aria-hidden="true">
      <span class="empty-stone" />
    </div>
    <h2>Chưa có ván cờ</h2>
    <p>Hãy tạo một ván mới để bắt đầu trải nghiệm cờ vây mượt mà.</p>
    <RouterLink class="ios-primary-btn" to="/new-game">
      Tạo ván mới ↗
    </RouterLink>
  </section>

  <!-- Hidden SGF File Input -->
  <input
    ref="sgfInput"
    class="visually-hidden"
    accept=".sgf,application/x-go-sgf,text/plain"
    type="file"
    @change="loadSgf"
  />
</template>

<style scoped>
.game-view-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  width: 100%;
  position: relative;
}

/* iOS Dynamic Toast Banner */
.ios-toast {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--ios-warning);
  color: var(--color-warning-ink);
  padding: 0.45rem 1rem;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
  border: 1px solid rgba(255, 149, 0, 0.35);
  box-shadow: var(--shadow-subtle);
}

.toast-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--ios-warning);
}

/* Layout */
.game-main-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 21rem);
  gap: var(--space-md);
  align-items: start;
}

.board-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-width: 0;
}

.desktop-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-width: 0;
}

/* Mobile Drawer Tabs */
.mobile-drawer-tabs {
  display: none;
  justify-content: center;
  gap: var(--space-xs);
  margin-top: 0.2rem;
}

.tab-btn {
  background: var(--ios-bg-secondary);
  border: 1px solid var(--ios-border);
  border-radius: var(--radius-pill);
  padding: 0.45rem 1rem;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--ios-secondary-label);
}

.tab-btn.active {
  background: var(--ios-tint);
  color: #ffffff;
  border-color: var(--ios-tint);
}

.tab-btn.ai-tab.active {
  background: var(--ios-accent);
  border-color: var(--ios-accent);
}

/* Mobile Bottom Sheet */
.mobile-bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  background: var(--glass-bg);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border-top: 1px solid var(--glass-border);
  box-shadow: var(--shadow-modal);
  padding: 0.8rem 1rem 2rem;
  z-index: 900;
  max-height: 60vh;
  overflow-y: auto;
  animation: sheet-up 280ms var(--ease-spring) both;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  position: relative;
}

.sheet-grabber {
  width: 2.5rem;
  height: 0.25rem;
  background: var(--ios-quaternary-label);
  border-radius: var(--radius-pill);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.sheet-close-btn {
  margin-left: auto;
  background: rgba(125, 125, 125, 0.15);
  border: none;
  border-radius: 50%;
  width: 1.8rem;
  height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ios-label);
  font-size: 0.8rem;
  font-weight: 700;
}

/* iOS Action Sheet for Resign */
.ios-action-sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--space-sm);
  z-index: 1000;
  animation: fade-in 200ms var(--ease-ios) both;
}

.ios-action-sheet {
  width: 100%;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  animation: sheet-spring 300ms var(--ease-spring) both;
}

.action-sheet-content {
  background: var(--ios-card-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1rem 0.5rem;
  text-align: center;
  border: 1px solid var(--ios-border);
}

.action-sheet-content h3 {
  font-size: var(--text-md);
  margin-bottom: 0.3rem;
}

.action-sheet-content p {
  font-size: var(--text-xs);
  color: var(--ios-secondary-label);
  margin-bottom: 1rem;
}

.action-sheet-cancel {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.action-sheet-btn {
  width: 100%;
  padding: 0.85rem;
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  font-weight: 700;
  border: none;
  background: rgba(125, 125, 125, 0.08);
}

.action-sheet-btn.danger {
  color: var(--ios-danger);
  border-top: 1px solid var(--ios-separator);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.action-sheet-btn.cancel {
  background: var(--ios-card-solid);
  color: var(--ios-tint);
  border-radius: var(--radius-md);
}

/* Empty State */
.empty-state-card {
  max-width: 28rem;
  margin: 4rem auto;
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-pill);
  background: var(--ios-tint);
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
  margin-top: 0.5rem;
}

.visually-hidden {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* Animations */
@keyframes sheet-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes sheet-spring {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive */
@media (max-width: 58rem) {
  .game-main-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .desktop-sidebar {
    display: none;
  }
  .mobile-drawer-tabs {
    display: flex;
  }
}
</style>
