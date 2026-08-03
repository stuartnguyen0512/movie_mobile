# Learning Notes

## 2026-07-25 — 2026-07-26: Setup Expo Router, NativeWind, Tabs Navigation

### 1. Expo Router — file-based routing

- Mỗi file trong thư mục `app/` tự động là 1 route (giống Next.js).
- `app/_layout.tsx` là root layout, dùng `<Stack>` để quản lý navigation dạng chồng màn hình (push/back).
- `(tenFolder)` với **ngoặc tròn** là _route group_: nhóm route lại nhưng KHÔNG xuất hiện trong URL. Dùng để đặt `_layout.tsx` riêng (ví dụ `(tabs)/_layout.tsx` chứa `<Tabs>`).
- `[tenBien]` với **ngoặc vuông** là _dynamic route segment_ (route động), ví dụ `movies/[id].tsx` khớp `/movies/123`. Dễ nhầm với route group vì cả hai đều dùng ngoặc nhưng ý nghĩa khác hẳn nhau.
- `name` trong `Stack.Screen` / `Tabs.Screen` phải khớp chính xác tên file/folder tương ứng, sai tên (VD `save` vs `saved`) sẽ không tìm thấy route.
- Thứ tự render: root layout → layout con (vd `(tabs)/_layout.tsx`) → file trang cụ thể (vd `(tabs)/index.tsx`).

### 2. NativeWind + TailwindCSS trên Expo

- Cần cài: `nativewind`, `react-native-reanimated`, `react-native-worklets` (peer dep bắt buộc từ Reanimated v4 trở lên), `react-native-safe-area-context`, và devDependencies `tailwindcss@^3.4.x`, `babel-preset-expo`.
- Cấu hình cần đủ 4 file: `tailwind.config.js` (khai báo `content` — đường dẫn các file chứa class Tailwind), `global.css` (chứa `@tailwind base/components/utilities`), `babel.config.js` (thêm preset nativewind), `metro.config.js` (bọc `withNativeWind`).
- **Tailwind chỉ generate CSS cho những file được liệt kê trong `content`.** Nếu đổi cấu trúc project (VD chuyển sang Expo Router, đổi từ `App.tsx` sang `app/`) mà quên cập nhật `content`, các class sẽ "không ăn" dù cú pháp đúng.
- TypeScript không tự hiểu file `.css`, cần khai báo `declare module "*.css";` trong file `.d.ts` riêng (VD `nativewind-env.d.ts`) mới hết lỗi "Cannot find module for side-effect import".

### 3. React Navigation Tabs — custom tab bar icon

- `tabBarIcon` là 1 _render prop_: React Navigation tự gọi function này và tự truyền `focused` vào, không phải mình tự gọi. Nếu quên khai báo `tabBarIcon` trong `Tabs.Screen`, component icon custom (VD `TabIcon`) sẽ không bao giờ được render dù code viết đúng, vì không ai gọi nó.
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
- `tabBarIcon` là 1 _render prop_: framework (React Navigation) tự gọi function này và tự truyền `focused` vào — không phải mình tự gọi. Quên khai báo `tabBarIcon` thì component custom sẽ không bao giờ render dù code viết đúng, vì không ai gọi nó.

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

## 2026-07-28: Ôn tập qua bài tập debug có chủ đích (3 vòng, 10 bug)

### 1. Debounce cleanup — vì sao `return clearTimeout(id)` sai hoàn toàn

- `useEffect` yêu cầu giá trị `return` (nếu có) phải là **1 function**, để React tự gọi đúng lúc cleanup (trước khi effect chạy lại, hoặc lúc unmount) — không phải kết quả của việc gọi 1 function khác.
- `clearTimeout(timeoutId)` là 1 lệnh **thực thi ngay lập tức**, trả về `undefined`. Viết `return clearTimeout(timeoutId)` nghĩa là hủy timer **ngay khi effect vừa chạy xong**, trước khi nó kịp đếm được mili giây nào — kết quả: gõ bao nhiêu ký tự cũng không bao giờ gọi được API, vì timer nào cũng "chết yểu" ngay lập tức.
- `return () => clearTimeout(timeoutId)` mới đúng: đây là **định nghĩa** 1 function (chưa chạy), React giữ lại và chỉ gọi nó đúng lúc cần — mỗi lần `searchQuery` đổi tiếp, timer cũ bị hủy trước khi tạo timer mới; chỉ timer **cuối cùng** (sau khi ngừng gõ đủ 500ms) sống sót đủ lâu để thực sự gọi API.

