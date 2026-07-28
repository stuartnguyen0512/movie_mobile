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

## 2026-07-26 — 2026-07-27: Destructuring, đổi API sang TVmaze, fetch data + render list

### 1. Destructuring (phá cấu trúc object thành biến riêng)
- `function SearchBar({ onPress, placeholder }: Props)` lấy trực tiếp 2 field từ props object thành 2 biến riêng, thay vì phải gõ `props.onPress`, `props.placeholder` lặp lại.
- Không đổi cách hoạt động của component, chỉ là cú pháp viết gọn hơn, dễ đọc hơn, và dễ gắn TypeScript interface trực tiếp lên từng prop.
- `tabBarIcon` là 1 *render prop*: framework (React Navigation) tự gọi function này và tự truyền `focused` vào — không phải mình tự gọi. Quên khai báo `tabBarIcon` thì component custom sẽ không bao giờ render dù code viết đúng, vì không ai gọi nó.

### 2. Optional trong function argument — trực tiếp vs trong object destructuring
- `function f(query?: string)`: cả tham số optional, gọi `f()` được.
- `function f({ query }: { query: string })`: object bắt buộc, field bên trong cũng bắt buộc — `f()` lỗi, phải gọi `f({ query: "..." })`.
- `function f({ query }: { query?: string })`: object bắt buộc nhưng field bên trong optional — `f({})` hợp lệ, `f()` vẫn lỗi.
- `function f({ query }: { query?: string } = {})`: thêm `= {}` làm giá trị mặc định cho cả object → `f()` mới thật sự hợp lệ.
- Dùng object argument (thay vì nhiều tham số string liên tiếp) giúp: dễ mở rộng thêm field sau này không phá vỡ chỗ gọi cũ, đọc code rõ nghĩa hơn tại nơi gọi (named parameter), tránh nhầm thứ tự tham số cùng kiểu.

### 3. Đổi nguồn API: từ TMDB (video) sang TVmaze (do không tạo được tài khoản TMDB)
- OMDB không có endpoint kiểu "popular/latest/trending" (chỉ có tìm theo ID/Title và search theo từ khóa) → không phù hợp để thay thế cho phần "danh sách phim mới" trong video.
- TVmaze được chọn vì: miễn phí hoàn toàn, **không cần tài khoản/API key**, gọi trực tiếp qua HTTPS — đánh đổi là dữ liệu là TV show, không phải movie, nên đổi toàn bộ concept "Movie" → "Show" trong code (interface, route, tên biến) để nhất quán.
- Đổi nguồn API không chỉ là đổi tên gọi — **response shape khác hoàn toàn**, phải đọc kỹ docs/response thật trước khi viết interface, không thể chỉ đổi tên field cũ:
  - TMDB dùng `title`, `poster_path`, `vote_average`, `release_date`...
  - TVmaze dùng `name`, `image.medium/original`, `rating.average`, `premiered`...
  - Endpoint search của TVmaze (`/search/shows?q=`) trả về mảng `{ score, show }` — dữ liệu thật nằm trong field con `show`, khác với endpoint index (`/shows?page=0`) trả về mảng show trực tiếp.
- Đọc property không tồn tại trên object (do interface sai/field sai tên) **không gây lỗi báo ra**, JS/TS chỉ trả về `undefined` im lặng → UI hiển thị rỗng/trắng, dễ nhầm tưởng "API không gọi được" trong khi request vẫn thành công. Cách debug: log thẳng response thật ra xem field tên gì, đối chiếu lại với interface.

### 4. `useFetch` — custom hook tái sử dụng cho mọi loại data
- Đây là hook tổng quát: không quan tâm dữ liệu đến từ TMDB hay TVmaze, chỉ cần 1 `fetchFunction: () => Promise<T>` bất kỳ truyền vào.
- Generic Type `<T>`: TypeScript tự suy ra kiểu dữ liệu dựa theo function truyền vào, giúp hook dùng lại được cho `Show[]`, `ShowDetails`... mà không cần viết lại.
- Quản lý 3 state kinh điển khi làm việc với API: `data`, `loading`, `error`.
- `finally` trong try/catch luôn chạy dù thành công hay lỗi — dùng để tắt `loading` chắc chắn.
- `useEffect` với dependency array rỗng `[]` chỉ chạy 1 lần lúc component mount — dùng để tự động fetch khi màn hình vừa mở (kiểm soát bằng tham số `autoFetch`).

