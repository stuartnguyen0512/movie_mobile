import "./global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { client } from "@/services/appwrite";

export default function RootLayout() {
  // ────────────────────────────────────────────────────────────
  // TODO: Gọi client.ping() đúng 1 lần khi app khởi động, để
  // verify kết nối Appwrite (xem giải thích "app entrypoint /
  // side-effect on mount" ở phần chat trước TODO này).
  //
  // Gợi ý: dùng useEffect với dependency array rỗng [] — giống
  // hệt cách useFetch tự fetch 1 lần lúc mount.
  // ────────────────────────────────────────────────────────────
  // Đã verify kết nối Appwrite thành công (log ra "Pong") — comment
  // lại để không ping mỗi lần app khởi động, tránh gọi API dư thừa.
  // useEffect(() => {
  //   const api1 = () => client.ping();
  //   api1()
  //     .then((result) => {
  //       console.log(result);
  //       // You may want to do setState here as well
  //     })
  //     .catch((error) => {
  //       // do something when you encounter errors
  //       console.log({ error });
  //     });
  // }, []);
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="shows/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