### 2. `?.` (optional chaining) vs `!` (non-null assertion) — 2 vai trò hoàn toàn khác nhau

- `?.` có tác dụng **runtime thật sự**: nếu giá trị bên trái là `null`/`undefined`, biểu thức tự trả về `undefined` thay vì crash — đây là phần **thực sự ngăn lỗi**.
- `!` **không sinh ra code JS nào cả** lúc runtime (biến mất hoàn toàn khi compile) — nó chỉ là lời "nói dối" với TypeScript lúc biên dịch: _"tin tôi đi, giá trị này chắc chắn không null, đừng báo lỗi type nữa"_. Nếu nói dối sai, runtime vẫn chạy y như không có `!`, nhưng compiler đã bị tắt tiếng cảnh báo đúng ngay chỗ có thể cứu bạn sau này.
- Bài học: dùng `shows?.length!` chỉ là "lách" qua 1 điểm lỗi type cụ thể, không phải fix gốc. Fix gốc là xử lý `null` **1 lần duy nhất tại nguồn** (`const shows = showsRaw ?? []`), để mọi chỗ dùng `shows` về sau tự nhiên an toàn mà không cần nhớ thêm `?.`/`!` ở từng nơi.
- Lưu ý khi dùng `??`: vế phải phải là giá trị **thay thế thật sự có ý nghĩa** (VD `[]` cho mảng rỗng), viết `showsRaw ?? null` là vô nghĩa — không thay đổi gì so với không viết `??`, vì kết quả vẫn có thể là `null`.

### 3. Sửa "ở nơi gọi" (patch triệu chứng) vs sửa "ở định nghĩa" (fix gốc) — nguyên tắc chung

- Khi 1 component/hàm được dùng lại ở **nhiều nơi**, luôn ưu tiên xử lý optional/default **1 lần duy nhất tại định nghĩa**, thay vì rải rác sửa tại từng chỗ gọi.
- Ví dụ 1 (`SearchBar`): đặt `value?: string` (optional) ngay tại `interface Props` — component tự chịu trách nhiệm khi không có `value` (tự coi như uncontrolled input). Nếu thay vào đó bắt buộc `value: string` rồi tự thêm `value=""` ở từng nơi gọi, mỗi màn hình mới sau này lại phải tự nhớ thêm dòng đó — gánh nặng "phải nhớ" bị đẩy ra khắp nơi.
- Ví dụ 2 (`fetchShows`): thêm `= {}` ngay tại chữ ký hàm (`{ query }: { query?: string } = {}`) để `fetchShows()` gọi trống hợp lệ ở **mọi nơi gọi**, thay vì tự thêm `fetchShows({})` tại từng chỗ gọi riêng lẻ.
- Câu hỏi tự kiểm tra: "Nếu tôi sửa ở đây, có phải nhớ lặp lại y hệt ở mọi nơi khác dùng cái này không?" Nếu có → nên tìm cách sửa tại định nghĩa (nguồn) thay vì tại nơi gọi.

### 4. Khi nào 1 tham số nên là optional?

- Quy tắc: hỏi "nếu người gọi không truyền, có 1 giá trị mặc định _hợp lý về mặt ý nghĩa_ không?" Có → optional. Không → bắt buộc.
- VD `SearchBar`'s `placeholder` bắt buộc (không có placeholder mặc định hợp lý, mỗi màn hình cần text khác nhau), nhưng `value`/`onChangeText` optional (có "chế độ mặc định" hợp lý: uncontrolled input).
- VD `fetchShows`'s `query` optional vì thiếu nó có nghĩa rõ ràng: "lấy danh sách chung, không search gì cả".

### 5. Object argument pattern — khi nào cần, khi nào cần thêm `= {}`

- Đây là **2 quyết định độc lập nhau**, dễ nhầm là 1:
  - Quyết định A — có nên bọc tham số trong object (`{ query }: { query?: string }`) thay vì truyền trực tiếp (`query?: string`)? Lợi ích: gọi theo tên thay vì vị trí, dễ thêm field mới sau này (VD thêm `page`, `embed`) mà không lo nhầm thứ tự tham số ở các chỗ gọi cũ.
  - Quyết định B — nếu đã chọn object argument, có cần thêm `= {}` cho cả object không? Chỉ cần khi **mọi field bên trong đều optional** VÀ muốn cho phép gọi hàm() không truyền gì cả. Nếu object có ít nhất 1 field bắt buộc, không cần `= {}` vì TypeScript đã tự chặn việc gọi trống rồi (thêm `= {}` lúc đó vô nghĩa).
