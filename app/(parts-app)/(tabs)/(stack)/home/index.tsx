import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import MainSlideShow from '@/presentation/items/parts/MainSlideShow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProducts } from '@/presentation/products/hooks/useProducts';
import PartsHorizontal from '@/presentation/items/parts/PartsHorizontal';
import { useBanners } from '@/hooks/parts/useBanners';

const HomeScreen = () => {
  // const { autoParts } = useParts(); // Eliminar esta línea
  const { productsQuery, loadNextPage } = useProducts();
  const { offers } = useBanners();

  // Unir todas las páginas de productos en un solo array
  const products = productsQuery.data?.pages.flat() || [];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingBottom: 22 }}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          // Cargar más productos al llegar al final
          const paddingToBottom = 20;
          if (
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - paddingToBottom
          ) {
            if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
              loadNextPage();
            }
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Banner/Slideshow with rounded corners */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerWrapper}>
            <MainSlideShow banners={offers} />
          </View>
        </View>

        {/* Ofertas de la semana */}
        <Text style={styles.sectionTitle}>Ofertas de la semana</Text>
        <PartsHorizontal
          parts={products}
          title={undefined}
        />

        {/* Lo mas vendido */}
        <Text style={styles.sectionTitle}>Lo más vendido</Text>
        <PartsHorizontal
          parts={products}
          title={undefined}
        />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  bannerContainer: {
    marginTop: -2,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  bannerWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001845',
    marginTop: 18,
    marginBottom: 14,
    marginLeft: 24,
  },
});