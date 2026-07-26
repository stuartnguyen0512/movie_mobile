// TODO 1: Import Tabs từ "expo-router"
import { Tabs } from "expo-router";
// TODO 2: Import các component RN cần dùng: ImageBackground, Image, Text, View
import { ImageBackground, Image, Text, View } from "react-native";
// TODO 3: Import icons từ "@/constants/icons"
import { icons } from "@/constants/icons";
// TODO 4: Import images từ "@/constants/images"
import { images } from "@/constants/images";

// TODO 5: Viết function TabIcon({ focused, icon, title }: any)
// Gợi ý cấu trúc if/else, dùng đúng các className bên dưới:
//
// Khi focused === true, return ImageBackground:
//   source={images.highlight}
// className =
// "flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden";
//   bên trong chứa:
//     - Image: source={icon} tintColor="#151312" className="size-5"
//     - Text: className="text-secondary text-base font-semibold ml-2" -> hiển thị {title}
//
// Khi focused === false, return View:
// className="size-full justify-center items-center mt-4 rounded-full"
//   bên trong chứa:
// - Image: source={icon} tintColor="#A8B5DB" className="size-5"

const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        className="flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden"
      >
        <Image source={icon} tintColor="#151312" className="size-5"></Image>
        <Text className="text-secondary text-base font-semibold ml-2">
          {title}
        </Text>
      </ImageBackground>
    );
  }
  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      <Image source={icon} tintColor="#A8B5DB" className="size-5"></Image>
    </View>
  );
};
// TODO 6: Viết component chính TabsLayout (hoặc _Layout), return <Tabs>
const _Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#0F0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#0F0D23",
        },
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          ),
        }}
      />
      <Tabs.Screen
        name="save"
        options={{
          title: "Save",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.save} title="Save" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
};

// TODO 7 : Khai báo 4 Tabs.Screen, mỗi cái cần: name (khớp tên file), title,
// headerShown: false, và tabBarIcon = ({ focused }) => <TabIcon .../>
// - name="index"   -> icons.home   -> title "Home"
// - name="search"  -> icons.search -> title "Search"
// - name="save"    -> icons.save   -> title "Save"
// - name="profile" -> icons.person -> title "Profile"

// TODO 8: export default component của bạn
export default _Layout;
