import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  const properties = [
    { id: 1, name: "Akshi", age: 22, city: "Delhi" },
    { id: 2, name: "Akshi", age: 22, city: "Delhi" },
    { id: 3, name: "Akshi", age: 22, city: "Delhi" },
    { id: 4, name: "Akshi", age: 22, city: "Delhi" },
    { id: 5, name: "Akshi", age: 22, city: "Delhi" },
    { id: 6, name: "Akshi", age: 22, city: "Delhi" },
    { id: 7, name: "Akshi", age: 22, city: "Delhi" },
    { id: 8, name: "Akshi", age: 22, city: "Delhi" },
    { id: 9, name: "Akshi", age: 22, city: "Delhi" },
    { id: 10, name: "Akshi", age: 22, city: "Delhi" },
  ]
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View style={{ padding: 96 }}>
        <Text>HEY THERE THIS IS AKSHI JAIN</Text>


        <TouchableOpacity onPress={() => alert('yayy!!')}>
          <Text style={{ textAlign: "center", color: "white", fontWeight: "bold", borderRadius: 12, backgroundColor: "rgba(34, 37, 208, 1)", padding: 8, marginTop: 16 }}>Submit</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={properties} renderItem={({ item }) => {
        return (
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(136, 136, 136, 1)" }}>
            <Text className="text-blue-500">{item.name}</Text>
            <Text>{item.age}</Text>
            <Text>{item.city}</Text>
          </View>
        )
      }}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>

  );
}
