# Learning Notes

## 2026-07-25 — 2026-07-26: Setup Expo Router, NativeWind, Tabs Navigation

### 1. Expo Router — file-based routing
- Mỗi file trong thư mục `app/` tự động là 1 route (giống Next.js).
- `app/_layout.tsx` là root layout, dùng `<Stack>` để quản lý navigation dạng chồng màn hình (push/back).
- `(tenFolder)` với **ngoặc tròn** là *route group*: nhóm route lại nhưng KHÔNG xuất hiện trong URL. Dùng để đặt `_layout.tsx` riêng (ví dụ `(tabs)/_layout.tsx` chứa `<Tabs>`).
- `[tenBien]` với **ngoặc vuông** là *dynamic route segment* (route động), ví dụ `movies/[id].tsx` khớp `/movies/123`. Dễ nhầm với route group vì cả hai đều dùng ngoặc nhưng ý nghĩa khác hẳn nhau.
- `name` trong `Stack.Screen` / `Tabs.Screen` phải khớp chính xác tên file/folder tương ứng, sai tên (VD `save` vs `saved`) sẽ không tìm thấy route.
- Thứ tự render: root layout → layout con (vd `(tabs)/_layout.tsx`) → file trang cụ thể (vd `(tabs)/index.tsx`).

### 2. NativeWind + TailwindCSS trên Expo
- Cần cài: `nativewind`, `react-native-reanimated`, `react-native-worklets` (peer dep bắt buộc từ Reanimated v4 trở lên), `react-native-safe-area-context`, và devDependencies `tailwindcss@^3.4.x`, `babel-preset-expo`.
- Cấu hình cần đủ 4 file: `tailwind.config.js` (khai báo `content` — đường dẫn các file chứa class Tailwind), `global.css` (chứa `@tailwind base/components/utilities`), `babel.config.js` (thêm preset nativewind), `metro.config.js` (bọc `withNativeWind`).
- **Tailwind chỉ generate CSS cho những file được liệt kê trong `content`.** Nếu đổi cấu trúc project (VD chuyển sang Expo Router, đổi từ `App.tsx` sang `app/`) mà quên cập nhật `content`, các class sẽ "không ăn" dù cú pháp đúng.
- TypeScript không tự hiểu file `.css`, cần khai báo `declare module "*.css";` trong file `.d.ts` riêng (VD `nativewind-env.d.ts`) mới hết lỗi "Cannot find module for side-effect import".

### 3. React Navigation Tabs — custom tab bar icon
- `tabBarIcon` là 1 *render prop*: React Navigation tự gọi function này và tự truyền `focused` vào, không phải mình tự gọi. Nếu quên khai báo `tabBarIcon` trong `Tabs.Screen`, component icon custom (VD `TabIcon`) sẽ không bao giờ được render dù code viết đúng, vì không ai gọi nó.
- Kỹ thuật floating tab bar: dùng `tabBarStyle` với `position: "absolute"`, bo góc, margin để tab bar nổi tách khỏi đáy màn hình thay vì dính sát.
- Ẩn label mặc định bằng `tabBarShowLabel: false` khi tự vẽ label bên trong icon component.

### 4. Phân biệt lỗi build-time vs runtime
- Lỗi kiểu "Unable to resolve asset ... from app.json" xảy ra ở giai đoạn build/bundling, do file ảnh khai báo trong `app.json` (icon, favicon, adaptive icon) không còn tồn tại trên đĩa — khác với lỗi runtime (xảy ra khi code chạy). Nhận diện đúng loại lỗi giúp định vị nhanh: config file hay component code.

### 5. Quy trình xử lý lỗi dependency
- Xung đột peer dependency (ERESOLVE) giữa các version `react`/`react-dom` nội bộ của Expo Router có thể lặp lại mỗi khi cài package mới ở SDK 57 hiện tại. Dùng `--legacy-peer-deps` để bỏ qua strict check, hoặc set cố định trong `.npmrc`.
