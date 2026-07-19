<template>
  <section>
    <p class="eyebrow">Cờ vây trên trình duyệt</p>
    <h1>Sẵn sàng cho một ván cờ mới?</h1>
    <p class="description">Chơi cùng bạn bè trên một thiết bị hoặc đối đầu với bot.</p>
    <RouterLink class="primary-action" to="/new-game">Tạo ván mới</RouterLink>
    <section class="rules">
      <h2>Luật chơi cơ bản</h2>
      <ul>
        <li>Đen đi trước, đặt quân tại giao điểm trống.</li>
        <li>Nhóm quân hết khí sẽ bị bắt khỏi bàn cờ.</li>
        <li>Không được đi tự sát hoặc lặp lại trạng thái ngay trước đó (Ko).</li>
        <li>Hai lần bỏ lượt liên tiếp sẽ chuyển sang xác nhận điểm số.</li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.eyebrow {
  color: #0369a1;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
}
h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  letter-spacing: -0.04em;
  margin: 0.75rem 0;
}
.description {
  color: #475569;
  font-size: 1.125rem;
  margin-bottom: 2rem;
}
.primary-action {
  background: #0369a1;
  border-radius: 0.5rem;
  color: #fff;
  display: inline-block;
  font-weight: 700;
  padding: 0.75rem 1rem;
  text-decoration: none;
}
.primary-action:hover {
  background: #075985;
}
.rules {
  border-top: 1px solid #e2e8f0;
  margin-top: 3rem;
  max-width: 42rem;
  padding-top: 1.5rem;
}
.rules h2 {
  font-size: 1.125rem;
}
.rules li {
  color: #475569;
  margin: 0.45rem 0;
}
</style>
