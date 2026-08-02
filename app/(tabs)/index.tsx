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
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import useFetch from "@/services/useFetch";
import { fetchShows } from "@/services/api";
import ShowCard from "@/components/ShowCard";
import TrendingCard from "@/components/TrendingCard";
import { getTrendingShows } from "@/services/appwrite";

export default function Index() {
  const router = useRouter();
  const {
    data: shows,
    loading: showsLoading,
    error: showsError,
  } = useFetch(() => fetchShows());

  const { data: trendingShows, refetch: refetchTrending } = useFetch(
    useCallback(() => getTrendingShows(), []),
  );

  // Refetch trending shows mỗi khi Home screen lấy focus (user quay lại từ Search)
  useFocusEffect(
    useCallback(() => {
      refetchTrending();
    }, [refetchTrending]),
  );

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

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
              {trendingShows && trendingShows.length > 0 && (
                <View className="mt-10">
                  <Text className="text-lg text-white font-bold mb-3">
                    Trending Shows
                  </Text>
                  <FlatList
                    data={trendingShows}
                    keyExtractor={(item) => item.show_id.toString()}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View className="w-4" />}
                    contentContainerStyle={{ paddingRight: 20 }}
                    renderItem={({ item, index }) => (
                      <TrendingCard show={item} index={index} />
                    )}
                  />
                </View>
              )}
              <Text className="text-lg text-white font-bold mt-5 mb-3">
                Latest Shows
              </Text>
              <FlatList
                data={shows}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                scrollEnabled={false}
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
