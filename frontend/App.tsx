import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Test5 from "./components/Test5";

export default function App() {
    return (
        <View style={styles.container}>
            <Text>Open up App.tsx to start working on your app!</Text>
            <Test5></Test5>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
