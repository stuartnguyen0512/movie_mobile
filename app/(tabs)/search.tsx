import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, FlatList, Image } from "react-native";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

import useFetch from "@/services/useFetch";
import { fetchShows } from "@/services/api";

import SearchBar from "@/components/SearchBar";
import ShowCard from "@/components/ShowCard";

// NOTE: bỏ qua phần Appwrite (updateSearchCount) — project này chưa
// setup Appwrite backend, nên phần "Trending Searches" trong video sẽ
// không được implement ở đây.

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // ────────────────────────────────────────────────────────────
  // TODO 1: Gọi useFetch cho danh sách show theo searchQuery
  //
  // Dùng fetchShows({ query: searchQuery }) (đã viết sẵn ở bài
  // trước, hỗ trợ query optional).
  const {
    data: shows = [],
    loading,
    error,
    refetch: loadShows,
    reset,
  } = useFetch(() => fetchShows({ query: searchQuery }), false);
  // QUAN TRỌNG: truyền autoFetch = false (tham số thứ 2 của
  // useFetch) — vì lúc mới mở màn hình chưa có gì để search,
  // chỉ fetch khi user chủ động gõ (xem TODO 3 debounce).
  //
  // Lấy ra và đặt tên lại (destructure với ":") các field:
  //   data: shows = []       (default rỗng để khỏi check null liên tục)
  //   loading
  //   error
  //   refetch: loadShows
  //   reset
  // ────────────────────────────────────────────────────────────

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // ────────────────────────────────────────────────────────────
  // TODO 2: useEffect debounce search theo searchQuery
  //
  // Ý tưởng: mỗi khi searchQuery đổi, đặt 1 timer 500ms. Nếu
  // trong 500ms đó searchQuery đổi tiếp (user gõ thêm), timer cũ
  // phải bị hủy trước khi đặt timer mới — đây là lý do cleanup
  // function (return () => clearTimeout(...)) bắt buộc phải có.
  //
  // Logic bên trong timer:
  //   - nếu searchQuery.trim() có nội dung -> gọi loadShows()
  //   - nếu rỗng (user xóa hết chữ) -> gọi reset() để đưa list
  //     về trạng thái ban đầu, không hiện dữ liệu cũ
  //
  // Dependency array: [searchQuery] — effect chạy lại mỗi khi
  // searchQuery đổi (khác với useFetch dùng [] chỉ chạy 1 lần).
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    //   // create timeoutID
    const timeoutId = setTimeout(async () => {
      //     // check if user is searching
      if (searchQuery.trim()) {
        //       // call loadShows
        await loadShows();
        // reset if not
      } else reset();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-primary">
      {/* ──────────────────────────────────────────────────────
          TODO 3: Background image
          Image source={images.bg} className="flex-1 absolute w-full z-0"
          resizeMode="cover"
      ────────────────────────────────────────────────────────── */}
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />
      {/* ──────────────────────────────────────────────────────
          TODO 4: FlatList chính — đây là khung chứa TOÀN BỘ màn
          hình Search (logo, SearchBar, danh sách kết quả), dùng
          ListHeaderComponent + ListEmptyComponent thay vì lồng
          FlatList trong ScrollView (nhớ lại bài học về
          "VirtualizedLists should never be nested").

          Props cần có:
            className="px-5"
            data={shows}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ShowCard {...item} />}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "flex-start", gap: 16, marginVertical: 16 }}
            contentContainerStyle={{ paddingBottom: 100 }}

          ListHeaderComponent (JSX, dùng <> </> để nhóm nhiều phần tử):
            - View chứa logo (icons.logo), căn giữa, mt-20
            - View chứa SearchBar, truyền value={searchQuery} và
              onChangeText={handleSearch} (cần SearchBar đã hỗ trợ
              2 prop này — xem TODO ở components/SearchBar.tsx)
            - loading && <ActivityIndicator .../>
            - error && <Text>Error: {error.message}</Text>
            - Hiện tiêu đề "Search Results for <searchQuery>" CHỈ khi:
              !loading && !error && searchQuery.trim() && shows.length > 0
              (dùng shows.length thay vì shows?.length! nhờ default
              [] ở TODO 1, tránh phải dùng non-null assertion "!")

          ListEmptyComponent:
            - chỉ hiện khi !loading && !error, ngược lại trả về null
            - text tùy theo searchQuery.trim():
              có nội dung -> "No shows found"
              rỗng -> "Start typing to search for shows"
      ────────────────────────────────────────────────────────── */}
      <FlatList
        className="px-5"
        data={shows}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ShowCard {...item} />}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            {/* Logo */}
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10"></Image>
            </View>
            {/* SearchBar */}
            <View className="my-5">
              <SearchBar
                placeholder="Search for show"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
            {/* Loading Indicator */}
            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}
            {/* Error */}
            {error && (
              <Text className="text-red-500 px-5 my-3">
                Error: {error.message}
              </Text>
            )}
            {/* Show current searchQuery */}
            {!loading && !error && searchQuery.trim() && shows?.length! > 0 && (
              <Text className="text-xl text-white font-bold">
                Search Results for{" "}
                <Text className="text-accent">{searchQuery}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim()
                  ? "No shows found"
                  : "Start typing to search for shows"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