- Với chỉ 1 tham số optional duy nhất, cả 2 cách (tham số trực tiếp vs object argument) đều hoạt động đúng — chọn object argument chủ yếu để **phòng thủ cho việc mở rộng tương lai** (thêm tham số mới dễ dàng, không phá vỡ chỗ gọi cũ), không phải bắt buộc về mặt kỹ thuật ngay lúc này.

### 6. Kỹ thuật debug thực tế: đọc stack trace → tìm dòng gây lỗi → log giá trị thật → đối chiếu docs/response

- Khi gặp lỗi kiểu "Cannot read property 'x' of undefined", bước đầu tiên là tìm chính xác dòng code nào gọi `.x` (dùng `grep`/tìm trong file), không đoán mò.
- Bước tiếp theo: đặt `console.log` ngay trước dòng lỗi để in ra giá trị thật, so sánh với những gì mình _tưởng_ nó sẽ là — đặc biệt quan trọng khi làm việc với API có response shape lồng nhau (VD TVmaze search trả `{ score, show }`, không phải `show` phẳng).
- Bài học nhắc lại từ buổi trước: đọc property không tồn tại trên object không throw lỗi ngay, chỉ trả `undefined` im lặng — lỗi thường "nổ" ở 1 bước xa hơn (VD gọi `.toString()` trên `undefined`), nên cần lần theo ngược từ điểm nổ lỗi về tận nguồn dữ liệu để tìm đúng root cause.

### 7. Cập nhật quy tắc học tập (đã thêm vào AGENTS.md)

- Từ nay, khi gặp đoạn code/TODO có concept/pattern MỚI (không chỉ khi mắc lỗi), AI cần chủ động: liệt kê tên concept trước → cho ví dụ minh hoạ + giải thích tại sao pattern tồn tại + trade-off → dẫn nguồn tài liệu chính thức (React Native docs, React docs, Expo docs) → rồi mới đưa TODO để tự viết code.
- Mục tiêu: học không chỉ qua debug lỗi đã mắc, mà chủ động nhận diện pattern ngay cả khi code không có bug, hướng tới khả năng tự tin viết clean code, tối ưu, và tự guide AI xây dựng app scalable.

## 2026-07-31 — 2026-08-01: Bug-injection debug practice, Appwrite Trending Searches, ?? vs &&

### 1. Ôn tập debug qua bug-injection (4 bug, tách branch riêng)

- Trước khi cài bug thực hành, luôn commit checkpoint code hiện tại vào main trước — tránh lẫn lộn giữa "bug cố ý" và "thay đổi thật" khi diff/revert sau này.
- Tạo 1 branch riêng (practice/debug-session-2) chỉ để chứa bug thực hành, không đụng main — nếu commit luôn (kể cả trên branch practice) sẽ an toàn hơn để tránh mất khi lỡ tay git checkout -- . (discard).
- 4 bug thực hành: sai query param (?q= vs ?query= không khớp docs TVmaze thật), quên setLoading(false) trong finally (loading treo mãi), điều kiện ListEmptyComponent bị đảo ngược (!loading → loading), thiếu ?? 0 khi rating.average có thể null.
- Bài học chung: bug thực tế thường không "báo lỗi đỏ ngay" — nhiều bug chỉ lộ khi thao tác đúng luồng cụ thể (search có chữ, gõ debounce, cuộn tới show có rating null...), nên cần cả tsc --noEmit (bắt lỗi type ngay) LẪN test thủ công trên app thật (bắt lỗi logic/runtime).

### 2. .env và .gitignore — vì sao không nên commit file .env dù chỉ chứa giá trị "public"

- .gitignore mặc định của dự án chỉ ignore .env*.local, KHÔNG ignore .env thường — dễ vô tình commit nhầm nếu không kiểm tra kỹ trước khi git add -A.
- Dù giá trị bên trong (project ID, endpoint) không phải secret key bí mật, vẫn nên giữ thói quen không commit .env — để dễ đổi giá trị theo từng máy/môi trường mà không phải sửa qua git, và tránh thói quen xấu lan sang lúc thêm biến thật sự nhạy cảm sau này.
- Quy trình đúng: sửa .gitignore (thêm .env) TRƯỚC khi git add, không phải sau — nếu file đã lỡ được git add, cần git reset <file> để bỏ ra khỏi staging trước khi gitignore có tác dụng.

