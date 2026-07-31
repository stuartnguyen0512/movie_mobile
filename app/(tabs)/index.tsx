import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import SearchBar from "@/components/SearchBar";
import { useRouter } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchShows } from "@/services/api";
// TODO 1: Bỏ comment dòng import bên dưới sau khi ShowCard viết xong
import ShowCard from "@/components/ShowCard";

export default function Index() {
  const router = useRouter();
  const {
    data: shows,
    loading: showsLoading,
    error: showsError,
  } = useFetch(() => fetchShows());

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        {/* HACK: if isloading = true => indicator 
                  if errors => return error message 
                  else return search view*/}

        {showsLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : showsError ? (
          <Text className="text-yellow-400">Error: {showsError?.message}</Text>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => router.push("/search")}
              placeholder="Search for a show"
            />
            <>
              <Text className="text-lg size-5 font-bold mt-5 mb-3">
                Latest Shows
              </Text>
              <FlatList
                data={shows}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                scrollEnabled={false}
                // ────────────────────────────────────────────────────
                // TODO 2: Viết renderItem cho FlatList
                //
                // FlatList tự động gọi function này cho TỪNG phần tử
                // trong mảng "data", tự truyền vào { item }.
                //
                // Việc cần làm: return JSX <ShowCard {...item} /> để
                // hiển thị show đó. Dùng spread operator {...item} để
                // bung 1 show object thành các props rời (id, name,
                // image, rating, premiered...) khớp với cách ShowCard
                // khai báo destructuring props.
                // ────────────────────────────────────────────────────

                renderItem={({ item }) => <ShowCard {...item} />}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10,
                }}
                className="mt-2 pb-32"
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
