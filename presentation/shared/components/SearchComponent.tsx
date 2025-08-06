import React from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, Image, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useRouter } from 'expo-router';
import { Product } from '@/core/products/interfaces/product.interface';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  results: Product[];
  onResultPress?: (part: Product) => void;
  onFocus?: () => void;
  rounded?: boolean;
  disableNavigation?: boolean;
  showResults?: boolean;
}

const SearchComponent: React.FC<Props> = ({ 
  value, 
  onChangeText, 
  results, 
  onResultPress, 
  onFocus, 
  rounded = false,
  disableNavigation = false,
  showResults = false
}) => {
  const router = useRouter();

  const handleSubmit = () => {
    if (value.trim() && !disableNavigation) {
      router.push({
        pathname: '/(parts-app)/(tabs)/(stack)/search-results',
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
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#7D8597" />
          </Pressable>
        )}
      </View>
      {showResults && results.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable 
                style={styles.resultItem} 
                onPress={() => onResultPress && onResultPress(item)}
              >
                <Image 
                  source={{ uri: item.images?.[0] }} 
                  style={styles.resultImage}
                />
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
  clearButton: {
    padding: 4,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultImage: {
    width: 40,
    height: 40,
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