import { useRef } from 'react';
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

  return (
    <View style={styles.container}>
      <Carousel
        ref={ref}
        data={banners}
        renderItem={({ item }) => <PartBanner id={item.id} image={item.imageUrl} />}
        width={width}
        pagingEnabled={true}
        style={{ width: width, height: width / 2, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 }}
        modeConfig={{}}
        defaultIndex={1}
      />
    </View>
  );
};

export default MainSlideShow;

const styles = StyleSheet.create({
  container: {
    width: '95%',
  },
});