import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, Image } from 'react-native'
import React from 'react'
import { ThemedText } from '@/presentation/shared/components/ThemedText'
import { ThemedView } from '@/presentation/shared/components/ThemedView'
import { useFavorites } from '@/presentation/favorites/hooks/useFavorites'
import { Ionicons } from '@expo/vector-icons'
import { useThemeColor } from '@/hooks/useThemeColor'
import { router } from 'expo-router'
import type { Favorite } from '@/core/favorites/actions/favorites-actions'

const FavoriteItem = ({ item, onRemove }: { item: Favorite; onRemove: (productId: string) => void }) => {
  const handlePress = () => {
    // Navigate to product detail
    router.push(`/(parts-app)/(tabs)/(stack)/part/${item.productId}`)
  }

  const handleRemove = () => {
    Alert.alert(
      'Remover de Favoritos',
      `¿Estás seguro de que quieres remover "${item.product?.name || 'este producto'}" de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => onRemove(item.productId) }
      ]
    )
  }

  const product = item.product
  
  if (!product) {
    // Render a placeholder item for debugging
    return (
      <View style={styles.favoriteItem}>
        <View style={styles.productCard}>
          <View style={[styles.placeholderImage, { backgroundColor: '#F0F0F0' }]}>
            <Ionicons name="image-outline" size={32} color="#999" />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              Producto sin datos (ID: {item.productId})
            </Text>
            <Text style={styles.productBrand}>Sin información</Text>
            <Text style={styles.productPrice}>$0.00</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <Ionicons name="heart" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.favoriteItem}>
      <TouchableOpacity style={styles.productCard} onPress={handlePress}>
        {product.images && product.images.length > 0 ? (
          <Image source={{ uri: product.images[0] }} style={styles.productImage} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: '#F0F0F0' }]}>
            <Ionicons name="image-outline" size={32} color="#999" />
          </View>
        )}
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          
          {product.brand && (
            <Text style={styles.productBrand}>
              {product.brand.name}
            </Text>
          )}
          
          <Text style={styles.productPrice}>
            ${product.price?.toFixed(2) || '0.00'}
          </Text>
          
          <View style={styles.stockContainer}>
            <Text style={styles.stockText}>
              {product.stock && product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
        <Ionicons name="heart" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  )
}

const FavoritesScreen = () => {
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  
  const { 
    favorites, 
    favoriteCount, 
    loading, 
    error, 
    refreshFavorites, 
    removeFromFavorites, 
    clearAllFavorites,
    clearError 
  } = useFavorites()



  const handleRemoveFavorite = async (productId: string) => {
    try {
      const success = await removeFromFavorites(productId)
      if (success) {
        // Show success feedback
        console.log('Product removed from favorites')
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo remover el producto de favoritos')
    }
  }

  const handleClearAll = () => {
    if (favorites.length === 0) return
    
    Alert.alert(
      'Limpiar Favoritos',
      '¿Estás seguro de que quieres remover todos los productos de tus favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar Todo', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const success = await clearAllFavorites()
              if (success) {
                Alert.alert('Éxito', 'Todos los favoritos han sido removidos')
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudieron limpiar los favoritos')
            }
          }
        }
      ]
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No tienes favoritos</Text>
      <Text style={styles.emptySubtitle}>
        Explora productos y agrega tus favoritos tocando el ícono del corazón
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => router.push('/(parts-app)/(tabs)/(stack)/home')}
      >
        <Text style={styles.exploreButtonText}>Explorar Productos</Text>
      </TouchableOpacity>
    </View>
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>
          Mis Favoritos
        </Text>
        <Text style={styles.headerSubtitle}>
          {favoriteCount} {favoriteCount === 1 ? 'producto' : 'productos'}
        </Text>
      </View>
      
      {favorites.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={styles.clearButtonText}>Limpiar</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              clearError()
              refreshFavorites()
            }}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <FavoriteItem item={item} onRemove={handleRemoveFavorite} />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshFavorites}
            tintColor={tintColor}
            colors={[tintColor]}
          />
        }
        contentContainerStyle={[
          styles.listContainer,
          favorites.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  clearButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  favoriteItem: {
    position: 'relative',
    marginBottom: 12,
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
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  stockContainer: {
    marginTop: 2,
  },
  stockText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#1F2937',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#1F2937',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

})

export default FavoritesScreen