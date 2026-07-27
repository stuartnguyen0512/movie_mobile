import "./global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="shows/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
