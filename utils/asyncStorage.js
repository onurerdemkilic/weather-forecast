import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (err) {
        console.log("Error storing value: " + err);
    }
}

export const getStoredData = async (key, value) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value;
    } catch (err) {
        console.log("Error retrieving value: " + err);
        return null;
    }
}