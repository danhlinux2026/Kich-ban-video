# KichBanVideo — Nhật Ký Vấn Đề & Giải Pháp

Ghi nhận toàn bộ các vấn đề đã gặp và đã xử lý trong quá trình xây dựng app tạo video TikTok tự động từ kịch bản (Agnes AI + FFmpeg + Edge TTS / Gemini / AI Video Models).  
**Cập nhật:** 08/09/2026

---

## 1. Tổng quan dự án

**Quy trình Web App 1-Click:**
> **Nhập thông tin sản phẩm** ➔ **AI viết kịch bản video quảng cáo bán hàng** ➔ **Tạo ảnh mốc (Keyframe) từng cảnh** ➔ **Render clip video chuyển động AI** ➔ **Dựng video hoàn chỉnh (Voice tiếng Việt + Phụ đề + SFX)** ➔ **Tải video MP4 chất lượng cao đăng TikTok, Reels, Shorts**.

- **Bộ đôi nhân vật thương hiệu viral:** Bé Áo Vàng (nhanh nhẹn, lém lỉnh, thực tế) & Bé Áo Đỏ (tín đồ công nghệ, ngây ngô "Biết rồi mà!").
- **Tỷ lệ khung hình:** Chuẩn 9:16 dọc cho video ngắn di động.

---

## 2. Các hạng mục công việc đã thực hiện

### A. Tinh chỉnh Giao diện & Trải nghiệm Người dùng (UI/UX)
1. **Tối ưu hóa Bảng phân cảnh (StoryboardView):**
   - Đã gỡ bỏ khối *"Chiến Thuật Kêu Gọi Hành Động (CTA Chốt Đơn)"* thừa ở cuối trang để tránh trùng lặp thông tin.
   - Thu gọn khung **Pipeline Dựng Video 1-Click** phía trên, chỉ giữ lại các nút điều khiển chính và thanh tiến trình tổng quát.
   - Chuyển toàn bộ **tiến trình trạng thái của từng cảnh** (`○ Chưa Tạo`, `⌛ Đang Tạo Ảnh...`, `◐ Ảnh Mốc Xong`, `⌛ Đang Render Clip...`, `✓ Hoàn thành Clip MP4`) lên thanh tiêu đề của từng thẻ phân cảnh (`Cảnh #1`, `Cảnh #2`,...).
   - Hỗ trợ hiển thị trạng thái đồng bộ ở cả 2 chế độ **Mở rộng (Expanded)** và **Thu gọn (Collapsed)**.

2. **Cấu hình & Tích hợp Đa Model (LLMSettingsModal):**
   - Phân tách cấu hình riêng biệt cho 3 tầng tác vụ:
     - **Tầng 1 - Kịch bản:** Gemini, OpenRouter, DeepSeek, Claude, GPT.
     - **Tầng 2 - Sinh ảnh:** Flux, SDXL, Imagen 3, Midjourney API.
     - **Tầng 3 - Render Video:** Wan2.1, Kling, Runway Gen-3, Luma Dream Machine, Pika Labs.

---

### B. Huấn luyện & Cấu hình AI Chuyên Sâu cho Video Quảng Cáo Bán Hàng
1. **Nâng cấp System Prompt Backend (`server.ts`):**
   - Định vị vai trò AI là **Giám Đốc Sáng Tạo & Biên Kịch Trưởng Video Quảng Cáo Thương Mại (Commercial Product Video Ads)**.
   - Áp dụng các công thức tiếp thị chuyển đổi cao:
     - **PAS Formula:** Tình huống rắc rối đời thực (Problem) ➔ Đẩy cao mâu thuẫn (Agitate) ➔ Bảo bối xuất hiện cứu nguy (Solve) ➔ Demo thực tế (Product Demo).
     - **Unboxing & Reaction:** Đập hộp trải nghiệm hài hước.
     - **Before vs After:** So sánh trước và sau khi có sản phẩm.
     - **Extreme Stress Test:** Thử thách độ bền & công năng đỉnh cao.
     - **Flash Sale & Urgent CTA:** Bắt trend TikTok Shop & Khuyến mãi giật gân.
