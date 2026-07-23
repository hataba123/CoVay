<template>
  <section class="home-page">
    <div class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">Không gian chơi cờ trên trình duyệt</p>
        <h1>Một nước đi.<br /><em>Một khoảng lặng.</em></h1>
        <p class="description">
          Chơi cùng bạn bè trên một thiết bị hoặc đối đầu với bot. Tập trung vào thế cờ, để Cờ Vây
          lo phần còn lại.
        </p>
        <div class="hero-actions">
          <RouterLink class="primary-action" to="/new-game"
            >Tạo ván mới <span aria-hidden="true">↗</span></RouterLink
          >
          <RouterLink class="text-action" to="/saved-games">Xem ván đã lưu</RouterLink>
        </div>
      </div>
      <div class="hero-board" aria-hidden="true">
        <div class="board-grid">
          <span
            v-for="point in 25"
            :key="point"
            :class="{ stone: [3, 8, 13, 19, 23].includes(point) }"
          />
        </div>
        <p>THẾ CỜ · TĨNH LẶNG</p>
      </div>
    </div>
    <section class="rules">
      <div class="rules-heading">
        <span class="section-number">01</span>
        <h2>Luật chơi cơ bản</h2>
      </div>
      <ul>
        <li><span>01</span>Đen đi trước, đặt quân tại giao điểm trống.</li>
        <li><span>02</span>Nhóm quân hết khí sẽ bị bắt khỏi bàn cờ.</li>
        <li><span>03</span>Không được đi tự sát hoặc lặp lại trạng thái ngay trước đó (Ko).</li>
        <li><span>04</span>Hai lần bỏ lượt liên tiếp sẽ chuyển sang xác nhận điểm số.</li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.home-page {
  display: grid;
  gap: var(--space-3xl);
}
.home-hero {
  align-items: center;
  display: grid;
  gap: clamp(var(--space-xl), 8vw, var(--space-3xl));
  grid-template-columns: minmax(0, 1.05fr) minmax(18rem, 0.95fr);
  min-height: min(55rem, 65vh);
}
.hero-copy {
  max-width: 42rem;
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
  color: var(--color-ink);
  font-size: var(--text-display);
  margin: 0;
  max-width: 12ch;
}
h1 em {
  color: var(--color-accent-strong);
  font-style: normal;
}
.description {
  color: var(--color-ink-2);
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
  margin: var(--space-lg) 0 var(--space-xl);
  max-width: 33rem;
}
.hero-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}
.primary-action {
  align-items: center;
  background: var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-accent-ink);
  display: inline-flex;
  font-weight: 750;
  gap: 0.65rem;
  padding: 0.9rem 1.1rem;
  text-decoration: none;
}
.primary-action:hover {
  background: var(--color-accent-strong);
  transform: translateY(-2px);
}
.primary-action span {
  font-size: 1.1rem;
}
.text-action {
  color: var(--color-ink-2);
  font-size: var(--text-sm);
  font-weight: 700;
  text-decoration: none;
}
.text-action:hover {
  color: var(--color-accent-strong);
}
.hero-board {
  background: var(--color-board-frame);
  border: 0.7rem solid var(--color-board-frame-deep);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lifted);
  padding: clamp(var(--space-md), 4vw, var(--space-xl));
  transform: rotate(2.5deg);
}
.board-grid {
  aspect-ratio: 1;
  background-color: var(--color-board-mid);
  background-image:
    linear-gradient(var(--color-board-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-board-line) 1px, transparent 1px);
  background-size: 25% 25%;
  border: 1px solid var(--color-board-line);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 0;
}
.board-grid span {
  align-self: center;
  aspect-ratio: 1;
  border-radius: 50%;
  justify-self: center;
  width: 52%;
}
.board-grid span.stone {
  background: var(--color-stone-black);
  box-shadow: var(--shadow-stone);
}
.board-grid span:nth-child(8),
.board-grid span:nth-child(19) {
  background: var(--color-stone-white);
  box-shadow:
    inset -0.12rem -0.12rem 0.15rem var(--color-stone-white-shadow),
    var(--shadow-stone-soft);
}
.hero-board p {
  color: var(--color-paper-2);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  margin: var(--space-sm) 0 0;
  text-align: right;
}
.rules {
  border-top: 1px solid var(--color-rule);
  display: grid;
  gap: var(--space-xl);
  grid-template-columns: minmax(12rem, 0.65fr) minmax(0, 1.35fr);
  padding-top: var(--space-md);
}
.rules-heading {
  align-items: baseline;
  display: flex;
  gap: var(--space-sm);
}
.section-number,
.rules li span {
  color: var(--color-accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
}
.rules h2 {
  margin: 0;
}
.rules ul {
  display: grid;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}
.rules li {
  align-items: baseline;
  border-bottom: 1px solid var(--color-rule);
  color: var(--color-ink-2);
  display: grid;
  gap: var(--space-md);
  grid-template-columns: 2rem minmax(0, 1fr);
  line-height: 1.5;
  padding: var(--space-sm) 0;
}
@media (max-width: 52rem) {
  .home-hero {
    grid-template-columns: minmax(0, 1fr);
    min-height: auto;
  }
  .hero-board {
    margin-inline: auto;
    max-width: 32rem;
    width: 100%;
  }
}
@media (max-width: 40rem) {
  .home-page {
    gap: var(--space-2xl);
  }
  h1 {
    font-size: clamp(2.8rem, 16vw, 4.5rem);
    max-width: 11ch;
  }
  .rules {
    gap: var(--space-md);
    grid-template-columns: 1fr;
  }
}
</style>
