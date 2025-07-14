import { useRef, useState } from 'react';
import { useWindowDimensions, View, StyleSheet } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import PartBanner from './PartBanner';
import { Offer } from '@/core/interfaces/banner.interface';

interface Props {
  banners: Offer[];
}

const MainSlideShow = ({ banners }: Props) => {
  const ref = useRef<ICarouselInstance>(null);
  const width = useWindowDimensions().width;
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Carousel
        ref={ref}
        data={banners}
        renderItem={({ item }) => <PartBanner image={item.imageUrl} />}
        width={width}
        pagingEnabled={true}
        style={{ width: width, height: width / 2, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 }}
        modeConfig={{}}
        defaultIndex={0}
        onSnapToItem={setActiveIndex}
      />
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