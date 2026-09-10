<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Board, BoardPosition } from '@/domain/models/game'
import { useAudioHaptics } from '@/composables/useAudioHaptics'
import { useSettingsStore } from '@/stores/settingsStore'

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

const { playStoneSound, playCaptureSound, triggerHaptic } = useAudioHaptics()
const settingsStore = useSettingsStore()

const boardSize = computed(() => props.board.length)

// Star points (Hoshi) based on board size
const starPoints = computed(() => {
  const size = boardSize.value
  if (size === 9) {
    return [
      { row: 2, column: 2 },
      { row: 2, column: 6 },
      { row: 4, column: 4 },
      { row: 6, column: 2 },
      { row: 6, column: 6 },
    ]
  }
  if (size === 13) {
    return [
      { row: 3, column: 3 },
      { row: 3, column: 9 },
      { row: 6, column: 6 },
      { row: 9, column: 3 },
      { row: 9, column: 9 },
    ]
  }
  if (size === 19) {
    const coords = [3, 9, 15]
    return coords.flatMap((row) => coords.map((column) => ({ row, column })))
  }
  return []
})

const deadStoneKeys = computed(
  () => new Set((props.deadStones ?? []).map((p) => `${p.row}:${p.column}`)),
)

const ownershipPoints = computed(() => {
  if (props.ownership?.length !== boardSize.value * boardSize.value) return []
  return props.ownership.map((value, index) => ({
    column: index % boardSize.value,
    row: Math.floor(index / boardSize.value),
    value,
  }))
})

// Coordinate labels (A-T omitting I)
const COLUMN_LETTERS = 'ABCDEFGHJKLMNOPQRST'
const columnLabels = computed(() =>
  Array.from({ length: boardSize.value }, (_, i) => COLUMN_LETTERS[i]),
)
const rowLabels = computed(() =>
  Array.from({ length: boardSize.value }, (_, i) => String(boardSize.value - i)),
)

// Ripple animation tracker for newly placed stone
const latestPlacedMove = ref<BoardPosition | null>(null)

watch(
  () => props.lastMove,
  (newMove) => {
    if (newMove) {
      latestPlacedMove.value = newMove
      playStoneSound()
      triggerHaptic('light')
    }
  },
  { deep: true },
)

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
    playCaptureSound()
    triggerHaptic('medium')
    emit('toggleDeadGroup', position)
  } else if (!props.scoringMode && props.board[row][column] === null) {
    emit('play', position)
  }
}

// Viewbox calculation depending on coordinates toggle
const showCoords = computed(() => settingsStore.showCoordinates)
const viewBox = computed(() => {
  if (showCoords.value) {
    return `-1.15 -1.15 ${boardSize.value + 1.3} ${boardSize.value + 1.3}`
  }
  return `-0.7 -0.7 ${boardSize.value + 0.4} ${boardSize.value + 0.4}`
})
</script>

