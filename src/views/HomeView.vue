<template>
  <section>
    <p class="eyebrow">Cờ vây trên trình duyệt</p>
    <h1>Sẵn sàng cho một ván cờ mới?</h1>
    <p class="description">Chơi cùng bạn bè trên một thiết bị hoặc đối đầu với bot.</p>
    <RouterLink class="primary-action" to="/new-game">Tạo ván mới</RouterLink>
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
</style>
