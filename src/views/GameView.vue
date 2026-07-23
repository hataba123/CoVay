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

const gameStore = useGameStore()
const router = useRouter()
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
  <section v-if="game" class="game-view">
    <GameInformation :game="game" />
    <p v-if="gameStore.message" class="message" role="alert">{{ gameStore.message }}</p>
    <GameResultDialog v-if="game.result" :result="game.result" />
    <div class="game-layout">
      <div class="board-area">
        <div class="board-heading">
          <span class="board-label"
            >{{ game.settings.boardSize }} × {{ game.settings.boardSize }} · VÁN ĐẤU</span
          ><span class="board-status" :class="{ active: game.status === 'playing' }">{{
            game.status === 'playing'
              ? 'Đang chơi'
              : game.status === 'scoring'
                ? 'Đang tính điểm'
                : 'Đã kết thúc'
          }}</span>
        </div>
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
      <aside class="game-sidebar">
        <MoveHistory :moves="game.moveHistory" />
        <KataGoAnalysisPanel v-if="gameStore.kataGoAnalysis" :analysis="gameStore.kataGoAnalysis" />
      </aside>
    </div>
    <div v-if="pendingResign" class="modal-backdrop" role="presentation">
      <section class="confirmation" aria-modal="true" role="dialog" aria-labelledby="resign-title">
        <p class="modal-eyebrow">Xác nhận hành động</p>
        <h2 id="resign-title">Đầu hàng ván cờ?</h2>
        <p>Bạn có chắc muốn kết thúc ván cờ này?</p>
        <div>
          <button type="button" @click="pendingResign = false">Hủy</button
          ><button class="danger" type="button" @click="confirmResign">Đầu hàng</button>
        </div>
      </section>
    </div>
  </section>
  <section v-else class="empty-game">
    <span class="empty-stone" aria-hidden="true" />
    <h1>Chưa có ván cờ</h1>
    <p>Hãy tạo một ván mới để bắt đầu chơi.</p>
    <RouterLink to="/new-game">Tạo ván mới <span aria-hidden="true">↗</span></RouterLink>
  </section>
  <input
    ref="sgfInput"
    class="visually-hidden"
    accept=".sgf,application/x-go-sgf,text/plain"
    type="file"
    @change="loadSgf"
  />
</template>

<style scoped>
.game-view {
  display: grid;
  gap: var(--space-md);
}
.game-layout {
  align-items: start;
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: minmax(0, 1fr) minmax(17rem, 20rem);
}
.board-area {
  display: grid;
  gap: var(--space-sm);
  min-width: 0;
}
.board-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
.board-label,
.board-status {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.board-status.active {
  color: var(--color-success);
}
.game-sidebar {
  display: grid;
  gap: var(--space-sm);
}
.message {
  background: var(--color-warning);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-warning-ink);
  margin: 0;
  padding: var(--space-sm);
}
.modal-backdrop {
  align-items: center;
  background: var(--color-overlay);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: var(--space-md);
  position: fixed;
  z-index: 10;
}
.confirmation {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lifted);
  max-width: 28rem;
  padding: var(--space-xl);
  width: 100%;
}
.modal-eyebrow {
  color: var(--color-accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  margin: 0 0 var(--space-sm);
  text-transform: uppercase;
}
.confirmation h2 {
  margin: 0;
}
.confirmation > p:not(.modal-eyebrow) {
  color: var(--color-ink-2);
  line-height: 1.5;
}
.confirmation div {
  display: flex;
  gap: var(--space-xs);
  justify-content: flex-end;
  margin-top: var(--space-lg);
}
.confirmation button,
.empty-game a {
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-sm);
  color: var(--color-ink-2);
  cursor: pointer;
  font-weight: 700;
  padding: 0.7rem 0.9rem;
  text-decoration: none;
}
.confirmation button:hover,
.empty-game a:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
}
.confirmation .danger {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: var(--color-accent-ink);
}
.empty-game {
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: var(--space-3xl) var(--space-md);
  text-align: center;
}
.empty-game .empty-stone {
  background: var(--color-stone-black);
  border-radius: 50%;
  height: 3rem;
  width: 3rem;
}
.empty-game h1 {
  margin: var(--space-md) 0 0;
}
.empty-game p {
  color: var(--color-muted);
}
.empty-game a {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-accent-ink);
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
@media (max-width: 58rem) {
  .game-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .board-area :deep(.board-frame) {
    margin-inline: auto;
  }
}
@media (max-width: 34rem) {
  .board-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-2xs);
  }
}
</style>
