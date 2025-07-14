import React, { useState, useMemo } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Tabs, useSegments } from 'expo-router';
import { Text, StyleSheet, View } from 'react-native';
import { useParts } from '@/hooks/parts/useParts';
import SearchComponent from '@/presentation/shared/components/SearchComponent';
import SearchOverlay from '@/presentation/shared/components/SearchOverlay';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const backgroundColor = useThemeColor({}, 'primary');
  const safeArea = useSafeAreaInsets();
  const { autoParts } = useParts();
  const segments = useSegments() as string[];

  // Search state global para todos los tabs
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Resultados filtrados para el overlay
  const results = useMemo(() => {
    if (!search.trim()) return [];
    return autoParts.filter(part =>
      part.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      part.category.toLowerCase().includes(search.trim().toLowerCase()) ||
      part.manufacturer.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [search, autoParts]);

  const handleResultPress = (part) => {
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

  const handleCancel = () => {
    setOverlayVisible(false);
    setSearch('');
    setShowResults(false);
    setSubmitted(false);
  };

  const handleSearchSubmit = () => {
    if (search.trim()) {
      setOverlayVisible(false);
      setSearch('');
      setShowResults(false);
      setSubmitted(false);
      router.push({
        pathname: '/search-results',
        params: { query: search.trim() }
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
      {/* Header global solo si NO estamos en la página de producto NI en la de resultados de búsqueda */}
      {!isProductPage && !isSearchResultsPage && (
        <LinearGradient
          colors={["#0A2E73", "#1976D2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: safeArea.top + 16 }]}
        >
          {/* Saludo solo en el tab de inicio */}
          {isHomeTab && <Text style={styles.greeting}>Hola Ricardo</Text>}
          <View style={styles.searchBarWrapper}>
            <SearchComponent
              value={search}
              onChangeText={text => {
                setSearch(text);
                setShowResults(true);
              }}
              results={[]}
              onResultPress={() => {}}
              onFocus={() => setOverlayVisible(true)}
            />
          </View>
        </LinearGradient>
      )}
      {/* Overlay de búsqueda avanzado */}
      <SearchOverlay
        visible={overlayVisible}
        value={search}
        onChangeText={text => {
          setSearch(text);
          setShowResults(true);
          setSubmitted(false);
        }}
        onCancel={handleCancel}
        results={submitted ? results : (search ? results.slice(0, 5) : [])}
        onResultPress={handleResultPress}
        onSubmit={handleSearchSubmit}
      />
      <View style={{ flex: 1 }}>
        <Tabs screenOptions={{ tabBarActiveTintColor: backgroundColor, headerShown: false }}>
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
            name="favorites/index"
            options={{
              title: 'Favoritos',
              tabBarIcon: ({ color }) => <Ionicons size={20} name="heart-outline" color={color} />,
            }}
          />
          <Tabs.Screen
            name="shop/index"
            options={{
              title: 'Pedidos',
              tabBarIcon: ({ color }) => <Ionicons size={20} name="cart-outline" color={color} />,
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
  greeting: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  searchBarWrapper: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
});
