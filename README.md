# Cờ Vây

Ứng dụng chơi cờ vây chạy trên trình duyệt, được xây dựng bằng Vue 3 và TypeScript.

## Công nghệ

- Vue 3, TypeScript, Vite và Composition API
- Vue Router và Pinia
- Vitest, ESLint và Prettier

## Cài đặt và chạy

```bash
npm install
npm run dev
```

## Kiểm tra chất lượng

```bash
npm run format:check
npm run lint
npm run test
npm run build
```

## Routes ban đầu

- `/`: Trang chủ
- `/new-game`: Tạo ván mới
- `/game`: Ván cờ
- `/saved-games`: Danh sách ván đã lưu
- `/settings`: Cài đặt

## Cấu trúc mã nguồn

```text
src/
├── components/     # Thành phần giao diện
├── composables/    # Logic dùng lại cho Vue
├── domain/         # Luật chơi và mô hình nghiệp vụ thuần TypeScript
├── bots/           # Các chiến thuật bot
├── stores/         # Pinia stores
├── services/       # Lưu trữ và import/export
├── router/         # Định tuyến ứng dụng
├── views/          # Các trang
└── tests/          # Unit test
```

Giai đoạn hiện tại chỉ thiết lập nền tảng dự án. Game engine, bot, lưu IndexedDB, SGF và PWA sẽ được triển khai ở các giai đoạn tiếp theo.
