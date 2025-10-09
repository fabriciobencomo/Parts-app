import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Using TouchableOpacity buttons instead of slider for better compatibility
import type { Brand } from '@/core/products/interfaces/brand.interface';
import type { Category } from '@/core/products/interfaces/category.interface';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper function to generate price range options
const getPriceRangeOptions = (priceRange: { min: number; max: number }) => {
  const { min, max } = priceRange;
  const range = max - min;
  
  // If range is too small, just return "all prices" option
  if (range <= 10) {
    return [
      { id: 'all', min, max, label: 'Todos los precios' }
    ];
  }
  
  const quarter = Math.round(range * 0.25);
  const half = Math.round(range * 0.5);
  const threeQuarters = Math.round(range * 0.75);
  
  const options = [
    { id: 'all', min, max, label: 'Todos los precios' },
    { id: 'low', min, max: min + quarter, label: `$${min} - $${min + quarter}` },
    { id: 'mid-low', min: min + quarter + 1, max: min + half, label: `$${min + quarter + 1} - $${min + half}` },
    { id: 'mid-high', min: min + half + 1, max: min + threeQuarters, label: `$${min + half + 1} - $${min + threeQuarters}` },
    { id: 'high', min: min + threeQuarters + 1, max, label: `$${min + threeQuarters + 1} - $${max}` },
  ];
  
  // Filter out options where min >= max (except for "all")
  return options.filter(option => option.id === 'all' || option.min < option.max);
};

export interface FilterOptions {
  brands: string[];
  categories: string[];
  priceRange: { min: number; max: number };
  inStockOnly: boolean;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  availableBrands: Brand[];
  availableCategories: Category[];
  priceRange: { min: number; max: number };
  currentFilters: FilterOptions;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  availableBrands,
  availableCategories,
  priceRange,
  currentFilters,
}) => {
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentFilters.brands);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.categories);
  const [selectedPriceRange, setSelectedPriceRange] = useState(currentFilters.priceRange);
  const [inStockOnly, setInStockOnly] = useState(currentFilters.inStockOnly);

  useEffect(() => {
    setSelectedBrands(currentFilters.brands);
    setSelectedCategories(currentFilters.categories);
    setSelectedPriceRange(currentFilters.priceRange);
    setInStockOnly(currentFilters.inStockOnly);
  }, [currentFilters]);

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      brands: selectedBrands,
      categories: selectedCategories,
      priceRange: selectedPriceRange,
      inStockOnly,
    });
    onClose();
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedPriceRange(priceRange);
    setInStockOnly(false);
  };

  const hasActiveFilters = 
    selectedBrands.length > 0 || 
    selectedCategories.length > 0 || 
    selectedPriceRange.min !== priceRange.min || 
    selectedPriceRange.max !== priceRange.max ||
    inStockOnly;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtros</Text>
          <TouchableOpacity onPress={handleClearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stock Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disponibilidad</Text>
            <View style={styles.stockFilter}>
              <Text style={styles.stockFilterText}>Solo productos en stock</Text>
              <Switch
                value={inStockOnly}
                onValueChange={setInStockOnly}
                trackColor={{ false: '#E5E5E5', true: '#1976D2' }}
                thumbColor={inStockOnly ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Price Range Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rango de Precio</Text>
            <View style={styles.priceRangeContainer}>
              <Text style={styles.priceRangeText}>
                ${selectedPriceRange.min} - ${selectedPriceRange.max}
              </Text>
              <View style={styles.priceRangeButtons}>
                {getPriceRangeOptions(priceRange).map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.priceRangeButton,
                      selectedPriceRange.min === option.min && 
                      selectedPriceRange.max === option.max && 
                      styles.priceRangeButtonSelected
                    ]}
                    onPress={() => setSelectedPriceRange({ min: option.min, max: option.max })}
                  >
                    <Text style={[
                      styles.priceRangeButtonText,
                      selectedPriceRange.min === option.min && 
                      selectedPriceRange.max === option.max && 
                      styles.priceRangeButtonTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Brands Filter */}
          {availableBrands.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Marcas ({selectedBrands.length} seleccionadas)
              </Text>
              <View style={styles.optionsContainer}>
                {availableBrands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    style={[
                      styles.optionItem,
                      selectedBrands.includes(brand.id) && styles.optionItemSelected
                    ]}
                    onPress={() => toggleBrand(brand.id)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedBrands.includes(brand.id) && styles.optionTextSelected
                    ]}>
                      {brand.name}
                    </Text>
                    {selectedBrands.includes(brand.id) && (
                      <Ionicons name="checkmark" size={16} color="#1976D2" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Categories Filter */}
          {availableCategories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Categorías ({selectedCategories.length} seleccionadas)
              </Text>
              <View style={styles.optionsContainer}>
                {availableCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.optionItem,
                      selectedCategories.includes(category.id) && styles.optionItemSelected
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedCategories.includes(category.id) && styles.optionTextSelected
                    ]}>
                      {category.name}
                    </Text>
                    {selectedCategories.includes(category.id) && (
                      <Ionicons name="checkmark" size={16} color="#1976D2" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.applyButton, !hasActiveFilters && styles.applyButtonDisabled]}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>
              Aplicar Filtros
              {hasActiveFilters && ` (${
                selectedBrands.length + selectedCategories.length + 
                (inStockOnly ? 1 : 0) + 
                (selectedPriceRange.min !== priceRange.min || selectedPriceRange.max !== priceRange.max ? 1 : 0)
              })`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001845',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001845',
    marginBottom: 12,
  },
  stockFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  stockFilterText: {
    fontSize: 16,
    color: '#333',
  },
  priceRangeContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  priceRangeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 16,
  },
  priceRangeButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  priceRangeButton: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  priceRangeButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  priceRangeButtonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  priceRangeButtonTextSelected: {
    color: '#1976D2',
    fontWeight: '500',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#1976D2',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  applyButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FilterModal;