### 3. Appwrite Databases — CRUD cơ bản cho tính năng "Trending Searches"

- Client (kết nối) và Databases (thao tác dữ liệu) là 2 class tách riêng trong Appwrite SDK — mọi service (Databases, Storage, Account...) đều nhận chung 1 client đã khởi tạo, không cần tạo lại connection cho từng service.
- Query.equal("field", value) — cách "khai báo" (declarative) để lọc dữ liệu, thay vì raw query string — giúp SDK tự validate cú pháp và hoạt động nhất quán trên nhiều ngôn ngữ/nền tảng khác nhau.
- ID.unique() — sinh ID ngẫu nhiên khi tạo mới document; KHÔNG dùng khi update (update cần ID đã tồn tại, lấy từ field đặc biệt $id mà Appwrite tự sinh cho mọi document, không phải field id tự đặt).
- Pattern "upsert" (update nếu đã có, insert nếu chưa): listDocuments với Query.equal để tìm trước → nếu có kết quả thì updateDocument, không có thì createDocument. Đây là pattern nghiệp vụ chung, không phải API riêng của Appwrite.

### 4. Field name mismatch giữa các "hệ thống" khác nhau — lỗi dễ mắc nhất buổi này

- Xảy ra 2 lần liên tiếp: interface Show (đại diện response TVmaze thật) và interface TrendingShow (đại diện document Appwrite) dùng tên field khác nhau cho cùng khái niệm "tên show" — Show.name (đúng theo TVmaze) vs cột Appwrite title (do tự đặt tên cột lúc tạo collection).
- Bug thực tế xảy ra khi vô tình đổi field ở SAI interface (đổi name→title trong Show thay vì trong TrendingShow) — TypeScript compile sạch (vì nó chỉ tự kiểm tra tính nhất quán NỘI BỘ giữa các file, không biết response thật của TVmaze API có field gì), nhưng runtime sẽ luôn nhận undefined vì field đó không tồn tại trong response thật.
- Bài học cốt lõi: khi 2 hệ thống khác nhau biểu diễn cùng 1 khái niệm bằng field name khác nhau, không nên đổi field ở phía "nguồn dữ liệu thật" (ở đây là Show, phải khớp đúng TVmaze) — chỉ nên "dịch" (map) field tại đúng 1 điểm chuyển giao (VD title: show.name khi lưu vào Appwrite trong updateSearchCount), giữ nguyên field gốc ở khắp nơi còn lại.
- tsc --noEmit pass không đồng nghĩa code đúng — chỉ đảm bảo tính nhất quán kiểu dữ liệu bên trong codebase, không đảm bảo interface khớp với shape thật của dữ liệu bên ngoài (API response, database schema).

### 5. ?? (nullish coalescing) vs && (logical AND) — khi nào dùng cái nào

- Câu hỏi tự kiểm tra: "Tôi đang muốn LẤY RA 1 GIÁ TRỊ để dùng tiếp, hay đang muốn QUYẾT ĐỊNH có render JSX hay không?" → lấy giá trị (có thể null/undefined) dùng ??; điều kiện render dùng && (hoặc ternary nếu có nhánh else khác).
- ?? chỉ nhảy sang vế phải khi vế trái là chính xác null hoặc undefined — KHÔNG áp dụng cho các giá trị falsy khác (0, "", false, NaN). Đây là lý do ?? ra đời: phân biệt "giá trị hợp lệ nhưng falsy" với "thực sự không có giá trị".
- && dùng short-circuit evaluation: nếu vế trái falsy (mọi loại falsy, không chỉ null/undefined) thì dừng lại và trả về CHÍNH vế trái đó (không đánh giá vế phải); chỉ khi vế trái truthy mới tiếp tục trả về vế phải.
- Bug thực tế gặp phải: viết (trendingShows && trendingShows.length > 0) ?? (JSX) — vế trái luôn ra true/false/undefined, không bao giờ ra null, nên ?? gần như không bao giờ "nhảy phải" đúng lúc mong muốn (logic bị đảo ngược hoàn toàn so với ý định). Sửa đúng: dùng toàn bộ && nối chuỗi (a && b && (JSX)), không trộn ?? vào giữa các điều kiện boolean.
- Cú pháp: JavaScript/TypeScript cấm viết trực tiếp a && b ?? c không có ngoặc (SyntaxError) — vì độ ưu tiên giữa 2 toán tử dễ gây hiểu nhầm, buộc phải tự thêm ngoặc rõ ràng nếu thật sự cần trộn cả 2 trong 1 biểu thức.