### 5. `ScrollView` lồng `FlatList` cùng hướng cuộn → cảnh báo "VirtualizedLists should never be nested"
- `FlatList` là VirtualizedList: chỉ render item đang hiện trên màn hình (windowing) để tiết kiệm hiệu năng với danh sách dài. `ScrollView` render hết mọi children cùng lúc.
- Lồng `FlatList` (cuộn dọc) vào trong `ScrollView` (cũng cuộn dọc) làm mất tác dụng windowing của FlatList, gây cảnh báo.
- `FlatList` cuộn ngang (`horizontal`) lồng trong `ScrollView` cuộn dọc thì không xung đột, vì khác hướng.
- Xử lý thực tế khi trang có nhiều section khác nhau (không chỉ 1 list dài): dùng `ScrollView` làm khung ngoài, thêm `scrollEnabled={false}` cho `FlatList` con cùng hướng — chấp nhận đánh đổi mất virtualization, hợp lý khi số lượng item hiển thị không quá lớn (ví dụ giới hạn 12-20 item ở trang Home).

### 6. Giới hạn số lượng dữ liệu fetch về
- Endpoint `/shows?page=0` của TVmaze trả nguyên 240 show/lần gọi (không có tham số "limit" nhỏ hơn) — nếu không tự giới hạn, `FlatList` (đặc biệt khi đã tắt `scrollEnabled`) sẽ render hết toàn bộ, vừa chậm UI vừa lãng phí network.
- Nên giới hạn ngay ở tầng gọi API (`.slice(0, n)` trong `services/api.ts`) thay vì chỉ giới hạn lúc hiển thị, để giảm cả dữ liệu tải về lẫn số lượng render, và không phải nhớ giới hạn lại thủ công ở từng nơi gọi hàm.

## 2026-07-27 — 2026-07-28: Spread/rest operator, style Home screen, xây Search screen

### 1. Spread operator vs Rest parameter (cùng dấu `...`, ngược nghĩa nhau)
- **Spread** (`{...item}` lúc gọi/truyền): "bung ra" — lấy 1 object, tách thành nhiều field/prop riêng lẻ. VD `<ShowCard {...item} />` tương đương truyền tay từng prop `id={item.id} name={item.name} ...`.
- **Rest** (`...rest` lúc khai báo tham số hoặc destructure): "gom lại" — nhiều giá trị rời rạc gộp thành 1 mảng/object. VD `const { placeholder, onPress, ...rest } = props`.
- Cả 2 có thể xuất hiện cùng lúc trong 1 đoạn code với vai trò khác nhau tùy vị trí (khai báo vs sử dụng).
- Spread cũng dùng để copy + override 1 field của object mà không sửa trực tiếp bản gốc: `{ ...original, name: "New" }` — pattern quan trọng khi update state trong React.

### 2. `renderItem` của FlatList là render prop
- Giống `tabBarIcon` đã học trước đó: FlatList tự động gọi `renderItem` cho từng phần tử trong `data`, tự truyền vào `{ item, index }`. Không phải tự gọi tay.
- Thiếu `renderItem` thì FlatList biết có bao nhiêu item, biết layout (`numColumns`...) nhưng không biết vẽ item ra sao.

### 3. Đổi field data giữa các API không chỉ là đổi tên — phải đổi cả logic quy đổi giá trị
- TVmaze `rating.average` cùng thang điểm 0–10 như TMDB `vote_average`, nên logic `Math.round(x / 2)` (quy đổi ra thang sao 0-5) áp dụng được y hệt, chỉ cần đổi tên field.
- Nhưng `image.medium` của TVmaze là **URL đầy đủ** (absolute URL), khác `poster_path` của TMDB là **đường dẫn tương đối** cần tự ghép thêm base URL + kích thước ảnh. Copy nguyên logic ghép chuỗi URL từ video (TMDB) sẽ sai hoàn toàn khi áp dụng cho TVmaze — cần đọc kỹ response thật trước khi quyết định giữ/bỏ phần nào của code gốc.
- Bài học chung: khi đổi nguồn dữ liệu, không chỉ rename field theo interface, mà phải kiểm tra từng "hình dạng" giá trị (string thường vs object lồng, relative path vs absolute URL, optional/nullable hay không) trước khi tái sử dụng logic cũ.

