import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Text, FlatList, Image, Pressable, TouchableOpacity, Keyboard } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Product } from '@/core/products/interfaces/product.interface';

interface Props {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onCancel: () => void;
  results: Product[];
  onResultPress: (part: Product) => void;
  onSubmit: () => void;
}

const SearchOverlay: React.FC<Props> = ({ 
  visible, 
  value, 
  onChangeText, 
  onCancel, 
  results, 
  onResultPress, 
  onSubmit 
}) => {
  const inputRef = useRef<TextInput>(null);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.searchBarRow}>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="#7D8597" style={styles.icon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Buscar..."
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#7D8597"
            autoFocus
            returnKeyType="search"
            onSubmitEditing={onSubmit}
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
              <Ionicons name="close-circle-outline" size={20} color="#7D8597" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={item => item.id.toString()}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable 
              style={styles.resultItem} 
              onPress={() => {
                Keyboard.dismiss();
                onResultPress(item);
              }}
            >
              <Image 
                source={{ uri: item.images?.[0] }} 
                style={styles.resultImage} 
              />
              <Text style={styles.resultText}>{item.name}</Text>
            </Pressable>
          )}
          style={styles.resultsList}
        />
      )}
      {value.length > 0 && results.length === 0 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsTitle}>No se encontraron resultados</Text>
          <Text style={styles.noResultsSubtitle}>Intenta con otros términos de búsqueda</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F4F4F4',
    zIndex: 100,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
    backgroundColor: 'white',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  cancelButton: {
    marginLeft: 10,
    padding: 4,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 17,
  },
  resultsList: {
    backgroundColor: 'white',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C8C8C8',
  },
  resultImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F4F4F4',
  },
  resultText: {
    fontSize: 17,
    color: '#000',
  },
  noResults: {
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: 'white',
    flex: 1,
  },
  noResultsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
});

export default SearchOverlay; 