### 6. Props "phẳng" (flat) vs "gói" (wrapped) — vì sao có component spread được, có component thì không

- ShowCard nhận props kiểu Show (phẳng — mỗi field của Show là 1 prop riêng) → gọi được bằng spread: <ShowCard {...item} />.
- TrendingCard nhận TrendingCardProps (gói — chỉ 2 field show và index, trong đó show chứa nguyên object TrendingShow lồng bên trong) → không spread trực tiếp {...item} được, vì shape props không khớp 1-1 với item; phải gọi tường minh <TrendingCard show={item} index={index} />.
- Lý do gốc rễ không chỉ vì "có thêm field index" — là vì 2 component chọn 2 kiểu thiết kế props khác nhau. Nếu muốn spread được kể cả khi có thêm field ngoài, cần đổi props sang kiểu phẳng và dùng intersection type (TrendingShow & { index: number }) — & nghĩa là "1 object phải thỏa mãn ĐỒNG THỜI cả 2 type cộng lại", khác với union | ("1 trong 2 type").
- Trong thực tế, cách viết tường minh (show={item} index={index}) thường dễ đọc hơn cách cố "làm phẳng" rồi spread — nhất là khi props có ý nghĩa nhóm rõ ràng (1 object show + 1 số index riêng biệt, không phải cùng 1 "loại" dữ liệu).

## 2026-08-01 — 2026-08-03: Bug-injection ôn tập diện rộng (4 vòng, 12+ bug) + tính năng Save Show

### 1. Ôn tập diện rộng qua bug-injection có chủ đích (4 vòng)

- 4 vòng bug tách theo chủ đề: (1) data fetching & hooks (useCallback memoization, debounce, response shape mapping), (2) rendering/list patterns (ListEmptyComponent, render prop tabBarIcon, xử lý null trong ShowCard), (3) component composition & data-shape (flat vs wrapped props, spread operator), (4) navigation/routing (useFocusEffect refetch, route name mismatch, useLocalSearchParams).
- Bug thật phát sinh ngoài kế hoạch (không do cố ý cài) vẫn có thể lộ ra giữa lúc ôn tập: lỗi "Encountered two children with the same key" trong FlatList trending — do dùng show_id (không unique tuyệt đối, vì cùng 1 show có thể được search bằng nhiều từ khóa khác nhau, tạo nhiều document) làm keyExtractor thay vì $id (ID document Appwrite tự sinh, luôn unique tuyệt đối).
- Một số bug chỉ báo lỗi TypeScript ngay lúc chạy type check (VD field mismatch giữa các file, kiểu tham số sai — bug ở Vòng 3, 4), một số bug khác hoàn toàn "im lặng" với TypeScript và chỉ lộ ra khi test runtime thủ công (VD thiếu debounce, quên useCallback, mất useFocusEffect — bug ở Vòng 1, 2). Bài học: kiểm tra type là cần thiết nhưng không đủ, luôn phải kết hợp test tay trên app thật.

### 2. Optional chaining chỉ ngăn crash, không tự tạo fallback UX

- Truy cập field lồng bằng optional chaining khi giá trị gốc là null sẽ trả về undefined — React tự hiểu render undefined là "không render gì", nghĩa là không crash app, nhưng để lại 1 khoảng trống vô nghĩa trên UI (không phải "N/A" hay placeholder có nghĩa).
- Muốn có UX tốt hơn (hiện chữ có ý nghĩa khi giá trị null), cần thêm tầng xử lý thứ 2: nullish coalescing hoặc logical OR để có giá trị mặc định hợp lý. Đây là 2 quyết định tách biệt: "ngăn crash" và "tạo fallback có ý nghĩa".

### 3. Async wrapper pattern trong useEffect — tên gọi và lý do tồn tại

- React quy định callback truyền vào useEffect không được là async trực tiếp — vì async function luôn tự động trả về Promise, vi phạm quy tắc "effect callback chỉ được trả về undefined hoặc 1 cleanup function".
- Giải pháp chuẩn (khuyến nghị bởi chính React docs): định nghĩa 1 async function riêng bên trong effect, rồi gọi nó ngay lập tức — gọi là "async function wrapper" pattern.
- Debounce (đã học buổi trước) và async wrapper là 2 pattern độc lập, có thể chồng lên nhau: debounce lo phần "trì hoãn gọi", async wrapper lo phần "được phép gọi async bên trong effect". Màn Search cần cả 2 (vì phải trì hoãn + phải gọi API async); màn ShowDetails chỉ cần async wrapper (không cần trì hoãn vì không có sự kiện dồn dập).
- Cấu trúc đầy đủ khi cần cả 2 tầng: effect ngoài cùng bọc setTimeout (tầng debounce delay) bọc 1 async function tự gọi (tầng async wrapper) — cleanup (clearTimeout) luôn return ra ở tầng effect ngoài cùng, không phải return ra khỏi callback bên trong setTimeout.

