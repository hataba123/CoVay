<script setup lang="ts">
import { computed } from 'vue'
import type { Board, BoardPosition } from '@/domain/models/game'

const props = defineProps<{
  board: Board
  lastMove: BoardPosition | null
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
      <rect x="-0.6" y="-0.6" :width="boardSize + 0.2" :height="boardSize + 0.2" rx="0.12" />
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
            :class="['stone', stone]"
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
            class="hover-target"
            :cx="columnIndex"
            :cy="rowIndex"
            r="0.39"
            @click="selectPosition(rowIndex, columnIndex)"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.board-frame {
  background: #c98c3b;
  border: 0.75rem solid #8b5a2b;
  border-radius: 0.75rem;
  box-shadow: 0 0.75rem 1.5rem rgb(15 23 42 / 18%);
  max-width: min(100%, 44rem);
  padding: 0.25rem;
}
.go-board {
  display: block;
  height: auto;
  width: 100%;
}
rect {
  fill: #dba755;
}
.grid-lines line {
  stroke: #4a2f13;
  stroke-width: 0.035;
}
.star {
  fill: #3e2710;
}
.ownership {
  pointer-events: none;
}
.ownership.black-ownership {
  fill: #0f172a;
}
.ownership.white-ownership {
  fill: #f8fafc;
  stroke: #2563eb;
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
  transition: fill 120ms ease;
}
.intersection.selectable:hover .hover-target,
.intersection.selectable:focus .hover-target {
  fill: rgb(255 255 255 / 28%);
}
.stone {
  filter: drop-shadow(0.04rem 0.06rem 0.05rem rgb(15 23 42 / 40%));
}
.stone.black {
  fill: #111827;
}
.stone.white {
  fill: #f8fafc;
  stroke: #cbd5e1;
  stroke-width: 0.035;
}
.dead-stone {
  fill: none;
  pointer-events: none;
  stroke: #ef4444;
  stroke-width: 0.08;
}
.last-move {
  fill: #ef4444;
  stroke: #fff;
  stroke-width: 0.025;
  pointer-events: none;
}
.is-disabled {
  opacity: 0.72;
}
</style>
