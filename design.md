# Design — Cờ Vây

Hệ giao diện thống nhất cho ứng dụng chơi cờ vây trên trình duyệt.

## Genre

Modern-minimal có chất thủ công: bàn cờ là vật thể trung tâm, phần mềm chỉ làm nền cho nhịp chơi.

## Macrostructure family

- Marketing / trang chủ: Marquee Hero — lời mời ngắn, quy tắc neo ở cạnh dưới.
- App / màn hình chơi: Workbench — bàn cờ là vùng thao tác chính, sidebar là ngữ cảnh.
- Content / cấu hình và lưu ván: Long Document — tiêu đề rõ, nội dung chia thành các card có khoảng thở.

## Theme

- Nền giấy ấm, mực xanh than, khung bàn xanh rừng.
- Accent đất nung dùng tiết chế cho hành động chính và trạng thái lượt.
- Chế độ tối dùng cùng hue, tăng tương phản thay vì đảo màu tùy tiện.

## Typography

- Display: Iowan Old Style / Palatino / Georgia, roman.
- Body: Inter hoặc system sans, ưu tiên dễ đọc trong thao tác.
- Mono: dùng cho số liệu/phân tích khi cần.

## Spacing

Thang 4-point được khai báo trong `tokens.css`. Component dùng token ngữ nghĩa, không rải giá trị màu/khoảng cách riêng.

## Motion

Chuyển động ngắn, ưu tiên transform và opacity; tắt chuyển động khi người dùng bật reduced motion.

## CTA voice

- Primary: nền đất nung, chữ sáng, bo vừa phải.
- Secondary: nền trong, viền mảnh, hover nâng nhẹ trên nền giấy.

## What pages must share

Wordmark Cờ Vây, token màu, cặp chữ, bán kính card, trạng thái focus và nhịp header.
