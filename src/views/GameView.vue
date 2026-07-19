<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import GameControls from '@/components/game/GameControls.vue'
import GameInformation from '@/components/game/GameInformation.vue'
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
        <GoBoard
          :board="game.board"
          :dead-stones="game.manualDeadStones"
          :last-move="lastMove"
          :scoring-mode="game.status === 'scoring'"
          :disabled="
            (game.status !== 'playing' && game.status !== 'scoring') ||
            gameStore.isBotThinking ||
            isBotTurn
          "
          @play="play"
          @toggle-dead-group="gameStore.toggleDeadGroup"
        /><GameControls
          :game="game"
          :interaction-disabled="gameStore.isBotThinking || isBotTurn"
          @pass="gameStore.pass"
          @resign="requestResign"
          @undo="gameStore.undo"
          @redo="gameStore.redo"
          @confirm-score="gameStore.confirmScore"
          @export-sgf="downloadSgf"
          @import-sgf="selectSgf"
          @restart="restart"
        />
      </div>
      <MoveHistory :moves="game.moveHistory" />
    </div>
    <div v-if="pendingResign" class="modal-backdrop" role="presentation">
      <section class="confirmation" aria-modal="true" role="dialog" aria-labelledby="resign-title">
        <h2 id="resign-title">Xác nhận đầu hàng</h2>
        <p>Bạn có chắc muốn kết thúc ván cờ này?</p>
        <div>
          <button type="button" @click="pendingResign = false">Hủy</button
          ><button class="danger" type="button" @click="confirmResign">Đầu hàng</button>
        </div>
      </section>
    </div>
  </section>
  <section v-else class="empty-game">
    <h1>Chưa có ván cờ</h1>
    <p>Hãy tạo một ván mới để bắt đầu chơi.</p>
    <RouterLink to="/new-game">Tạo ván mới</RouterLink>
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
  gap: 1rem;
}
.game-layout {
  align-items: start;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 20rem);
}
.board-area {
  display: grid;
  gap: 1rem;
}
.message {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 0.5rem;
  color: #92400e;
  margin: 0;
  padding: 0.75rem;
}
.modal-backdrop {
  align-items: center;
  background: rgb(15 23 42 / 55%);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 1rem;
  position: fixed;
  z-index: 10;
}
.confirmation {
  background: #fff;
  border-radius: 0.75rem;
  max-width: 28rem;
  padding: 1.5rem;
}
.confirmation h2 {
  margin-top: 0;
}
.confirmation div {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
.confirmation button,
.empty-game a {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  cursor: pointer;
  padding: 0.6rem 0.8rem;
  text-decoration: none;
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
.confirmation .danger {
  background: #b91c1c;
  border-color: #b91c1c;
  color: #fff;
}
.empty-game {
  text-align: center;
}
.empty-game a {
  background: #0369a1;
  border-color: #0369a1;
  color: #fff;
  display: inline-block;
  font-weight: 700;
}
@media (max-width: 58rem) {
  .game-layout {
    grid-template-columns: 1fr;
  }
  .board-area :deep(.board-frame) {
    margin-inline: auto;
  }
}
</style>