<template>
  <div class="board-container" :class="{ 'is-disabled': disabled }">
    <div class="board-frame">
      <svg
        class="go-board"
        :viewBox="viewBox"
        role="grid"
        aria-label="Bàn cờ vây gỗ Shin-Kaya"
      >
        <defs>
          <!-- Goban wood grain with warm honey undertones -->
          <radialGradient id="kaya-wood" cx="45%" cy="40%" r="70%">
            <stop offset="0%" stop-color="var(--color-board-light)" />
            <stop offset="65%" stop-color="var(--color-board-mid)" />
            <stop offset="100%" stop-color="var(--color-board-dark)" />
          </radialGradient>

          <!-- Wood frame border gradient -->
          <linearGradient id="frame-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--color-board-frame-bevel)" />
            <stop offset="40%" stop-color="var(--color-board-frame)" />
            <stop offset="100%" stop-color="var(--color-board-frame-deep)" />
          </linearGradient>

          <!-- Authentic Japanese Slate Black Stone (Matte with soft sheen) -->
          <radialGradient id="slate-black-stone" cx="30%" cy="26%" r="78%">
            <stop offset="0%" stop-color="var(--color-stone-black-highlight)" />
            <stop offset="38%" stop-color="var(--color-stone-black)" />
            <stop offset="85%" stop-color="var(--color-stone-black-deep)" />
            <stop offset="100%" stop-color="#000000" />
          </radialGradient>

          <!-- Authentic Clamshell White Stone (Luminous Hamaguri) -->
          <radialGradient id="shell-white-stone" cx="32%" cy="26%" r="78%">
            <stop offset="0%" stop-color="var(--color-stone-white-highlight)" />
            <stop offset="42%" stop-color="var(--color-stone-white)" />
            <stop offset="82%" stop-color="var(--color-stone-white-shadow)" />
            <stop offset="100%" stop-color="var(--color-stone-white-deep)" />
          </radialGradient>

          <!-- Ripple glow for new stone placement -->
          <radialGradient id="placement-ripple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--ios-gold)" stop-opacity="0.6" />
            <stop offset="100%" stop-color="var(--ios-gold)" stop-opacity="0" />
          </radialGradient>

          <!-- Filter for stone 3D drop shadow -->
          <filter id="stone-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0.04" dy="0.07" stdDeviation="0.05" flood-color="rgba(20, 10, 4, 0.45)" />
            <feDropShadow dx="0.01" dy="0.02" stdDeviation="0.02" flood-color="rgba(0, 0, 0, 0.35)" />
          </filter>
        </defs>

        <!-- Board Wood Surface Base -->
        <rect
          class="board-surface"
          x="-0.7"
          y="-0.7"
          :width="boardSize + 0.4"
          :height="boardSize + 0.4"
          rx="0.22"
        />

        <!-- Subtle Inner Border Inset -->
        <rect
          class="board-inset"
          x="-0.48"
          y="-0.48"
          :width="boardSize - 0.04"
          :height="boardSize - 0.04"
          rx="0.08"
        />

        <!-- Coordinate Labels (Top & Bottom Columns) -->
        <g v-if="showCoords" class="coord-labels">
          <!-- Column letters top & bottom -->
          <text
            v-for="(label, colIndex) in columnLabels"
            :key="`col-top-${label}`"
            :x="colIndex"
            y="-0.72"
            class="coord-text"
          >
            {{ label }}
          </text>
          <text
            v-for="(label, colIndex) in columnLabels"
            :key="`col-bot-${label}`"
            :x="colIndex"
            :y="boardSize - 0.28"
            class="coord-text"
          >
            {{ label }}
          </text>

          <!-- Row numbers left & right -->
          <text
            v-for="(label, rowIndex) in rowLabels"
            :key="`row-left-${label}`"
            x="-0.76"
            :y="rowIndex + 0.08"
            class="coord-text"
          >
            {{ label }}
          </text>
          <text
            v-for="(label, rowIndex) in rowLabels"
            :key="`row-right-${label}`"
            :x="boardSize - 0.24"
            :y="rowIndex + 0.08"
            class="coord-text"
          >
            {{ label }}
          </text>
        </g>

        <!-- Grid Lines -->
        <g class="grid-lines">
          <!-- Horizontal lines -->
          <line
            v-for="index in boardSize"
            :key="`h-${index}`"
            x1="0"
            :x2="boardSize - 1"
            :y1="index - 1"
            :y2="index - 1"
          />
          <!-- Vertical lines -->
          <line
            v-for="index in boardSize"
            :key="`v-${index}`"
            y1="0"
            :y2="boardSize - 1"
            :x1="index - 1"
            :x2="index - 1"
          />
        </g>

        <!-- Star Points (Hoshi) -->
        <circle
          v-for="point in starPoints"
          :key="`star-${point.row}-${point.column}`"
          class="star-point"
          :cx="point.column"
          :cy="point.row"
          r="0.09"
        />

        <!-- Ownership Overlay (KataGo Heatmap) -->
        <circle
          v-for="point in ownershipPoints"
          :key="`ownership-${point.row}-${point.column}`"
          class="ownership"
          :class="point.value >= 0 ? 'black-ownership' : 'white-ownership'"
          :cx="point.column"
          :cy="point.row"
          :fill-opacity="Math.abs(point.value) * 0.62"
          r="0.36"
        />

        <!-- Intersections & Stones -->
        <g v-for="(row, rowIndex) in board" :key="rowIndex" role="row">
          <g
            v-for="(stone, columnIndex) in row"
            :key="`${rowIndex}-${columnIndex}`"
            class="intersection"
            :class="{
              selectable:
                (stone === null && !scoringMode && !disabled) ||
                (stone && scoringMode && !disabled),
            }"
            role="gridcell"
            :aria-label="`Hàng ${boardSize - rowIndex}, cột ${columnLabels[columnIndex]}${
              stone
                ? `, quân ${stone === 'black' ? 'đen' : 'trắng'}${isDeadStone(rowIndex, columnIndex) ? ', quân chết' : ''}`
                : ''
            }`"
            :tabindex="
              ((stone === null && !scoringMode) || (stone && scoringMode)) && !disabled ? 0 : -1
            "
            @click="selectPosition(rowIndex, columnIndex)"
            @keydown.enter.prevent="selectPosition(rowIndex, columnIndex)"
            @keydown.space.prevent="selectPosition(rowIndex, columnIndex)"
          >
            <!-- Hover target (crosshair and ghost stone) -->
            <circle
              v-if="stone === null"
              :class="['hover-target', `preview-${currentPlayer ?? 'black'}`]"
              :cx="columnIndex"
              :cy="rowIndex"
              r="0.44"
            />

            <!-- Stone Graphic -->
            <circle
              v-if="stone"
              :class="['stone', stone, { 'is-new': isLastMove(rowIndex, columnIndex) }]"
              :cx="columnIndex"
              :cy="rowIndex"
              r="0.45"
            />

            <!-- Shockwave ripple on placement -->
            <circle
              v-if="
                latestPlacedMove &&
                latestPlacedMove.row === rowIndex &&
                latestPlacedMove.column === columnIndex
              "
              class="placement-ripple"
              :cx="columnIndex"
              :cy="rowIndex"
              r="0.45"
            />

            <!-- Dead Stone Mark in Scoring Mode -->
            <g v-if="stone && isDeadStone(rowIndex, columnIndex)" class="dead-marker">
              <line
                :x1="columnIndex - 0.22"
                :y1="rowIndex - 0.22"
                :x2="columnIndex + 0.22"
                :y2="rowIndex + 0.22"
              />
              <line
                :x1="columnIndex + 0.22"
                :y1="rowIndex - 0.22"
                :x2="columnIndex - 0.22"
                :y2="rowIndex + 0.22"
              />
            </g>

            <!-- Last Move Golden Ring Indicator -->
            <g v-if="isLastMove(rowIndex, columnIndex)" class="last-move-indicator">
              <circle
                class="last-move-ring"
                :cx="columnIndex"
                :cy="rowIndex"
                r="0.16"
              />
              <circle
                class="last-move-dot"
                :cx="columnIndex"
                :cy="rowIndex"
                r="0.06"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.board-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: min(100%, 46rem);
  margin: 0 auto;
  user-select: none;
  -webkit-user-select: none;
}

.board-frame {
  position: relative;
  width: 100%;
  background: url(#frame-bevel), var(--color-board-frame);
  border: clamp(8px, 1.8vw, 16px) solid var(--color-board-frame-deep);
  border-radius: var(--radius-xl);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 12px 28px rgba(0, 0, 0, 0.18),
    0 24px 50px rgba(50, 25, 5, 0.28),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.4);
  padding: 4px;
  box-sizing: border-box;
  transition: transform var(--dur-short) var(--ease-spring), box-shadow var(--dur-short) var(--ease-ios);
}

.go-board {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.board-surface {
  fill: url(#kaya-wood);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
}

.board-inset {
  fill: none;
  stroke: var(--color-board-line);
  stroke-width: 0.024;
  opacity: 0.6;
}

.grid-lines line {
  stroke: var(--color-board-line);
  stroke-width: 0.034;
  stroke-linecap: round;
}

.star-point {
  fill: var(--color-board-star);
}

/* Coordinates */
.coord-text {
  fill: var(--color-board-coord);
  font-family: var(--font-mono);
  font-size: 0.28px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: central;
  opacity: 0.9;
  letter-spacing: 0.02em;
}

/* Intersections */
.intersection {
  outline: none;
  cursor: default;
}

.intersection.selectable {
  cursor: pointer;
}

/* Hover Ghost Stone */
.hover-target {
  fill: transparent;
  stroke: transparent;
  stroke-width: 0.03;
  transition:
    fill var(--dur-instant) var(--ease-out-smooth),
    stroke var(--dur-instant) var(--ease-out-smooth),
    opacity var(--dur-instant) var(--ease-out-smooth),
    r var(--dur-instant) var(--ease-spring);
}

@media (hover: hover) and (pointer: fine) {
  .intersection.selectable:hover .hover-target,
  .intersection.selectable:focus .hover-target {
    r: 0.44;
  }

  .intersection.selectable:hover .hover-target.preview-black,
  .intersection.selectable:focus .hover-target.preview-black {
    fill: var(--color-stone-black);
    fill-opacity: 0.45;
    stroke: rgba(255, 255, 255, 0.35);
  }

  .intersection.selectable:hover .hover-target.preview-white,
  .intersection.selectable:focus .hover-target.preview-white {
    fill: var(--color-stone-white);
    fill-opacity: 0.65;
    stroke: rgba(0, 0, 0, 0.25);
  }
}

/* 3D Realistic Stones */
.stone {
  filter: url(#stone-shadow);
  transform-box: fill-box;
  transform-origin: center;
}

.stone.black {
  fill: url(#slate-black-stone);
}

.stone.white {
  fill: url(#shell-white-stone);
}

/* iOS Spring Drop Animation on stone placement */
.stone.is-new {
  animation: ios-stone-drop 280ms cubic-bezier(0.2, 0.9, 0.3, 1.25) both;
}

@keyframes ios-stone-drop {
  0% {
    opacity: 0;
    transform: scale(1.3) translateY(-0.08px);
  }
  65% {
    opacity: 1;
    transform: scale(0.95) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Shockwave ripple expanding outwards */
.placement-ripple {
  fill: none;
  stroke: var(--ios-gold);
  stroke-width: 0.035;
  transform-box: fill-box;
  transform-origin: center;
  animation: shockwave 450ms var(--ease-out-smooth) forwards;
  pointer-events: none;
}

@keyframes shockwave {
  0% {
    r: 0.45;
    opacity: 0.85;
    stroke-width: 0.05;
  }
  100% {
    r: 0.85;
    opacity: 0;
    stroke-width: 0.005;
  }
}

/* Golden Jewel Last Move Ring */
.last-move-indicator {
  pointer-events: none;
}

.last-move-ring {
  fill: none;
  stroke: var(--ios-gold);
  stroke-width: 0.045;
  filter: drop-shadow(0 0 1px rgba(212, 175, 55, 0.8));
  animation: pulse-ring 2.2s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

.last-move-dot {
  fill: var(--ios-gold);
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
    opacity: 0.92;
  }
  50% {
    transform: scale(1.18);
    opacity: 0.55;
  }
}

/* Dead Stone Marker in Scoring Mode */
.dead-marker line {
  stroke: var(--ios-danger);
  stroke-width: 0.08;
  stroke-linecap: round;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
}

/* KataGo Ownership Overlay */
.ownership {
  pointer-events: none;
}
.ownership.black-ownership {
  fill: var(--color-stone-black);
}
.ownership.white-ownership {
  fill: var(--color-stone-white);
  stroke: var(--ios-success);
  stroke-width: 0.02;
}

/* Disabled State */
.is-disabled {
  opacity: 0.8;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .stone.is-new,
  .placement-ripple,
  .last-move-ring {
    animation: none !important;
  }
}
</style>
