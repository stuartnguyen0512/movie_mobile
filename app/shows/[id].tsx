import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useFetch from "@/services/useFetch";
import { fetchShowDetails } from "@/services/api";
import { icons } from "@/constants/icons";
import { useEffect, useState } from "react";
import { isShowSaved, toggleSavedShow } from "@/services/appwrite";

interface ShowInfoProps {
  label: string;
  value?: string | number | null;
}

const ShowInfo = ({ label, value }: ShowInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);
const ShowDetails = () => {
  const { id } = useLocalSearchParams();
  const [isSaved, setIsSaved] = useState(false);

  const {
    data: show,
    loading,
    error,
  } = useFetch(() => fetchShowDetails(id as string));

  useEffect(() => {
    if (!show) return;
    const checkSaved = async () => {
      const result = await isShowSaved(show.id);
      setIsSaved(result ?? false);
    };
    checkSaved();
  }, [show]);

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1">
        <ActivityIndicator />
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView className="bg-primary flex-1 items-center justify-center px-5">
        <Text className="text-white text-center">{error.message}</Text>
      </SafeAreaView>
    );

  if (!show) return null;

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{ uri: show?.image?.medium }}
            className="w-full h-[550px]"
            resizeMethod="scale"
          />
          <TouchableOpacity className="absolute bottom-5 right-5 rounded-full size-14 bg-white flex items-center justify-center">
            <Image
              source={icons.play}
              className="w-6 h-7 ml-1"
              resizeMode="stretch"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await toggleSavedShow(show);
              setIsSaved((prev) => !prev);
            }}
            className="absolute bottom-5 right-24 rounded-full size-14 bg-white flex items-center justify-center"
          >
            <Image
              tintColor={isSaved ? "#2E6F40" : "#ffffff"}
              source={icons.save}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{show?.name}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {show?.premiered?.split("-")[0]} •
            </Text>
            <Text className="text-light-200 text-sm">{show?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />

            <Text className="text-white font-bold text-sm">
              {Math.round((show?.rating?.average ?? 0) / 2)}
            </Text>

            <Text className="text-light-200 text-sm">
              ({show?.weight} votes)
            </Text>
          </View>

          <ShowInfo label="Overview" value={show?.summary} />

          <View className="flex flex-row justify-between w-1/2">
            {/* <ShowInfo */}
            {/*   label="Budget" */}
            {/*   value={`$${(shows?.budget ?? 0) / 1_000_000} million`} */}
            {/* /> */}
            {/* <MovieInfo */}
            {/*   label="Revenue" */}
            {/*   value={`$${Math.round( */}
            {/*     (movie?.revenue ?? 0) / 1_000_000, */}
            {/*   )} million`} */}
            {/* /> */}
          </View>

          {/* <ShowInfo */}
          {/*   label="Production Companies" */}
          {/*   value={ */}
          {/*     shows?.production_companies?.map((c) => c.name).join(" • ") || */}
          {/*     "N/A" */}
          {/*   } */}
          {/* /> */}
        </View>
      </ScrollView>
    </View>
  );
};

export default ShowDetails;
