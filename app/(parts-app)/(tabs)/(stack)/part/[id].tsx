import React, { useRef, useState } from 'react';
import { View, Text, useWindowDimensions, Pressable, Image, StyleSheet, FlatList, Animated, NativeSyntheticEvent, NativeScrollEvent, Modal, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { usePart } from '@/hooks/parts/usePart';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '../../../../../constants/Colors';

const PartScreen = () => {
  const {id} = useLocalSearchParams();
  const part = usePart(id)
  const primaryColor = useThemeColor({}, 'primary')
  const {height, width} = useWindowDimensions()
  const images = Array.isArray(part.image) ? part.image : [part.image];

  // Carrusel
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
      }
    }
  );

  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{flex: 1, backgroundColor: '#F4F4F4', paddingBottom: 32}}>
      {/* Header with back button and favorite */}
      <View style={{position: 'relative', backgroundColor: '#F4F4F4'}}>
        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.dismiss()}
        >
          <Ionicons name='arrow-back' size={24} color='#001845' />
        </Pressable>
        {/* Favorite Button */}
        <Pressable style={styles.favoriteButton}>
          <Ionicons name='heart-outline' size={24} color='#6B7280' />
        </Pressable>
        {/* Product Images Carousel */}
        <View style={styles.imageContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={images}
            keyExtractor={(item, idx) => idx.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={{ width, alignItems: 'center', justifyContent: 'center' }}>
                <Image style={[styles.image, { width: width * 0.7, height: 220 }]} source={{ uri: item }} resizeMode='contain' />
              </View>
            )}
          />
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, activeIndex === idx && styles.activeDot]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Product Info Card */}
      <View style={[styles.infoCard, { minHeight: height * 0.5, flexGrow: 1 }]}>
        {/* Title */}
        <Text style={styles.title}>{part.name}</Text>
        {/* Price and Brand Row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{part.price}$</Text>
          {/* Brand badge */}
          <View style={styles.brandBadge}>
            <Image source={{uri:'https://pbs.twimg.com/profile_images/1760289777180405761/skE3Y_hJ_400x400.png'}} style={styles.brandLogo} />
            <Text style={styles.brandText}>Motorcraft</Text>
          </View>
        </View>
        {/* Details */}
        <Text style={styles.sectionTitle}>Detalles:</Text>
        <View style={{marginTop: 4, marginBottom: 12}}>
          <Text style={styles.detailLabel}>Modelo: <Text style={styles.detailValue}>0W20</Text></Text>
          <Text style={styles.detailLabel}>Garantía: <Text style={styles.detailValue}>1 mes</Text></Text>
        </View>
        {/* Quantity Row */}
        <View style={{marginTop: 20, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={styles.subtitle}>Cantidad:</Text>
          <Pressable style={styles.quantityBox} onPress={() => setModalVisible(true)}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </Pressable>
        </View>
        {/* Modal de selección de cantidad */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              {[...Array(10)].map((_, idx) => (
                <Pressable
                  key={idx + 1}
                  style={styles.modalOption}
                  onPress={() => {
                    setQuantity(idx + 1);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{idx + 1}</Text>
                </Pressable>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.cartButton}>
            <Ionicons name='cart-outline' size={18} color={primaryColor} style={{marginRight: 10}} />
            <Text style={styles.cartButtonText}>Agregar</Text>
          </Pressable>
          <Pressable style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Comprar ahora</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

export default PartScreen

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
    backgroundColor: '#A0AEC0',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  imageContainer: {
    marginTop: 48,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 24,
    height: 240,
  },
  image: {
    borderRadius: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#1976D2',
    width: 12,
    height: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    width: '100%',
    alignSelf: 'center',
    // Elimina cualquier margen lateral que cause fondo gris visible
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    color: '#001845',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#001845',
    marginRight: 16,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: 0,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 4,
    backgroundColor: 'white',
  },
  brandText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
    backgroundColor: '#E63946',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  sectionTitle: {
    color: '#001845',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 2,
  },
  detailLabel: {
    color: '#001845',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    color: '#7D8597',
    fontWeight: '400',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  quantityBox: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: 'white',
    width: '48%',
    justifyContent: 'center',
  },
  cartButtonText: {
    color: '#1976D2',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center'
  },
  buyButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '48%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: 200,
    alignItems: 'center',
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: '700',
  },
  subtitle: {
    color: '#001845',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 2,
  },
});
