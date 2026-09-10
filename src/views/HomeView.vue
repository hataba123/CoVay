<script setup lang="ts">
import { ref } from 'vue'
import { useAudioHaptics } from '@/composables/useAudioHaptics'

const { playStoneSound, playTapSound, triggerHaptic } = useAudioHaptics()

// Interactive interactive mini demo board points (5x5)
const demoStones = ref<{ [key: number]: 'black' | 'white' }>({
  2: 'black',
  8: 'white',
  12: 'black',
  14: 'white',
  18: 'black',
})

function tapDemoPoint(point: number) {
  if (demoStones.value[point]) {
    delete demoStones.value[point]
  } else {
    // Alternating placement
    const count = Object.keys(demoStones.value).length
    demoStones.value[point] = count % 2 === 0 ? 'black' : 'white'
  }
  playStoneSound()
  triggerHaptic('light')
}
</script>

<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="home-hero">
      <div class="hero-copy">
        <div class="hero-badge">
          <span class="badge-dot" />
          <span>Trải nghiệm Cờ Vây chuẩn iOS</span>
        </div>
        <h1 class="hero-title">
          Một nước đi.<br />
          <span class="gradient-text">Một khoảng lặng.</span>
        </h1>
        <p class="hero-desc">
          Không gian cờ vây tối giản, âm thanh gõ gỗ chân thực, phản hồi xúc giác tinh tế và trí tuệ
          nhân tạo KataGo đồng hành cùng bạn.
        </p>

        <div class="hero-actions">
          <RouterLink class="ios-btn-primary" to="/new-game" @click="playTapSound">
            <span>Bắt đầu ván cờ</span>
            <span class="arrow-icon">↗</span>
          </RouterLink>

          <RouterLink class="ios-btn-secondary" to="/saved-games" @click="playTapSound">
            <span>Ván đã lưu</span>
          </RouterLink>
        </div>
      </div>

      <!-- Interactive Tactile Mini Goban -->
      <div class="hero-board-wrapper">
        <div class="mini-goban ios-card" aria-label="Bàn cờ vây tương tác thử">
          <div class="mini-grid">
            <button
              v-for="point in 25"
              :key="point"
              class="grid-point"
              type="button"
              :aria-label="`Điểm ${point}`"
              @click="tapDemoPoint(point)"
            >
              <span v-if="demoStones[point]" class="mini-stone" :class="demoStones[point]" />
            </button>
          </div>
          <div class="mini-goban-footer">
            <span class="board-hint">Chạm để thử âm thanh gõ cờ</span>
            <span class="wood-tag">SHIN-KAYA WOOD</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Apple-style Feature Cards -->
    <section class="features-section">
      <div class="feature-card ios-card">
        <div class="feat-icon-bg">
          <span class="feat-icon">🪵</span>
        </div>
        <h3>Âm thanh & Xúc giác</h3>
        <p>
          Mô phỏng chân thực tiếng đá Slate gõ lên gỗ Shin-Kaya bằng Web Audio API, kết hợp phản hồi
          rung Taptic.
        </p>
      </div>

      <div class="feature-card ios-card">
        <div class="feat-icon-bg">
          <span class="feat-icon">✨</span>
        </div>
        <h3>Trí tuệ nhân tạo KataGo</h3>
        <p>
          Tích hợp bot nhiều cấp độ và engine KataGo hỗ trợ phân tích tỷ lệ thắng và nước đi tối ưu
          theo thời gian thực.
        </p>
      </div>

      <div class="feature-card ios-card">
        <div class="feat-icon-bg">
          <span class="feat-icon">📱</span>
        </div>
        <h3>Tối ưu cho iPhone</h3>
        <p>
          Giao diện kính mờ Liquid Glass, bố cục thân thiện với thao tác ngón tay cái và hỗ trợ cài
          đặt chơi offline PWA.
        </p>
      </div>
    </section>

    <!-- Essential Rules Section -->
    <section class="rules-section ios-card">
      <div class="rules-header">
        <span class="rules-eyebrow">HƯỚNG DẪN NHANH</span>
        <h2>Luật chơi cơ bản</h2>
      </div>

      <div class="rules-grid">
        <div class="rule-box">
          <span class="rule-index">01</span>
          <h4>Lượt đi</h4>
          <p>Quân Đen đi trước, đặt quân tại các giao điểm trống của bàn cờ.</p>
        </div>

        <div class="rule-box">
          <span class="rule-index">02</span>
          <h4>Khí & Bắt quân</h4>
          <p>Nhóm quân bị đối phương bao vây hết các khí liền kề sẽ bị nhấc khỏi bàn.</p>
        </div>

        <div class="rule-box">
          <span class="rule-index">03</span>
          <h4>Luật Ko (Tranh chấp)</h4>
          <p>Không được đi nước cờ lập tức lặp lại nguyên trạng bàn cờ ở lượt trước đó.</p>
        </div>

        <div class="rule-box">
          <span class="rule-index">04</span>
          <h4>Kết thúc ván</h4>
          <p>Hai bên liên tiếp bỏ lượt sẽ chuyển sang giai đoạn xác nhận điểm số diện tích.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: clamp(var(--space-xl), 6vw, var(--space-3xl));
  max-width: var(--content-max);
  margin: 0 auto;
}

