import React from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, Image, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useRouter } from 'expo-router';

interface Part {
  id: number;
  name: string;
  image: string[];
}

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  results: Part[];
  onResultPress?: (part: Part) => void;
  onFocus?: () => void;
  rounded?: boolean;
}

const SearchComponent: React.FC<Props> = ({ value, onChangeText, results, onResultPress, onFocus, rounded = false }) => {
  const router = useRouter();

  const handleSubmit = () => {
    if (value.trim()) {
      router.push({
        pathname: '/search-results',
        params: { query: value.trim() }
      });
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.inputContainer, rounded ? styles.rounded : styles.rectangular]}>
        <Ionicons name="search" size={20} color="#7D8597" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar..."
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#7D8597"
          onFocus={onFocus}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
      </View>
      {results.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable style={styles.resultItem} onPress={() => onResultPress && onResultPress(item)}>
                <Image source={{ uri: item.image[0] }} style={styles.resultImage} />
                <Text style={styles.resultText}>{item.name}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rounded: {
    borderRadius: 16,
  },
  rectangular: {
    borderRadius: 0,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#001845',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F4F4F4',
  },
  resultText: {
    fontSize: 15,
    color: '#001845',
    flex: 1,
  },
});

export default SearchComponent;