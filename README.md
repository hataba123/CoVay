# Cờ Vây

Ứng dụng cờ vây chạy hoàn toàn trên trình duyệt: chơi hai người trên cùng thiết bị hoặc đấu bot, hỗ trợ lưu ván cờ, SGF và PWA offline.

## Tính năng

- Bàn cờ responsive 9×9, 13×13, 19×19; hiển thị hoshi, nước đi gần nhất và lịch sử.
- Luật cơ bản: bắt quân, tự sát, Ko đơn giản, pass, đầu hàng, undo/redo PVP, komi và tính điểm diện tích.
- Bot dễ, trung bình, khó; bot chỉ thực hiện nước hợp lệ và không khóa giao diện.
- Tự động lưu IndexedDB, mở lại/xóa ván đã lưu, nhập/xuất SGF cơ bản.
- Light/dark mode và PWA có thể cài đặt, chạy offline sau lần tải đầu.

## Công nghệ

Vue 3, TypeScript, Vite, Composition API, Pinia, Vue Router, Vitest, ESLint, Prettier, IndexedDB và vite-plugin-pwa.

## Chạy dự án

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
```

## Kiến trúc

```text
src/
├── bots/          # Chiến lược bot
├── components/    # Bàn cờ, điều khiển và layout
├── domain/        # Models, game engine, rules và scoring thuần TypeScript
├── services/      # IndexedDB và SGF
├── stores/        # Trạng thái game và cài đặt
├── tests/         # Unit tests
└── views/         # Các trang ứng dụng
```

## Giới hạn hiện tại

Bot dùng heuristic tại trình duyệt; tính điểm diện tích chưa hỗ trợ đánh dấu quân chết thủ công. SGF chỉ hỗ trợ các thuộc tính cơ bản và chưa có Superko, KataGo hoặc chơi trực tuyến.

## Hướng phát triển

ASP.NET Core API, SQL Server, đăng nhập, SignalR cho chơi trực tuyến, xếp hạng/phòng đấu/spectator và tích hợp KataGo.
