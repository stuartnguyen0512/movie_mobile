import { useState, useEffect } from "react";

// ────────────────────────────────────────────────────────────
// TODO 1: Khai báo generic function useFetch<T>
const useFetch = <T>(fetchFunction: () => Promise<T>, autoFetch = true) => {
  // Nhận vào 2 tham số:
  //   - fetchFunction: () => Promise<T>   (bắt buộc)
  //   - autoFetch: boolean = true          (optional, mặc định true)
  //
  // Nhắc lại: <T> là generic type, giúp hook này tái sử dụng được
  // cho mọi loại dữ liệu (Show[], ShowDetails, ...) mà TypeScript
  // tự suy ra dựa theo function truyền vào.
  // ────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────
  // TODO 2: Khai báo 3 state bằng useState
  //   - data: kiểu T | null, khởi tạo null
  //   - loading: kiểu boolean, khởi tạo false
  //   - error: kiểu Error | null, khởi tạo null
  // ────────────────────────────────────────────────────────────
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // ────────────────────────────────────────────────────────────
  // TODO 3: Viết function fetchData (async)
  //
  // Dùng try/catch/finally:
  //   - try:
  //       + setLoading(true)
  //       + setError(null)  (reset lỗi cũ trước khi gọi lại)
  //       + await fetchFunction() -> lưu kết quả vào data
  //       + setData(kết quả)
  //   - catch (err):
  //       + kiểm tra err có phải instance của Error không
  //         (err instanceof Error) để setError đúng kiểu,
  //         nếu không thì tạo Error mới với message mặc định
  //   - finally:
  //       + setLoading(false)
  //         (đảm bảo loading luôn tắt dù thành công hay lỗi)
  // ────────────────────────────────────────────────────────────
  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occured"),
      );
    } finally {
      setLoading(false);
    }
  }
  // ────────────────────────────────────────────────────────────
  // TODO 4: Viết function reset
  // Đưa cả 3 state (data, error, loading) về trạng thái ban đầu
  // (data -> null, error -> null, loading -> false)
  // ────────────────────────────────────────────────────────────
  function reset() {
    setLoading(false);
    setData(null);
    setError(null);
  }
  // ────────────────────────────────────────────────────────────
  // TODO 5: Dùng useEffect để tự động gọi fetchData khi component
  // mount, nhưng chỉ khi autoFetch === true.
  //
  // Lưu ý: dependency array để rỗng [] -> effect chỉ chạy 1 lần
  // duy nhất lúc component mount, không chạy lại sau đó.
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, []);
  // ────────────────────────────────────────────────────────────
  // TODO 6: Return 1 object gồm:
  return { data, loading, error, refetch: fetchData, reset };
  //
  // Lưu ý: bên ngoài sẽ gọi hook này như:
  //   const { data, loading, error, refetch } = useFetch(...)
  // nên tên field trong object return phải khớp chính xác.
};

// ────────────────────────────────────────────────────────────
// TODO 7: export default hook của bạn
export default useFetch;
