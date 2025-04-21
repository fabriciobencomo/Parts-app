import { useThemeColor } from '@/hooks/useThemeColor';
import iconSet from '@expo/vector-icons/build/Fontisto';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, useColorScheme } from 'react-native';


const SearchComponent = () => {
  const [searchText, setSearchText] = useState('');
  
  const backgroundColor = useThemeColor({} , 'primary')


  const handleSearch = (text: string) => {
    setSearchText(text);
    // Add your search logic here
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color="#000" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search..."
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001845',
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white'
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
});

export default SearchComponent;