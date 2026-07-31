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
// ────────────────────────────────────────────────────────────
// TODO 1: Import những gì cần dùng
//   - useLocalSearchParams từ "expo-router" (đọc param "id" từ URL)
//   - useFetch từ "@/services/useFetch"
//   - fetchShowDetails từ "@/services/api"
// ────────────────────────────────────────────────────────────
const ShowDetails = () => {
  // ────────────────────────────────────────────────────────────
  // TODO 2: Lấy "id" từ URL bằng useLocalSearchParams
  //
  // Route file này tên là "[id].tsx" nên Expo Router sẽ tự parse
  // segment đó thành param "id". Ví dụ path "/shows/123" -> id = "123".
  //
  const { id } = useLocalSearchParams();
  //
  // Lưu ý: id có kiểu string | string[] theo type của Expo Router,
  // nhưng thực tế với route này luôn là string đơn — có thể ép kiểu
  // "as string" khi truyền cho fetchShowDetails.
  // ────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────
  // TODO 3: Gọi useFetch để lấy chi tiết show
  //
  const {
    data: shows,
    loading,
    error,
  } = useFetch(() => fetchShowDetails(id as string));
  //
  // Vì sao phải bọc trong () => fetchShowDetails(...) thay vì
  // truyền thẳng fetchShowDetails? Nhớ lại chữ ký của useFetch:
  //   fetchFunction: () => Promise<T>
  // fetchShowDetails cần tham số id, nhưng useFetch chỉ gọi
  // fetchFunction() KHÔNG có tham số -> phải bọc thành 1 hàm
  // "không tham số" (arrow function) để giữ id bên trong closure.
  // ────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────
  // TODO 4: Render theo 3 trạng thái, giống pattern đã dùng ở
  // Home/Search screen:
  //   - loading === true  -> hiển thị ActivityIndicator
  //   - error !== null    -> hiển thị Text báo lỗi
  //   - còn lại (có data)  -> render thông tin show:
  //       + show.image?.original (hoặc medium) bằng <Image>
  //       + show.name
  //       + show.rating?.average
  //       + show.summary (chú ý: chuỗi HTML thô từ TVmaze, có
  //         thể có thẻ <p>, <b>... tạm thời render text thô,
  //         nói mình biết nếu muốn xử lý strip HTML sau)
  //       + show.genres?.join(", ")
  //       + show.premiered
  // ────────────────────────────────────────────────────────────
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

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{ uri: shows?.image?.medium }}
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
        </View>
        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{shows?.name}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {shows?.premiered?.split("-")[0]} •
            </Text>
            <Text className="text-light-200 text-sm">{shows?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />

            <Text className="text-white font-bold text-sm">
              {Math.round((shows?.rating?.average ?? 0) / 2)}
            </Text>

            <Text className="text-light-200 text-sm">
              ({shows?.weight} votes)
            </Text>
          </View>

          <ShowInfo label="Overview" value={shows?.summary} />
          <ShowInfo
            label="Genres"
            value={shows?.genres?.map((g) => g).join(" • ") || "N/A"}
          />

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
