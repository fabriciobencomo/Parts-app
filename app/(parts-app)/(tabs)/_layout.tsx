import React, { useState, useMemo } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Tabs, useSegments, router } from 'expo-router';
import { Text, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { useSearchSuggestions } from '@/presentation/products/hooks/useSearch';
import SearchComponent from '@/presentation/shared/components/SearchComponent';
import SearchOverlay from '@/presentation/shared/components/SearchOverlay';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/core/products/interfaces/product.interface';
import { useAuthStore } from '@/presentation/store/useAuthStore';
import { useCartCount } from '@/presentation/cart/hooks/useCart';

// Componente para el ícono del carrito con badge
const CartIcon = ({ color }: { color: string }) => {
  const { count } = useCartCount();
  
  return (
    <View style={{ position: 'relative' }}>
      <Ionicons size={20} name="cart-outline" color={color} />
      {count > 0 && (
        <View style={{
          position: 'absolute',
          top: -6,
          right: -6,
          backgroundColor: '#EF4444',
          borderRadius: 10,
          minWidth: 16,
          height: 16,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{
            color: 'white',
            fontSize: 10,
            fontWeight: '600',
            textAlign: 'center',
          }}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function TabLayout() {
  const backgroundColor = useThemeColor({}, 'primary');
  const safeArea = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const { logout, user } = useAuthStore();

  // Search state global para todos los tabs
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Usar sugerencias del backend
  const { suggestions = [], isLoading: suggestionsLoading } = useSearchSuggestions(search, overlayVisible);

  const handleResultPress = (part: Product) => {
    setSearch('');
    setShowResults(false);
    setOverlayVisible(false);
    setSubmitted(false);
    router.push(`/part/${part.id}`);
  };

  // Detectar si estamos en la página de producto (part/[id])
  const isProductPage = segments.includes('part') && segments.length > 2;
  // Detectar si estamos en el tab de inicio
  const isHomeTab = segments.includes('(stack)');
  // Detectar si estamos en la pantalla de resultados de búsqueda
  const isSearchResultsPage = segments.includes('search-results');
  // Detectar si estamos en la pantalla de perfil
  const isProfilePage = segments.includes('profile');

  const handleSearchSubmit = () => {
    if (search.trim()) {
      setOverlayVisible(false);
      router.push({
        pathname: '/(parts-app)/(tabs)/(stack)/search-results',
        params: { query: search.trim() }
      });
    }
  };

  const handleSearchFocus = () => {
    if (isSearchResultsPage) {
      // Si ya estamos en la página de resultados, mostrar el overlay
      setOverlayVisible(true);
    } else {
      // Si no, mostrar el overlay normalmente
      setOverlayVisible(true);
    }
  };

  const handleCancel = () => {
    setOverlayVisible(false);
    setSearch('');
    setShowResults(false);
    setSubmitted(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  // Función para formatear el nombre del usuario
  const formatUserName = (fullName?: string) => {
    if (!fullName) return 'Usuario';
    
    // Tomar solo el primer nombre (antes del primer espacio)
    const firstName = fullName.split(' ')[0];
    
    // Limitar a 15 caracteres
    if (firstName.length > 15) {
      return firstName.substring(0, 15) + '...';
    }
    
    return firstName;
  };

  const handleProfilePress = () => {
    router.push('/profile/' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
      {/* Header global solo si NO estamos en la página de producto NI en la de resultados de búsqueda NI en perfil */}
      {!isProductPage && !isSearchResultsPage && !isProfilePage && (
        isHomeTab ? (
          <LinearGradient
            colors={["#0A2E73", "#1976D2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.header,
              { paddingTop: safeArea.top + 16 },
              { borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }
            ]}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={handleProfilePress} style={styles.greetingButton}>
                <Text style={styles.greeting}>Hola {formatUserName(user?.name)}</Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.8)" style={styles.greetingIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="exit-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBarWrapper}>
              <SearchComponent
                value={search}
                onChangeText={text => setSearch(text)}
                results={[]}
                onResultPress={handleResultPress}
                onFocus={() => setOverlayVisible(true)}
                rounded={true}
              />
            </View>
          </LinearGradient>
        ) : (
          <View style={{ backgroundColor: '#001233', paddingTop: safeArea.top + 16, paddingHorizontal: 20, paddingBottom: 18 }}>
            <View style={styles.searchBarWrapper}>
              <SearchComponent
                value={search}
                onChangeText={text => setSearch(text)}
                results={[]}
                onResultPress={handleResultPress}
                onFocus={() => setOverlayVisible(true)}
                rounded={false}
              />
            </View>
          </View>
        )
      )}

      {/* Overlay de búsqueda */}
      <SearchOverlay
        visible={overlayVisible}
        value={search}
        onChangeText={text => setSearch(text)}
        onCancel={handleCancel}
        results={suggestions}
        onResultPress={handleResultPress}
        onSubmit={handleSearchSubmit}
      />
      <View style={{ flex: 1 }}>
        <Tabs 
          screenOptions={{ 
            tabBarActiveTintColor: backgroundColor || '#1976D2', 
            headerShown: false 
          }}
        >
          <Tabs.Screen
            name="(stack)"
            options={{
              title: 'Inicio',
              tabBarIcon: ({ color }) => <Ionicons size={20} name="home-outline" color={color} />,
            }}
          />
          <Tabs.Screen
            name="categories/index"
            options={{
              title: 'Categorias',
              tabBarIcon: ({ color }) => <Ionicons size={20} name="square-outline" color={color} />,
            }}
          />
          <Tabs.Screen
            name="orders/index"
            options={{
              title: 'Órdenes',
              tabBarIcon: ({ color }) => <Ionicons size={20} name="receipt-outline" color={color} />,
            }}
          />
          <Tabs.Screen
            name="favorites/index"
            options={{
              title: 'Favoritos',
              tabBarIcon: ({ color }) => <Ionicons size={20} name="heart-outline" color={color} />,
            }}
          />
          <Tabs.Screen
            name="shop/index"
            options={{
              title: 'Carrito',
              tabBarIcon: ({ color }) => <CartIcon color={color} />,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  greetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  greeting: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  greetingIcon: {
    marginLeft: 4,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchBarWrapper: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
});
