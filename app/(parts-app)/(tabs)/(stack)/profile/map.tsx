import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocationStore } from '@/presentation/store/useLocationStore';

const { width, height } = Dimensions.get('window');

// Lee la API Key pública de MapTiler desde variables de entorno Expo
// Configúrala como EXPO_PUBLIC_MAPTILER_KEY en tu .env o en app.json -> expo.extra
const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY || 'YOUR_MAPTILER_KEY_HERE';

// Coordenadas de las zonas permitidas en Carabobo
const ALLOWED_ZONES = {
  valencia: {
    name: 'Valencia',
    bounds: {
      north: 10.2500,
      south: 10.1200,
      east: -67.9500,
      west: -68.1000,
    },
    center: { latitude: 10.1621, longitude: -68.0077 }
  },
  sanDiego: {
    name: 'San Diego',
    bounds: {
      north: 10.2800,
      south: 10.2200,
      east: -67.9800,
      west: -68.0500,
    },
    center: { latitude: 10.2500, longitude: -68.0150 }
  },
  naguanagua: {
    name: 'Naguanagua',
    bounds: {
      north: 10.2800,
      south: 10.2000,
      east: -67.9000,
      west: -68.0000,
    },
    center: { latitude: 10.2400, longitude: -67.9500 }
  }
};

const MapScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSelectedLocation: setGlobalLocation } = useLocationStore();
  
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    zone: string;
  } | null>(null);
  
  const [searchText, setSearchText] = useState('');
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: ALLOWED_ZONES.valencia.center.latitude,
    longitude: ALLOWED_ZONES.valencia.center.longitude,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });
  
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{
    id: string;
    place_name: string;
    center: [number, number];
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  
  // Ref para el timeout del debounce
  const searchTimeoutRef = useRef<number | null>(null);

  // Solicitar permisos y obtener ubicación del usuario
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          setLocationPermission(true);
          
          // Obtener ubicación actual con precisión balanceada
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });
          
          // Verificar si el usuario está en una zona permitida
          const allowedZone = isLocationAllowed(latitude, longitude);
          
          if (allowedZone) {
            // Centrar el mapa en la ubicación del usuario
            setMapRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
            
            // Obtener dirección de la ubicación actual
            const address = await getAddressFromCoords(latitude, longitude, allowedZone);
            setSelectedLocation({
              latitude,
              longitude,
              address,
              zone: allowedZone
            });
            setSearchText(address);
          } else {
            // Si no está en zona permitida, mantener el centro por defecto
            Alert.alert(
              'Ubicación fuera de zona',
              'Tu ubicación actual está fuera de las zonas de servicio. El mapa se centrará en Valencia.',
              [{ text: 'OK' }]
            );
          }
        } else {
          setLocationPermission(false);
          Alert.alert(
            'Permisos de ubicación',
            'Para una mejor experiencia, permite el acceso a tu ubicación.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        Alert.alert(
          'Error de ubicación',
          'No se pudo obtener tu ubicación actual.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoadingLocation(false);
      }
    };

    requestLocationPermission();
  }, []);

  // Verificar si una coordenada está dentro de las zonas permitidas
  const isLocationAllowed = (latitude: number, longitude: number) => {
    for (const zone of Object.values(ALLOWED_ZONES)) {
      if (
        latitude >= zone.bounds.south &&
        latitude <= zone.bounds.north &&
        longitude >= zone.bounds.west &&
        longitude <= zone.bounds.east
      ) {
        return zone.name;
      }
    }
    return null;
  };

  // Búsqueda de lugares con autocompletado
  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Buscar solo en Venezuela/Carabobo para optimizar
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}&language=es&country=VE&limit=5&proximity=${ALLOWED_ZONES.valencia.center.longitude},${ALLOWED_ZONES.valencia.center.latitude}`
      );
      
      if (!response.ok) {
        throw new Error('Error en búsqueda');
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const suggestions = data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name || feature.text,
          center: feature.center
        }));
        
        setSearchSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Manejar selección de sugerencia
  const handleSuggestionSelect = async (suggestion: any) => {
    const [longitude, latitude] = suggestion.center;
    
    // Verificar si está en zona permitida
    const allowedZone = isLocationAllowed(latitude, longitude);
    
    if (allowedZone) {
      // Centrar mapa en la ubicación
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      // Establecer como ubicación seleccionada
      setSelectedLocation({
        latitude,
        longitude,
        address: suggestion.place_name,
        zone: allowedZone
      });
      
      setSearchText(suggestion.place_name);
      setShowSuggestions(false);
    } else {
      Alert.alert(
        'Zona no disponible',
        'Esta ubicación está fuera de las zonas de servicio.',
        [{ text: 'OK' }]
      );
      setShowSuggestions(false);
    }
  };

  // Manejar cambio en el texto de búsqueda
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    
    // Debounce la búsqueda para no hacer muchas llamadas
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(text);
    }, 300);
  };

  // Geocodificación inversa real usando MapTiler
  const getAddressFromCoords = async (latitude: number, longitude: number, zoneName: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${MAPTILER_KEY}&language=es`
      );
      
      if (!response.ok) {
        throw new Error('Error en geocodificación');
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const placeName = feature.place_name || feature.text;
        
        // Si encontramos una dirección, la usamos
        if (placeName) {
          return placeName;
        }
      }
      
      // Fallback si no encontramos dirección específica
      return `Ubicación en ${zoneName}, Carabobo, Venezuela`;
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return `Ubicación en ${zoneName}, Carabobo, Venezuela`;
    }
  };

  // Manejar toque en el mapa
  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    const allowedZone = isLocationAllowed(latitude, longitude);
    
    if (allowedZone) {
      // Mostrar ubicación temporal mientras obtenemos la dirección
      setSelectedLocation({
        latitude,
        longitude,
        address: 'Obteniendo dirección...',
        zone: allowedZone
      });
      setSearchText('Obteniendo dirección...');
      
      // Obtener dirección real
      const address = await getAddressFromCoords(latitude, longitude, allowedZone);
      setSelectedLocation({
        latitude,
        longitude,
        address,
        zone: allowedZone
      });
      setSearchText(address);
    } else {
      Alert.alert(
        'Zona no disponible',
        'Solo puedes seleccionar ubicaciones en Valencia, San Diego o Naguanagua.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      // Guardar la ubicación en el store global
      setGlobalLocation(selectedLocation);
      
      Alert.alert(
        'Ubicación confirmada',
        `${selectedLocation.address}\n\nZona: ${selectedLocation.zone}`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            }
          }
        ]
      );
    }
  };


  // Mostrar loading mientras se obtiene la ubicación
  if (isLoadingLocation) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con búsqueda */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1976D2" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder="Buscar dirección en Carabobo..."
            placeholderTextColor="#999"
            onFocus={() => {
              if (searchSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
        </View>
        
        {/* Sugerencias de búsqueda */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {searchSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(suggestion)}
              >
                <Ionicons name="location-outline" size={16} color="#1976D2" />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {suggestion.place_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Mapa real */}
      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        onPress={(event) => {
          setShowSuggestions(false);
          handleMapPress(event);
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        mapType="standard"
      >
        {/* Capa de tiles gratuitos de MapTiler (OSM) */}
        <UrlTile
          urlTemplate={`https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
          maximumZ={19}
          zIndex={0}
          tileCacheMaxAge={60 * 60 * 24 * 7}
        />

        {/* Marcador de ubicación del usuario */}
        {userLocation && locationPermission && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Tu ubicación"
            description="Ubicación actual"
            pinColor="#4CAF50"
          />
        )}

        {/* Marcador de ubicación seleccionada */}
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title={selectedLocation.zone}
            description={selectedLocation.address}
            pinColor="#1976D2"
          />
        )}
      </MapView>

      {/* Panel inferior */}
      <View style={styles.bottomPanel}>
        <Text style={styles.instructionTitle}>Marca el punto en el mapa</Text>
        <Text style={styles.instructionText}>
          Toca el mapa e indica la ubicación exacta
        </Text>
        
        {selectedLocation && (
          <View style={styles.selectedInfo}>
            <Ionicons name="location-outline" size={16} color="#1976D2" />
            <Text style={styles.selectedText}>{selectedLocation.address}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedLocation && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={!selectedLocation}
        >
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#1976D2',
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomPanel: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001845',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MapScreen;
