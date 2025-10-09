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
import { useFilters } from '@/presentation/products/hooks/useFilters';
import { Product } from '@/core/products/interfaces/product.interface';
import { LinearGradient } from 'expo-linear-gradient';
import SearchComponent from '@/presentation/shared/components/SearchComponent';
import FilterModal from '@/presentation/shared/components/FilterModal';
import { getFirstValidImage } from '@/helpers/image-utils';

const ITEMS_PER_PAGE = 10;

const SearchResultsScreen = () => {
  const { query: initialQuery } = useLocalSearchParams<{ query: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState(initialQuery || '');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Usar el hook de búsqueda
  const { 
    results: searchResults, 
    isLoading: searchLoading, 
    error: searchError,
    isUsingLocalSearch,
    isTyping,
    debouncedQuery 
  } = useSearch(searchTerm, true);

  // Usar sugerencias para el overlay
  const { 
    suggestions, 
    isLoading: suggestionsLoading 
  } = useSearchSuggestions(searchTerm, overlayVisible);

  // Usar filtros
  const {
    availableBrands,
    availableCategories,
    priceRange,
    filters,
    hasActiveFilters,
    filteredProducts,
    applyFilters,
    clearFilters,
    loading: filtersLoading
  } = useFilters(searchResults || []);

  // Use filtered products instead of raw search results
  const displayProducts = filteredProducts;

  // Debug logging - solo cuando hay cambios importantes
  useEffect(() => {
    if (!isTyping && debouncedQuery) {
      console.log('🔍 SearchResults - Búsqueda completada:', {
        debouncedQuery,
        resultsCount: searchResults?.length || 0,
        isUsingLocalSearch,
        searchLoading
      });
    }
  }, [debouncedQuery, searchResults, isUsingLocalSearch, searchLoading, isTyping]);

  // Manejar cambios en la búsqueda
  const onSearchChange = useCallback((text: string) => {
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

  // Render loading state en el área de contenido
  const renderContentLoading = () => (
    <View style={styles.contentLoadingContainer}>
      <ActivityIndicator size="large" color="#1976D2" />
      <Text style={styles.contentLoadingText}>
        {isUsingLocalSearch ? 'Buscando localmente...' : 'Buscando productos...'}
      </Text>
    </View>
  );

  // Renderizar el loading en el área de contenido, no como pantalla completa

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
      <LinearGradient
        colors={["#0A2E73", "#1976D2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
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
              rounded={true}
              onFocus={() => setOverlayVisible(true)}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="filter" 
              size={20} 
              color={hasActiveFilters ? "#1976D2" : "#fff"} 
            />
            {hasActiveFilters && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {filters.brands.length + filters.categories.length + 
                   (filters.inStockOnly ? 1 : 0) + 
                   (filters.priceRange.min !== priceRange.min || filters.priceRange.max !== priceRange.max ? 1 : 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.resultsInfo}>
        {isTyping ? (
          <Text style={styles.typingIndicator}>
            ✏️ Escribiendo... (buscará "{searchTerm}")
          </Text>
        ) : (
          <>
            <View style={styles.resultsRow}>
              <Text style={styles.resultsCount}>
                {displayProducts?.length || 0} producto{(displayProducts?.length || 0) !== 1 ? 's' : ''} 
                {hasActiveFilters ? ' filtrados' : ' encontrados'} 
                {searchResults && displayProducts && searchResults.length !== displayProducts.length 
                  ? ` de ${searchResults.length}` 
                  : ''} para "{debouncedQuery}"
              </Text>
              {searchLoading && (searchResults?.length || 0) > 0 && (
                <ActivityIndicator size="small" color="#1976D2" style={styles.smallLoadingIndicator} />
              )}
            </View>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
                <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
            {isUsingLocalSearch && (
              <Text style={styles.localSearchIndicator}>
                🔍 Búsqueda local activa (endpoint público no disponible)
              </Text>
            )}
            {searchError && !isUsingLocalSearch && (
              <Text style={styles.errorText}>
                ⚠️ Error del endpoint público - Reintentando...
              </Text>
            )}
          </>
        )}
      </View>

      <FlatList
        data={displayProducts || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          // Mostrar loading solo cuando está buscando y no hay resultados previos
          searchLoading && !isTyping && !(searchResults?.length) 
            ? renderContentLoading 
            : renderEmpty
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        refreshing={false}
        onRefresh={() => {
          // La búsqueda se actualiza automáticamente cuando cambia searchTerm
        }}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={applyFilters}
        availableBrands={availableBrands}
        availableCategories={availableCategories}
        priceRange={priceRange}
        currentFilters={filters}
      />
    </View>
  );
};

export default SearchResultsScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  smallLoadingIndicator: {
    marginLeft: 8,
  },
  typingIndicator: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
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
  contentLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    minHeight: 200,
  },
  contentLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
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
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  filterButton: {
    marginLeft: 12,
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: 'white',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  clearFiltersButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
}); 