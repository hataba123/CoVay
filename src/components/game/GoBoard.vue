<script setup lang="ts">
import { computed } from 'vue'
import type { Board, BoardPosition } from '@/domain/models/game'

const props = defineProps<{
  board: Board
  lastMove: BoardPosition | null
  currentPlayer?: 'black' | 'white'
  deadStones?: BoardPosition[]
  ownership?: number[]
  scoringMode?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  play: [position: BoardPosition]
  toggleDeadGroup: [position: BoardPosition]
}>()

const boardSize = computed(() => props.board.length)
const starPoints = computed(() => {
  const offset = boardSize.value === 9 ? 2 : 3
  const middle = Math.floor(boardSize.value / 2)
  const positions =
    boardSize.value === 9
      ? [offset, boardSize.value - offset - 1]
      : [offset, middle, boardSize.value - offset - 1]
  return positions.flatMap((row) => positions.map((column) => ({ row, column })))
})
const deadStoneKeys = computed(
  () => new Set((props.deadStones ?? []).map((position) => `${position.row}:${position.column}`)),
)
const ownershipPoints = computed(() => {
  if (props.ownership?.length !== boardSize.value * boardSize.value) return []
  return props.ownership.map((value, index) => ({
    column: index % boardSize.value,
    row: Math.floor(index / boardSize.value),
    value,
  }))
})

function isLastMove(row: number, column: number): boolean {
  return props.lastMove?.row === row && props.lastMove.column === column
}

function isDeadStone(row: number, column: number): boolean {
  return deadStoneKeys.value.has(`${row}:${column}`)
}

function selectPosition(row: number, column: number): void {
  if (props.disabled) return
  const position = { row, column }
  if (props.scoringMode && props.board[row][column] !== null) {
    emit('toggleDeadGroup', position)
  } else if (!props.scoringMode && props.board[row][column] === null) {
    emit('play', position)
  }
}
</script>

