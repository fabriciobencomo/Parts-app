import { useRef, useState } from 'react';
import { useWindowDimensions, View, StyleSheet, ScrollView } from 'react-native';
import PartBanner from './PartBanner';
import { Offer } from '@/core/interfaces/banner.interface';

interface Props {
  banners: Offer[];
}

const MainSlideShow = ({ banners }: Props) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const width = useWindowDimensions().width;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {banners.map((item, index) => (
          <View key={index} style={{ width }}>
            <PartBanner image={item.imageUrl} />
          </View>
        ))}
      </ScrollView>
      
      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {banners.map((_, idx) => (
          <View
            key={idx}
            style={[styles.dot, activeIndex === idx && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

export default MainSlideShow;

const styles = StyleSheet.create({
  container: {
    width: '95%',
  },
  scrollView: {
    height: 200, // Altura fija para el carrusel
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C4C4C4',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#001845',
    width: 14,
    height: 6,
    borderRadius: 3,
  },
});