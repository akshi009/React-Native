import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
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
    <SafeAreaView className="flex-1 bg-background">
      <View style={{ padding: 20 }}>
        <Text className="text-2xl font-bold text-text">HEY THERE THIS IS AKSHI JAIN</Text>


        <TouchableOpacity onPress={() => alert('yayy!!')}>
          <Text style={{ textAlign: "center", color: "white", fontWeight: "bold", borderRadius: 12, backgroundColor: "#0a7ea4", padding: 8, marginTop: 16 }}>Submit</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={properties} renderItem={({ item }) => {
        return (
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" }}>
            <Text className="text-primary font-semibold">{item.name}</Text>
            <Text className="text-text">{item.age}</Text>
            <Text className="text-text opacity-70">{item.city}</Text>
          </View>
        )
      }}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
}
