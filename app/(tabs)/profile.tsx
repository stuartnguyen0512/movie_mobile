import { View, Text, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

import useFetch from "@/services/useFetch";
import { getSavedShows } from "@/services/appwrite";

const Profile = () => {
  // TODO 3: gọi useFetch(getSavedShows) để lấy data/loading/error
  const {
    data: rawSavedShows,
    loading,
    error,
  } = useFetch(() => getSavedShows(), true);
  // TODO 4: xử lý null giống save.tsx — rawSavedShows ?? []
  const savedShows = rawSavedShows ?? [];
  // TODO 5: tính totalSaved = savedShows.length
  const totalSaved = savedShows.length;

  // TODO 6: tính averageRating
  //   - reduce cộng dồn rating của các show có rating khác null
  //   - chia cho SỐ LƯỢNG show có rating hợp lệ (không phải chia cho
  //     totalSaved, vì có thể có show rating = null không nên tính vào
  //     mẫu số)
  //   - làm tròn 1 chữ số thập phân cho dễ đọc (Math.round(x * 10) / 10)
  const calAverageRating = () => {
    let count = 0;
    const totalRating = savedShows.reduce((acc, item) => {
      if (item.rating) {
        count = count + 1;
        return acc + item.rating;
      }
      return acc;
    }, 0);

    const avgRating = totalRating / count;

    return Math.round(avgRating * 10) / 10;
  };
  const averageRating = calAverageRating();

  // TODO 7: tính topGenre
  //   - đếm tần suất từng genre xuất hiện trong toàn bộ savedShows
  //     (mỗi show có genres: string[] | null — 1 show có thể có nhiều
  //     genre, mỗi genre trong đó cộng 1 vào bộ đếm của riêng nó)
  //   - lấy ra genre có count cao nhất
  //   - xử lý trường hợp chưa có show nào / không có genre nào
  const retrieveTopGenres = () => {
    let maxCount = 0;
    let topGenre = "";
    for (const savedShow of savedShows) {
      if (savedShow.genres) {
        const counterGenres: Record<string, number> = savedShow.genres?.reduce(
          (acc, genre) => {
            acc[genre] = (acc[genre] ?? 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        for (const [genre, count] of Object.entries(counterGenres)) {
          if (count > maxCount) {
            maxCount = count;
            topGenre = genre;
          }
        }
      }
    }
    return topGenre;
  };

  const topGenre = retrieveTopGenres();
  return (
    <SafeAreaView className="bg-primary flex-1">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />
      <View className="flex-1 items-center px-5">
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5" />
        <Text className="text-xl text-white font-bold mb-8">Your Stats</Text>
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text className="text-yellow-400">Error: {error?.message}</Text>
        ) : null}
        {!loading && !error && (
          <View className="w-full gap-y-4">
            <View className="bg-dark-100 rounded-xl px-5 py-4 flex-row items-center justify-between">
              <Text className="text-light-200 text-sm">Saved Shows</Text>
              <Text className="text-white text-lg font-bold">
                {/* TODO 10: {totalSaved} */}
                {totalSaved}
              </Text>
            </View>
            <View className="bg-dark-100 rounded-xl px-5 py-4 flex-row items-center justify-between">
              <Text className="text-light-200 text-sm">Average Rating</Text>
              <View className="flex-row items-center gap-x-1">
                <Image source={icons.star} className="size-4" />
                <Text className="text-white text-lg font-bold">
                  {/* TODO 11: {averageRating} — nhớ fallback khi chưa có
                show nào có rating (VD "N/A") */}
                  {savedShows.length > 0 ? averageRating : "N/A"}
                </Text>
              </View>
            </View>
            <View className="bg-dark-100 rounded-xl px-5 py-4 flex-row items-center justify-between">
              <Text className="text-light-200 text-sm">Top Genre</Text>
              <Text className="text-white text-lg font-bold">
                {/* TODO 12: {topGenre} — nhớ fallback khi chưa có genre nào
              (VD "N/A") */}
                {savedShows.length > 0 ? topGenre : "N/A"}
              </Text>
            </View>
          </View>
        )}
        {savedShows.length === 0 && (
          <Text>Save some shows to see your stats</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Profile;
