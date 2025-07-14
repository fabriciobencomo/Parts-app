import React, { useState, useCallback, useRef } from 'react';
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
import { useParts } from '@/hooks/parts/useParts';
import { AutoPart } from '@/core/interfaces/parts.interface';
import { LinearGradient } from 'expo-linear-gradient';

const ITEMS_PER_PAGE = 10;

const SearchResultsScreen = () => {
  const { query: initialQuery } = useLocalSearchParams<{ query: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { autoParts } = useParts();
  const inputRef = useRef<TextInput>(null);

  const [search, setSearch] = useState(initialQuery || '');
  const [displayedItems, setDisplayedItems] = useState<AutoPart[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Filter products based on search query
  const filteredProducts = React.useMemo(() => {
    if (!search) return autoParts;
    const searchTerm = search.toLowerCase();
    return autoParts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.manufacturer.toLowerCase().includes(searchTerm)
    );
  }, [search, autoParts]);

  // Load initial items or when search changes
  React.useEffect(() => {
    const initialItems = filteredProducts.slice(0, ITEMS_PER_PAGE);
    setDisplayedItems(initialItems);
    setCurrentPage(1);
    setHasMore(filteredProducts.length > ITEMS_PER_PAGE);
  }, [filteredProducts]);

  // Load more items function
  const loadMoreItems = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = filteredProducts.slice(startIndex, endIndex);
      setDisplayedItems(prev => [...prev, ...newItems]);
      setCurrentPage(nextPage);
      setHasMore(endIndex < filteredProducts.length);
      setLoading(false);
    }, 500);
  }, [currentPage, filteredProducts, loading, hasMore]);

  // Handle search submit
  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    // No navigation, just update results in place
    // The filteredProducts useEffect will handle updating the list
  };

  // Render item
  const renderItem = ({ item }: { item: AutoPart }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/part/${item.id}`)}
    >
      <Image
        source={{ uri: item.image[0] }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productBrand}>{item.manufacturer}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>
            {item.stock > 0 ? `${item.stock} disponibles` : 'Sin stock'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render footer (loading indicator)
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando más productos...</Text>
      </View>
    );
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
      {/* Gradient header with search bar and back arrow */}
      <LinearGradient
        colors={["#0A2E73", "#1976D2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')} // Go to home
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Buscar..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#7D8597"
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </View>
      </LinearGradient>

      {/* Results count */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsCount}>
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Products list */}
      <FlatList
        data={displayedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
}); 