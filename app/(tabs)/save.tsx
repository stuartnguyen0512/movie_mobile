import { View, Text, ActivityIndicator, FlatList, Image } from "react-native";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

import SavedShowCard from "@/components/SavedShowCard";
import useFetch from "@/services/useFetch";
import { getSavedShows } from "@/services/appwrite";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";

const Save = () => {
  const {
    data: rawSavedShows,
    refetch: refetchSavedShows,
    loading,
    error,
  } = useFetch(useCallback(() => getSavedShows(), []));
  const savedShow = rawSavedShows ?? [];

  useFocusEffect(
    useCallback(() => {
      refetchSavedShows();
    }, [refetchSavedShows]),
  );

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />
      <FlatList
        className="px-5"
        data={savedShow}
        keyExtractor={(item: any) => item.$id}
        renderItem={({ item }) => <SavedShowCard {...item} />}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10"></Image>
            </View>
            <Text className="text-xl text-white font-bold mt-5 mb-3">
              Saved Shows
            </Text>
            {/* TODO 6: loading && <ActivityIndicator ... /> giống search.tsx */}
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="mt-10 self-center"
              />
            ) : error ? (
              <Text className="text-yellow-400">Error: {error?.message}</Text>
            ) : null}
          </>
        }
        ListEmptyComponent={
          // TODO 8: điều kiện !loading && !error, message rõ ràng khi
          // chưa lưu show nào (VD "No saved shows yet")
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                No saved shows yet
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Save;
