import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";

// ────────────────────────────────────────────────────────────
// TODO 1: Khai báo component ShowCard nhận props theo type Show
// Destructure các field cần dùng: id, image, name, rating, premiered
// (nhớ: image và rating là object lồng, không phải string/number
// phẳng như bên Movie của TMDB)
// ────────────────────────────────────────────────────────────

const ShowCard = ({ id, image, name, rating, premiered }: Show) => {
  return (
    // ────────────────────────────────────────────────────────────
    // TODO 2: Return <Link> bọc <TouchableOpacity>
    //   - href phải trỏ đúng route "/shows/:id" (khớp app/shows/[id].tsx)
    //   - asChild để tránh lồng 2 lớp bấm được
    //   - className="w-[30%]" giữ nguyên như video (để khớp 3 cột)
    // ────────────────────────────────────────────────────────────

    // ────────────────────────────────────────────────────────────
    // TODO 3: <Image> hiển thị poster
    //   - source uri: nếu image?.medium có giá trị thì dùng, không thì
    //     dùng placeholder "https://placehold.co/600x400/1a1a1a/FFFFFF.png"
    //   - className="w-full h-52 rounded-lg", resizeMode="cover"
    // ────────────────────────────────────────────────────────────
    //
    // ────────────────────────────────────────────────────────────
    // TODO 4: <Text> hiển thị tên show (field "name", không phải "title")
    //   className="text-sm font-bold text-white mt-2" numberOfLines={1}
    // ────────────────────────────────────────────────────────────

    // ────────────────────────────────────────────────────────────
    // TODO 5: Hàng hiển thị rating (icon sao + số)
    //   - icons.star + Text hiện Math.round(rating.average / 2)
    //   - LƯU Ý: rating.average có thể là null (nhiều show TVmaze
    //     chưa có điểm) -> cần xử lý trước khi gọi Math.round,
    //     tránh Math.round(null / 2) gây lỗi hoặc hiện "NaN"
    //     Gợi ý: dùng toán tử ?? để có giá trị mặc định khi null
    // ────────────────────────────────────────────────────────────

    // ────────────────────────────────────────────────────────────
    // TODO 6: Hàng dưới cùng hiển thị năm phát sóng + loại nội dung
    //   - lấy năm từ field "premiered" (dạng "2013-06-24"), tách
    //     chuỗi theo dấu "-" và lấy phần tử đầu tiên
    //   - LƯU Ý: premiered cũng có thể null (show sắp/chưa phát sóng)
    //     cần optional chaining (?.) trước khi gọi .split()
    //   - text tĩnh bên phải, có thể đổi "Movie" -> "Show"
    // ────────────────────────────────────────────────────────────

    <Link href={`/shows/${id}`} asChild>
      <TouchableOpacity className="w-[30%]">
        {/* Show Post */}
        <Image
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
          source={{
            uri:
              image?.medium ?? "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
          }}
        />
        {/* Show Name */}
        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {name}
        </Text>
        {/* Rating */}
        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.star} className="size-4" />
          <Text className="text-xs text-white font-bold uppercase">
            {Math.round((rating.average ?? 0) / 2)}
          </Text>
        </View>
        {/* Release Date */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-medium mt-1">
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

export default ShowCard;

// TODO 7: export default ShowCard