<template>
  <div class="board-frame" :class="{ 'is-disabled': disabled }">
    <svg
      class="go-board"
      :viewBox="`-0.6 -0.6 ${boardSize + 0.2} ${boardSize + 0.2}`"
      role="grid"
      aria-label="Bàn cờ vây"
    >
      <defs>
        <linearGradient id="board-grain" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#f1dfaa" />
          <stop offset="48%" stop-color="#ddc27f" />
          <stop offset="100%" stop-color="#bd8d4a" />
        </linearGradient>
        <radialGradient id="black-stone" cx="30%" cy="24%" r="76%">
          <stop offset="0%" stop-color="#617263" />
          <stop offset="34%" stop-color="#26352a" />
          <stop offset="100%" stop-color="#0b160f" />
        </radialGradient>
        <radialGradient id="white-stone" cx="30%" cy="24%" r="76%">
          <stop offset="0%" stop-color="#fffef8" />
          <stop offset="68%" stop-color="#f5f0dd" />
          <stop offset="100%" stop-color="#d8d1b9" />
        </radialGradient>
      </defs>
      <rect
        class="board-surface"
        x="-0.6"
        y="-0.6"
        :width="boardSize + 0.2"
        :height="boardSize + 0.2"
        rx="0.12"
      />
      <rect
        class="board-inset"
        x="-0.49"
        y="-0.49"
        :width="boardSize - 0.02"
        :height="boardSize - 0.02"
        rx="0.06"
      />
      <g class="grid-lines">
        <line
          v-for="index in boardSize"
          :key="`horizontal-${index}`"
          x1="0"
          :x2="boardSize - 1"
          :y1="index - 1"
          :y2="index - 1"
        />
        <line
          v-for="index in boardSize"
          :key="`vertical-${index}`"
          y1="0"
          :y2="boardSize - 1"
          :x1="index - 1"
          :x2="index - 1"
        />
      </g>
      <circle
        v-for="point in starPoints"
        :key="`star-${point.row}-${point.column}`"
        class="star"
        :cx="point.column"
        :cy="point.row"
        r="0.09"
      />
      <circle
        v-for="point in ownershipPoints"
        :key="`ownership-${point.row}-${point.column}`"
        class="ownership"
        :class="point.value >= 0 ? 'black-ownership' : 'white-ownership'"
        :cx="point.column"
        :cy="point.row"
        :fill-opacity="Math.abs(point.value) * 0.58"
        r="0.34"
      />
      <g v-for="(row, rowIndex) in board" :key="rowIndex" role="row">
        <g
          v-for="(stone, columnIndex) in row"
          :key="`${rowIndex}-${columnIndex}`"
          class="intersection"
          :class="{
            selectable:
              (stone === null && !scoringMode && !disabled) || (stone && scoringMode && !disabled),
          }"
          role="gridcell"
          :aria-label="`Hàng ${rowIndex + 1}, cột ${columnIndex + 1}${stone ? `, quân ${stone === 'black' ? 'đen' : 'trắng'}${isDeadStone(rowIndex, columnIndex) ? ', đã đánh dấu chết' : ''}` : ''}`"
          :tabindex="
            ((stone === null && !scoringMode) || (stone && scoringMode)) && !disabled ? 0 : -1
          "
          @click="selectPosition(rowIndex, columnIndex)"
          @keydown.enter.prevent="selectPosition(rowIndex, columnIndex)"
          @keydown.space.prevent="selectPosition(rowIndex, columnIndex)"
        >
          <circle
            v-if="stone"
            :class="['stone', stone, { 'is-new': isLastMove(rowIndex, columnIndex) }]"
            :cx="columnIndex"
            :cy="rowIndex"
            r="0.43"
          />
          <circle
            v-if="stone && isDeadStone(rowIndex, columnIndex)"
            class="dead-stone"
            :cx="columnIndex"
            :cy="rowIndex"
            r="0.28"
          />
          <circle
            v-if="isLastMove(rowIndex, columnIndex)"
            class="last-move"
            :cx="columnIndex"
            :cy="rowIndex"
            r="0.1"
          />
          <circle
            v-if="stone === null"
            :class="['hover-target', `preview-${currentPlayer ?? 'black'}`]"
            :cx="columnIndex"
            :cy="rowIndex"
            r="0.39"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.board-frame {
  background:
    linear-gradient(135deg, rgb(237 244 202 / 22%), transparent 38%),
    repeating-linear-gradient(90deg, rgb(38 67 37 / 18%) 0 1px, transparent 1px 13px), #5d7149;
  border: 0.7rem solid #40583a;
  border-radius: 0.9rem;
  box-shadow:
    0 0.2rem 0.25rem rgb(26 49 31 / 18%),
    0 1.1rem 2rem rgb(26 49 31 / 24%),
    inset 0 1px rgb(244 248 215 / 32%);
  max-width: min(100%, 44rem);
  padding: 0.3rem;
  transition:
    box-shadow 180ms ease,
    transform 180ms ease;
}
.board-frame:not(.is-disabled):hover {
  box-shadow:
    0 0.3rem 0.4rem rgb(26 49 31 / 18%),
    0 1.35rem 2.25rem rgb(26 49 31 / 28%),
    inset 0 1px rgb(244 248 215 / 32%);
  transform: translateY(-2px);
}
.go-board {
  display: block;
  height: auto;
  width: 100%;
}
.board-surface {
  fill: url(#board-grain);
}
.board-inset {
  fill: none;
  pointer-events: none;
  stroke: rgb(79 91 49 / 48%);
  stroke-width: 0.03;
}
.grid-lines line {
  stroke: #5a482c;
  stroke-width: 0.032;
}
.star {
  fill: #4d442d;
}
.ownership {
  pointer-events: none;
}
.ownership.black-ownership {
  fill: #1a3525;
}
.ownership.white-ownership {
  fill: #fffdf4;
  stroke: #39715c;
  stroke-width: 0.025;
}
.intersection {
  outline: none;
}
.intersection.selectable {
  cursor: pointer;
}
.hover-target {
  fill: transparent;
  stroke: transparent;
  stroke-width: 0.035;
  transition:
    fill 130ms ease,
    stroke 130ms ease,
    r 130ms ease;
}
.intersection.selectable:hover .hover-target,
.intersection.selectable:focus .hover-target {
  r: 0.355;
  stroke: rgb(247 244 211 / 86%);
}
.intersection.selectable:hover .hover-target.preview-black,
.intersection.selectable:focus .hover-target.preview-black {
  fill: rgb(26 53 37 / 34%);
}
.intersection.selectable:hover .hover-target.preview-white,
.intersection.selectable:focus .hover-target.preview-white {
  fill: rgb(255 253 244 / 78%);
  stroke: rgb(57 113 92 / 58%);
}
.intersection.selectable:focus .hover-target {
  stroke-width: 0.055;
}
.stone {
  filter: drop-shadow(0.045rem 0.075rem 0.055rem rgb(26 49 31 / 44%));
  transform-box: fill-box;
  transform-origin: center;
}
.stone.black {
  fill: url(#black-stone);
}
.stone.white {
  fill: url(#white-stone);
  stroke: #cec5aa;
  stroke-width: 0.035;
}
.stone.is-new {
  animation: place-stone 220ms cubic-bezier(0.22, 1.28, 0.36, 1) both;
}
.dead-stone {
  fill: none;
  pointer-events: none;
  stroke: #b84d36;
  stroke-width: 0.08;
}
.last-move {
  fill: #c8662e;
  stroke: #fff8df;
  stroke-width: 0.03;
  pointer-events: none;
  animation: last-move-pulse 1.8s ease-in-out infinite;
}
.is-disabled {
  opacity: 0.72;
}
@keyframes place-stone {
  from {
    opacity: 0;
    transform: scale(0.62);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes last-move-pulse {
  50% {
    r: 0.13;
  }
}
@media (prefers-reduced-motion: reduce) {
  .board-frame,
  .hover-target,
  .stone.is-new,
  .last-move {
    animation: none;
    transition: none;
  }
  .board-frame:not(.is-disabled):hover {
    transform: none;
  }
}
</style>
