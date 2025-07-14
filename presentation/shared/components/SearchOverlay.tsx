import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Text, FlatList, Image, Pressable, TouchableOpacity, Keyboard } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Part {
  id: number;
  name: string;
  image: string | string[];
}

interface Props {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onCancel: () => void;
  results: Part[];
  onResultPress: (part: Part) => void;
  onSubmit: () => void;
}

const SearchOverlay: React.FC<Props> = ({ visible, value, onChangeText, onCancel, results, onResultPress, onSubmit }) => {
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
        </View>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={results}
        keyExtractor={item => item.id.toString()}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable style={styles.resultItem} onPress={() => onResultPress(item)}>
            <Image source={{ uri: Array.isArray(item.image) ? item.image[0] : item.image }} style={styles.resultImage} />
            <Text style={styles.resultText}>{item.name}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Sin resultados</Text>}
        style={styles.resultsList}
      />
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
    backgroundColor: 'white',
    zIndex: 100,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
  cancelButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cancelText: {
    color: '#1976D2',
    fontWeight: '700',
    fontSize: 16,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F4F4F4',
  },
  resultText: {
    fontSize: 16,
    color: '#001845',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7D8597',
    marginTop: 32,
    fontSize: 16,
  },
});

export default SearchOverlay; 