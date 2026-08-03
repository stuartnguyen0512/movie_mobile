import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View } from "react-native";
import { images } from "@/constants/images";

const TrendingCard = ({ show, index }: TrendingCardProps) => {
  return (
    <Link href={`/shows/${show.show_id}`} asChild>
      <TouchableOpacity className="w-32 relative pl-5">
        <Image
          source={{ uri: show.poster_url }}
          className="w-32 h-48 rounded-lg"
          resizeMode="cover"
        />

        <View className="absolute bottom-9 -left-3.5 px-2 py-1 rounded-full">
          <Image
            source={images.rankingGradient}
            className="size-14 absolute"
            resizeMode="cover"
          />
          <Text className="text-white text-6xl font-bold mt-3">
            {index + 1}
          </Text>
        </View>

        <Text
          className="text-sm font-bold mt-2 text-light-200"
          numberOfLines={2}
        >
          {show.title}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

export default TrendingCard;