### 4. `??` (nullish coalescing) vs default value trong object destructuring — khác nhau ở `null`
- Default destructuring (`const { data: shows = [] } = ...`) **chỉ áp dụng khi giá trị là `undefined`**, KHÔNG áp dụng khi giá trị là `null`.
- Nếu state khởi tạo bằng `useState<T | null>(null)` (như trong `useFetch`), destructure với `= []` vẫn giữ nguyên type `T | null` vì TypeScript biết rõ giá trị ban đầu có thể là `null` thật sự — dẫn đến lỗi "possibly null" khi bỏ `?`/`!`.
- Muốn xử lý đúng cả `null` lẫn `undefined`, dùng `??` thay vì default destructuring: `const shows = showsRaw ?? []`.
- `??` khác `||`: `0 || 5` → `5` (vì `0` là falsy), nhưng `0 ?? 5` → `0` (vì `??` chỉ quan tâm `null`/`undefined`, không quan tâm falsy khác). Quan trọng khi giá trị hợp lệ có thể là `0`.

### 5. Debounce khi search theo mỗi lần gõ phím
- Nếu gọi API ngay mỗi ký tự user gõ, sẽ tốn rất nhiều request thừa. Debounce trì hoãn gọi API 1 khoảng thời gian (VD 500ms) sau lần gõ cuối.
- Cài đặt bằng `useEffect` + `setTimeout`, dependency là giá trị đang theo dõi (VD `[searchQuery]`) để effect chạy lại mỗi lần giá trị đổi.
- **Cleanup function của `useEffect` phải là 1 function, không phải kết quả gọi function**: `return () => clearTimeout(timeoutId)` đúng, còn `return clearTimeout(timeoutId)` sai — cách sai này gọi `clearTimeout` ngay lập tức (hủy luôn timer vừa tạo) thay vì đưa 1 function cho React tự gọi lúc cần cleanup (trước khi effect chạy lại hoặc lúc unmount).
- `useFetch(fn, false)` — tham số `autoFetch=false` để KHÔNG tự fetch lúc mount, chỉ fetch khi có hành động cụ thể (ở đây là debounce timer gọi `refetch`).

### 6. `ListHeaderComponent` / `ListEmptyComponent` của FlatList — cách đúng để trộn nhiều loại nội dung mà không lồng ScrollView
- `ListHeaderComponent`: nội dung hiện phía trên danh sách (logo, SearchBar, trạng thái loading/error, tiêu đề) — cùng cuộn với FlatList vì nằm trong chính nó, không phải 1 ScrollView riêng.
- `ListEmptyComponent`: hiện khi `data` rỗng, dùng để phân biệt 2 trạng thái khác nhau (chưa gõ gì / gõ nhưng không có kết quả) tùy điều kiện.
- Đây là cách "đúng chuẩn" hơn so với `scrollEnabled={false}` (dùng ở Home screen bài trước) khi toàn bộ trang chỉ xoay quanh 1 danh sách — giữ được virtualization thật sự của FlatList, không phải đánh đổi hiệu năng.

### 7. Props optional để không phá vỡ chỗ gọi cũ khi mở rộng component
- Thêm `value?: string`, `onChangeText?: (text: string) => void` vào `SearchBar` (vốn trước đó hard-code `value=""`, `onChangeText={() => {}}`) để dùng làm controlled input cho Search screen.
- Đặt optional (`?`) để chỗ gọi cũ ở Home screen (không truyền 2 field này) vẫn compile và chạy được — nếu bắt buộc sẽ phá vỡ toàn bộ nơi đang dùng component theo cách cũ.