/* Hero Section */
.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
  gap: clamp(var(--space-lg), 6vw, var(--space-2xl));
  align-items: center;
  padding-top: var(--space-md);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(0, 122, 255, 0.08);
  color: var(--ios-tint);
  border: 1px solid rgba(0, 122, 255, 0.2);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 700;
  width: fit-content;
}

.badge-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--ios-tint);
}

.hero-title {
  font-size: var(--text-display);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.02;
  color: var(--ios-label);
}

.gradient-text {
  background: linear-gradient(135deg, var(--ios-label) 30%, var(--ios-secondary-label) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.55;
  color: var(--ios-secondary-label);
  max-width: 32rem;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.ios-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.6rem;
  border-radius: var(--radius-pill);
  background: var(--ios-tint);
  color: #ffffff;
  font-weight: 700;
  font-size: var(--text-md);
  text-decoration: none;
  box-shadow: 0 4px 18px var(--ios-tint-glow);
}

.arrow-icon {
  font-size: 1.1rem;
}

.ios-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.4rem;
  border-radius: var(--radius-pill);
  background: var(--ios-bg-secondary);
  color: var(--ios-label);
  font-weight: 600;
  font-size: var(--text-md);
  text-decoration: none;
  border: 1px solid var(--ios-border);
}

/* Mini Goban */
.hero-board-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mini-goban {
  width: 100%;
  max-width: 24rem;
  aspect-ratio: 1;
  background: url(#frame-bevel), linear-gradient(135deg, #fbe6b8, #e9bf7c 65%, #cc9950);
  border: 12px solid #704414;
  border-radius: var(--radius-xl);
  box-shadow:
    0 16px 36px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(50, 25, 5, 0.35);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  aspect-ratio: 1;
  background-image:
    linear-gradient(rgba(58, 36, 14, 0.75) 1px, transparent 1px),
    linear-gradient(90deg, rgba(58, 36, 14, 0.75) 1px, transparent 1px);
  background-size: 25% 25%;
  border: 1px solid rgba(58, 36, 14, 0.75);
}

.grid-point {
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mini-stone {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  animation: stone-drop 200ms var(--ease-spring) both;
}

.mini-stone.black {
  background: radial-gradient(circle at 32% 28%, #4f535a 0%, #151618 60%, #000000 100%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.45);
}

.mini-stone.white {
  background: radial-gradient(circle at 32% 28%, #ffffff 0%, #edf0f5 65%, #c8ced8 100%);
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.18);
}

.mini-goban-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.4rem;
}

.board-hint {
  font-size: 0.7rem;
  font-weight: 600;
  color: #573412;
}

.wood-tag {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #704414;
}

/* Features */
.features-section {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-md);
}

.feature-card {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.feat-icon-bg {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-md);
  background: rgba(125, 125, 125, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.3rem;
}

.feat-icon {
  font-size: 1.5rem;
}

.feature-card h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--ios-label);
}

.feature-card p {
  font-size: var(--text-sm);
  color: var(--ios-secondary-label);
  line-height: 1.5;
}

/* Rules Section */
.rules-section {
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.rules-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--ios-tint);
  letter-spacing: 0.1em;
}

.rules-header h2 {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--ios-label);
  margin-top: 0.2rem;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-md);
}

.rule-box {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.rule-index {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ios-tint);
}

.rule-box h4 {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--ios-label);
}

.rule-box p {
  font-size: var(--text-xs);
  color: var(--ios-secondary-label);
  line-height: 1.5;
}

@keyframes stone-drop {
  from {
    transform: scale(1.3);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 58rem) {
  .home-hero {
    grid-template-columns: 1fr;
  }
  .features-section {
    grid-template-columns: 1fr;
  }
  .rules-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 34rem) {
  .rules-grid {
    grid-template-columns: 1fr;
  }
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .ios-btn-primary,
  .ios-btn-secondary {
    width: 100%;
  }
}
</style>
