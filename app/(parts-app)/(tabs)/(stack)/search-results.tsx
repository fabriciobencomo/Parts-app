import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  TextInput,
  Keyboard
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSearch, useSearchSuggestions } from '@/presentation/products/hooks/useSearch';
import { Product } from '@/core/products/interfaces/product.interface';
import { LinearGradient } from 'expo-linear-gradient';
import SearchComponent from '@/presentation/shared/components/SearchComponent';
import { getFirstValidImage } from '@/helpers/image-utils';

const ITEMS_PER_PAGE = 10;

const SearchResultsScreen = () => {
  const { query: initialQuery } = useLocalSearchParams<{ query: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState(initialQuery || '');
  const [overlayVisible, setOverlayVisible] = useState(false);
  
  // Usar el hook de búsqueda
  const { 
    results: searchResults, 
    isLoading: searchLoading, 
    error: searchError,
    isUsingLocalSearch 
  } = useSearch(searchTerm, true);

  // Usar sugerencias para el overlay
  const { 
    suggestions, 
    isLoading: suggestionsLoading 
  } = useSearchSuggestions(searchTerm, overlayVisible);

  // Debug logging
  useEffect(() => {
    console.log('🔍 SearchResults - Estado:', {
      searchTerm,
      resultsCount: searchResults?.length || 0,
      isUsingLocalSearch,
      searchLoading,
      hasError: !!searchError
    });
  }, [searchTerm, searchResults, isUsingLocalSearch, searchLoading, searchError]);

  // Manejar cambios en la búsqueda
  const onSearchChange = useCallback((text: string) => {
    console.log('Search changed to:', text);
    setSearchTerm(text);
  }, []);

  // Render item
  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        console.log('Navigating to product:', item);
        router.push({
          pathname: '/(parts-app)/(tabs)/(stack)/part/[id]',
          params: { id: item.id.toString() }
        });
      }}
    >
      <Image
        source={{ uri: getFirstValidImage(item.images) }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productBrand}>{item.brand.name}</Text>
        <Text style={styles.productPrice}>${(item.price || 0).toFixed(2)}</Text>
        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>
            {item.stock > 0 ? `${item.stock} disponibles` : 'Sin stock'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color="#999" />
      <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
      <Text style={styles.emptySubtitle}>
        Intenta con otros términos de búsqueda
      </Text>
    </View>
  );

  if (searchLoading && !(searchResults?.length)) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>
          {isUsingLocalSearch ? 'Buscando localmente...' : 'Buscando productos...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
      <LinearGradient
        colors={["#0A2E73", "#1976D2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.searchBarWrapper}>
            <SearchComponent
              value={searchTerm}
              onChangeText={setSearchTerm}
              results={[]}
              disableNavigation={true}
              rounded={false}
              onFocus={() => setOverlayVisible(true)}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsCount}>
          {searchResults?.length || 0} producto{(searchResults?.length || 0) !== 1 ? 's' : ''} encontrado{(searchResults?.length || 0) !== 1 ? 's' : ''}
        </Text>
        {isUsingLocalSearch && (
          <Text style={styles.localSearchIndicator}>
            🔍 Búsqueda local activa
          </Text>
        )}
        {searchError && (
          <Text style={styles.errorText}>
            ⚠️ Error en búsqueda del servidor
          </Text>
        )}
      </View>

      <FlatList
        data={searchResults || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        refreshing={searchLoading}
        onRefresh={() => {
          console.log('🔄 Refrescando búsqueda...');
          // La búsqueda se actualiza automáticamente cuando cambia searchTerm
        }}
      />
    </View>
  );
};

export default SearchResultsScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  backButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#001845',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  localSearchIndicator: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001845',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    color: '#28a745',
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001845',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  searchBarWrapper: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
}); 