### 4. Hook Rules — vì sao thứ tự đặt Hook trong component quan trọng tuyệt đối

- React yêu cầu mọi Hook phải được gọi theo đúng số lượng và đúng thứ tự ở mọi lần render — không được đặt sau bất kỳ điều kiện return nào.
- Hệ quả thực tế khi vi phạm: lần render đầu (VD đang loading, hàm return sớm trước khi chạy tới Hook) → Hook đó không được gọi; lần render sau (data đã về, không còn return sớm) → Hook đó được gọi. Số Hook gọi được lệch nhau giữa 2 lần render → React throw lỗi runtime "Rendered more/fewer hooks than during the previous render", không phải lỗi kiểu dữ liệu nên type check không bắt được.
- Thứ tự đúng bắt buộc: khai báo toàn bộ Hook trước, rồi mới tới các early-return có điều kiện (loading, error, thiếu data).

### 5. Kịch bản đọc lỗi kiểu dữ liệu lặp lại được (khi gặp thông báo "Type X is not assignable to type Y")

- Bước 1: đọc đúng dòng/cột trình biên dịch chỉ ra, mở đúng vị trí đó, không đọc lướt cả file.
- Bước 2: xác định rõ 2 vế trong thông báo lỗi — X là giá trị đang có/đang truyền vào, Y là kiểu nơi nhận mong đợi.
- Bước 3: tự hỏi X đến từ đâu (hàm nào trả về, biến nào khai báo) và Y được khai ở đâu (interface, tham số hàm, khai báo state).
- Bước 4: chọn sửa ở 1 trong 2 nơi — hoặc đổi giá trị truyền vào cho khớp Y, hoặc mở rộng Y cho khớp X thực tế — không phải lúc nào "cho phép null" cũng là hướng đúng, cần xem Y có ý nghĩa thực sự là gì.
- Ví dụ thực tế đã gặp: lỗi kiểu Promise không gán được cho SetStateAction boolean → do quên await trước khi gọi setState, không phải do thiếu xử lý null trong kiểu dữ liệu.

### 6. Existence-based pattern cho tính năng "Save/Unsave" (khác Trending upsert)

- 2 pattern khác nhau cho 2 nhu cầu khác nhau: Upsert (update nếu có, tạo mới nếu chưa — dùng khi cần tích lũy dữ liệu, VD tăng count mỗi lần search cùng từ khóa) vs Existence-based toggle (document tồn tại = trạng thái "on", xóa hẳn document = trạng thái "off" — dùng khi hành động là bật/tắt 2 chiều, VD Save/Unsave).
- Cân nhắc khi chọn boolean flag (giữ document mãi mãi, chỉ đổi giá trị field) so với existence-based (xóa hẳn khi tắt): boolean flag giữ được lịch sử "từng bật rồi tắt" nhưng tích lũy rác theo thời gian; existence-based gọn hơn, không cần field thừa, nhưng mất lịch sử đó.
- Field dùng để lọc tồn tại nên có kiểu khớp đúng với dữ liệu gốc (number, giống field id từ TVmaze) — khai sai kiểu tham số hàm (string thay vì number) không bị type check bắt lỗi ngay nếu hàm đó chưa được gọi ở đâu cả, chỉ lộ ra khi thực sự có nơi gọi truyền giá trị thật vào.

### 7. Optimistic update — đánh đổi UX nhanh vs độ chính xác UI

- Optimistic update: đổi UI ngay lập tức (tin tưởng request sẽ thành công) trước khi đợi kết quả thật từ server — ưu điểm là UI phản hồi tức thì, cảm giác mượt.
- Rủi ro: nếu request thất bại (mất mạng, lỗi server), UI đã đổi trạng thái trước đó có thể "nói dối", không còn khớp với dữ liệu thật trên server.
- Lựa chọn thay thế an toàn hơn (đã áp dụng cho nút Save): đợi request xong rồi mới cập nhật state UI — đảm bảo UI luôn khớp thật, đổi lại phản hồi chậm hơn 1 chút (thời gian round-trip tới Appwrite).
