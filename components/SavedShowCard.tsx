import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";

// TODO: destructure đúng field cần dùng từ SavedShow
// (nhớ: SavedShow là props phẳng, khác Show — show_id thay vì id,
// poster_url là string thẳng thay vì image.medium, rating là number
// thẳng thay vì rating.average)
const SavedShowCard = ({
  $id,
  show_id,
  title,
  poster_url,
  rating,
  premiered,
}: SavedShow) => {
  return (
    // TODO: href phải trỏ đúng "/shows/:show_id"
    <Link href={`/shows/${show_id}`} asChild>
      <TouchableOpacity className="w-[30%]">
        {/* Poster */}
        <Image
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
          source={{
            // TODO: dùng field poster_url, fallback placeholder giống ShowCard
            uri: poster_url,
          }}
        />
        {/* Title */}
        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {/* TODO: field title */}
          {title}
        </Text>
        {/* Rating */}
        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.star} className="size-4" />
          <Text className="text-xs text-white font-bold uppercase">
            {/* TODO: rating là number thẳng (không lồng .average), vẫn
            cần xử lý null trước khi Math.round */}
            {Math.round((rating ?? 0) / 2)}
          </Text>
        </View>
        {/* Release Date */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-medium mt-1">
            {/* TODO: field premiered, tách năm giống ShowCard */}
            {premiered?.split("-")[0]}
          </Text>
          <Text className="text-xs font-medium text-light-300 uppercase">
            Show
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default SavedShowCard;
