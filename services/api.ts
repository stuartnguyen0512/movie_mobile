// ────────────────────────────────────────────────────────────
// TODO 1: Khai báo base URL của TVmaze
// https://api.tvmaze.com
// ────────────────────────────────────────────────────────────
const BASE_URL = "https://api.tvmaze.com";

// ────────────────────────────────────────────────────────────
// TODO 2: Viết function fetchShows
// Mục đích: lấy danh sách show hiển thị ở Home screen
// (dùng thay cho endpoint "popular movies" của TMDB, vì
// TVmaze không có khái niệm "popular" — dùng /shows?page=0
// là danh sách toàn bộ show, phân trang).
//
// Nhận vào (optional): query?: string
//   - Nếu có query -> gọi endpoint search:
//       GET /search/shows?q=:query
//   - Nếu không có query -> gọi endpoint show index:
//       GET /shows?page=0
//
// Lưu ý quan trọng về response shape:
//   - /shows?page=0        -> trả về mảng show object trực tiếp
//   - /search/shows?q=...  -> trả về mảng { score, show } —
//     show thật nằm trong field con "show", cần .map() lấy ra
//
// Trả về: Promise<Show[]> (kiểu Show mình đã đổi tên trong
// interfaces/interfaces.d.ts)
//
// Gợi ý các bước bên trong function:
//   1. Dựng URL dựa theo có/không có query
//   2. fetch(url)
//   3. Kiểm tra response.ok, nếu không throw Error
//   4. response.json()
//   5. Nếu là kết quả search, .map() để lấy show ra khỏi từng
//      phần tử { score, show }
//   6. return kết quả
// ────────────────────────────────────────────────────────────

export async function fetchShows({ query }: { query?: string } = {}): Promise<
  Show[]
> {
  const endpoint = query
    ? `${BASE_URL}/search/shows?q=${query}`
    : `${BASE_URL}/shows?page=0`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Failed to fetch shows: ${response.statusText}`);
  }

  const data = await response.json();

  if (query) {
    const results = data.map((items: any) => items.show).slice(0, 20);
    return results;
  }
  return data.slice(0, 20);
}

// ────────────────────────────────────────────────────────────
// TODO 3: Viết function fetchShowDetails
//
// Mục đích: lấy chi tiết 1 show cho trang app/shows/[id].tsx
//
// Nhận vào: id: string
// Gọi endpoint: GET /shows/:id
// (optional nâng cao: thêm ?embed=cast để lấy luôn cast trong
// cùng 1 request, xem lại phần "Embedding" trong docs TVmaze)
//
// Trả về: Promise<ShowDetails>
// ────────────────────────────────────────────────────────────
export async function fetchShowDetails(showId: string): Promise<ShowDetails> {
  try {
    const response = await fetch(`${BASE_URL}/shows/${showId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch show details: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching show details: ", error);
    throw error;
  }
}
