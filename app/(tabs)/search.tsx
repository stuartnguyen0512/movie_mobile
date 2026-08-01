import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, FlatList, Image } from "react-native";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

import useFetch from "@/services/useFetch";
import { fetchShows } from "@/services/api";

import SearchBar from "@/components/SearchBar";
import ShowCard from "@/components/ShowCard";

import { updateSearchCount } from "@/services/appwrite";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: shows = [],
    loading,
    error,
    refetch: loadShows,
    reset,
  } = useFetch(() => fetchShows({ query: searchQuery }), false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

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

  useEffect(() => {
    if (shows?.length! > 0) {
      updateSearchCount(searchQuery, shows![0]);
    }
  }, [shows]);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />
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
