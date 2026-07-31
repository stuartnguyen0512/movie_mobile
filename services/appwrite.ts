// ────────────────────────────────────────────────────────────
// TODO 1: Import Client từ "react-native-appwrite"
// ────────────────────────────────────────────────────────────
import { Client } from "react-native-appwrite";
// ────────────────────────────────────────────────────────────
// TODO 2: Tạo và export 1 instance Client như biến "global"
// (singleton pattern — xem giải thích ở phần chat trước TODO này)
//
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;

if (!PROJECT_ID || !APPWRITE_ENDPOINT) {
  throw new Error("Missing Appwrite env vars — check your .env file");
}
// Dùng đúng project details đã cho:
//   - setProject("6a64e3b5001204221384")
//   - setEndpoint("https://tor.cloud.appwrite.io/v1")
const client = new Client()
  .setProject(PROJECT_ID)
  .setEndpoint(APPWRITE_ENDPOINT);

export default client;
