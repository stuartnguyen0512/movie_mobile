import { icons } from "@/constants/icons";
import { View, Text, Image, TextInput } from "react-native";

interface Props {
  placeholder: string;
  onPress?: () => void;
  // ────────────────────────────────────────────────────────────
  // TODO 1: Thêm 2 field optional vào Props để SearchBar dùng được
  // làm controlled input (cần cho Search screen):
  //   - value?: string
  //   - onChangeText?: (text: string) => void
  //
  // Lý do optional: Home screen hiện đang gọi <SearchBar onPress
  // placeholder /> không truyền value/onChangeText — nếu field bắt
  // buộc, Home screen sẽ bị lỗi type ngay. Để optional giữ chỗ gọi
  // cũ vẫn chạy được.
  // ────────────────────────────────────────────────────────────
  value?: string;
  onChangeText?: (text: string) => void;
}

const SearchBar = ({ placeholder, onPress, value, onChangeText }: Props) => {
  return (
    <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
      <Image
        source={icons.search}
        className="size-5"
        resizeMode="contain"
        tintColor="#ab8bff"
      />
      {/* ──────────────────────────────────────────────────────
          TODO 2: Destructure thêm value, onChangeText ở dòng khai
          báo component phía trên (const SearchBar = ({ ... }: Props))

          TODO 3: Sửa TextInput bên dưới:
            - value={value} thay vì value=""
            - onChangeText={onChangeText} thay vì onChangeText={() => {}}

          Lưu ý: vì cả 2 field là optional, nếu component nào gọi
          SearchBar mà không truyền value/onChangeText (như Home
          screen hiện tại), giá trị sẽ là undefined — TextInput vẫn
          chạy bình thường (React Native tự coi như uncontrolled),
          không cần thêm xử lý gì đặc biệt.
      ────────────────────────────────────────────────────────── */}
      <TextInput
        onPress={onPress}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#a8b5db"
        className="flex-1 ml-2 text-white"
      />
    </View>
  );
};

export default SearchBar;
