
import * as SecureStore from 'expo-secure-store'
import { Alert } from 'react-native';

export class SecureStorageAdapter {
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      Alert.alert('Error', 'Failed to save Data');
    }
  }
  static async getItem(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      Alert.alert('Error', 'Failed to Get Data');
    }
  }
  static async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      Alert.alert('Error', 'Failed to Remove Data');
    }
  }

}