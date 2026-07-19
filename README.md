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

## KataGo

Chọn **KataGo** trong mục độ khó bot để dùng engine KataGo thay cho bot chạy trong trình duyệt. KataGo chạy ở tiến trình riêng; mã nguồn không kèm binary hoặc model của engine.

1. Windows: chạy `ChayWeb.bat`. Lần đầu, file batch tự tải bản KataGo Eigen cho Windows và network chính thức, rồi tự khởi động bridge.
2. Hoặc chạy `npm run setup:katago`, sau đó `npm run katago` và `npm run dev` trong hai terminal.
3. Bạn vẫn có thể tự thiết lập `KATAGO_EXECUTABLE`, `KATAGO_MODEL_PATH` và `KATAGO_CONFIG_PATH` để dùng bản engine/model khác.

Vite sẽ chuyển tiếp `/api/katago` đến bridge khi phát triển. Khi triển khai production, reverse proxy `/api/katago` về bridge hoặc đặt `VITE_KATAGO_API_URL` thành URL đầy đủ của bridge trước khi build. Bridge chuyển trực tiếp JSON Analysis Engine của KataGo và đặt giới hạn 300 visits cho mỗi nước đi. Nút **Phân tích KataGo** hiển thị winrate, score lead, ownership heatmap và năm biến thể chính.

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

## Phạm vi hiện tại và giới hạn

### Sức mạnh bot

- **Dễ** chọn ngẫu nhiên một nước hợp lệ.
- **Trung bình** chấm điểm một nước bằng bắt quân, cứu nhóm bị atari và số khí.
- **Khó** xem các nước ứng viên tốt nhất và phản hồi một nước của đối thủ, trong ngân sách khoảng 220 ms để không khóa giao diện.

Bot chạy hoàn toàn trong trình duyệt, không có mô hình học máy, khai cuộc, xếp hạng Elo, KataGo hay phân tích nhiều nước sâu. Vì vậy không có cơ sở trung thực để gán mức kyu/dan hoặc xem đây là đối thủ có trình độ kỳ thủ chuyên nghiệp.

### Phạm vi tính điểm

Ứng dụng dùng **area scoring**: đếm quân còn trên bàn, lãnh thổ khép kín và komi. Sau hai lượt bỏ liên tiếp, người chơi có thể nhấp một nhóm quân để đánh dấu/bỏ đánh dấu quân chết; các quân đã đánh dấu được bỏ khỏi bàn trước khi tính điểm.

Điểm bắt quân hiện hiển thị để tham khảo nhưng không được cộng trực tiếp vào area scoring. Chưa có quy trình hai bên cùng xác nhận quân chết, giải quyết tranh chấp, nhận diện seki tự động hoặc Japanese territory scoring (tù binh, territory và các quy tắc riêng của hệ Nhật).

### Phạm vi SGF

Xuất SGF FF[4] cho bàn 9×9, 13×13, 19×19 cùng komi, tên người chơi, kết quả và chuỗi nước chính B/W (bao gồm pass). Nhập SGF đọc đúng giá trị escape, không nhầm nước đi nằm trong comment và kiểm tra thứ tự/tọa độ nước đi.

Biến thể, thiết lập bàn AB/AW/AE, handicap HA và người đi trước PL được báo là chưa hỗ trợ, không bị âm thầm bỏ qua. Chưa có cây biến thể để xem/chỉnh sửa, chú thích hiển thị trên giao diện, đồng hồ, markup hoặc thiết lập luật SGF đầy đủ.

### Luật nâng cao chưa hỗ trợ

Đã có bắt quân, cấm tự sát, pass, đầu hàng và **positional superko**. Chưa có lựa chọn luật theo Nhật/Trung/IAGA/AGA, situational superko, handicap và setup stones, tính pass stone, quy tắc đặc thù seki/bent-four, hay cơ chế đồng thuận tính điểm trong ván thi đấu.

## Hướng phát triển

ASP.NET Core API, SQL Server, đăng nhập, SignalR cho chơi trực tuyến, xếp hạng/phòng đấu/spectator và tích hợp KataGo.
