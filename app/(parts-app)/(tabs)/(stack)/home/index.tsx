import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import MainSlideShow from '@/presentation/items/parts/MainSlideShow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useParts } from '@/hooks/parts/useParts';
import PartsHorizontal from '@/presentation/items/parts/PartsHorizontal';
import { useBanners } from '@/hooks/parts/useBanners';

const HomeScreen = () => {
  const { autoParts } = useParts();
  const { offers } = useBanners();

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
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
          parts={autoParts}
          title={undefined}
        />

        {/* Lo mas vendido */}
        <Text style={styles.sectionTitle}>Lo más vendido</Text>
        <PartsHorizontal
          parts={autoParts}
          title={undefined}
        />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  bannerContainer: {
    marginTop: -32,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#001845',
    marginTop: 28,
    marginBottom: 12,
    marginLeft: 16,
  },
});