2. **Bổ sung các trường dữ liệu tiếp thị chuyên sâu (`CustomScriptGenerator.tsx`):**
   - *Tên sản phẩm quảng cáo*.
   - *Thương hiệu / Nhãn hàng (Brand)*.
   - *Danh mục ngành hàng*.
   - *Điểm bán hàng độc nhất (USP) & Tính năng cốt lõi*.
   - *Đối tượng khách hàng mục tiêu*.
   - *Góc tiếp cận quảng cáo (Marketing Hook Formula)*.

---

### C. Pipeline Tự Động Hóa & Lưu Trữ Dự Án (Checkpoint System)
1. **Lưu trữ trạng thái phân cảnh an toàn:**
   - Cơ chế Checkpoint tự động lưu ảnh mốc và clip video của từng cảnh vào LocalStorage (`checkpoint_script_...`).
   - Người dùng có thể F5 tải lại trang hoặc tạo dở dang mà không bị mất dữ liệu hay tốn chi phí render lại các cảnh đã hoàn thành.
2. **Xuất bản & Tải về:**
   - Trình phát Timeline trực quan cho phép xem trước từng cảnh.
   - Hỗ trợ tải từng ảnh mốc, clip từng cảnh hoặc video tổng hợp MP4 hoàn chỉnh.

---

## 3. Nhật ký Vấn đề & Giải pháp xử lý

| # | Vấn đề phát sinh | Nguyên nhân | Giải pháp đã xử lý | Trạng thái |
|---|-------------------|-------------|---------------------|------------|
| 1 | Khối CTA chốt đơn bị thừa ở cuối Storyboard gây rối mắt | Cấu hình layout cũ để riêng 1 card CTA ở footer | Đã loại bỏ khối CTA thừa, tích hợp lời kêu gọi trực tiếp vào Cảnh #5 | ✅ Đã hoàn thành |
| 2 | Khung pipeline trên cùng chứa 5 ô tiến trình cảnh bị trùng lặp với thẻ phân cảnh | Thông tin tiến trình phân cảnh bị nhân đôi ở cả trên lẫn dưới | Gỡ bỏ 5 ô tiến trình ở khung trên, đưa badge trạng thái gắn trực tiếp vào header của từng cảnh | ✅ Đã hoàn thành |
| 3 | Kịch bản AI sinh ra mang tính kể chuyện đơn thuần, thiếu tính thuyết phục bán hàng | Prompt hệ thống chưa định vị rõ bối cảnh video quảng cáo thương mại | Nâng cấp toàn diện Prompt với chuẩn Marketing Video Ads (USP, PAS, Live Demo, Call To Action) | ✅ Đã hoàn thành |
| 4 | Mất dữ liệu ảnh/clip khi người dùng lỡ tay làm mới trang | Dữ liệu chỉ nằm trong bộ nhớ RAM tạm thời của React state | Triển khai hệ thống Checkpoint cục bộ tự động lưu sau mỗi tác vụ | ✅ Đã hoàn thành |
| 5 | Lỗi hiển thị nhãn tiến trình khi thẻ cảnh ở chế độ thu gọn | Chưa đồng bộ badge trạng thái vào thanh header thu gọn | Đã thêm badge màu sắc trực quan (Done, Rendering, Gen Img, Lỗi) vào chế độ Collapsed | ✅ Đã hoàn thành |

---

## 4. Kế hoạch & Hướng phát triển tiếp theo
- [ ] Tích hợp sâu thư viện âm thanh nền (BGM) và hiệu ứng âm thanh (SFX) theo từng nhịp cảm xúc của cảnh.
- [ ] Tùy chỉnh giọng đọc lồng tiếng (Voice TTS tiếng Việt đa vùng miền Bắc / Trung / Nam).
- [ ] Tối ưu hóa render sub chữ karaoke động bắt mắt theo phong cách TikTok Shop triệu view.
