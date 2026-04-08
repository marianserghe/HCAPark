import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { HouseholdsProvider } from '@/lib/HouseholdsContext';
import { Colors } from '@/constants';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BebasNeue: require('../assets/fonts/BebasNeue-Regular.ttf'),
    RobotoCondensed: require('../assets/fonts/RobotoCondensed-Regular.ttf'),
  });
  
  const [timeout, setTimedOut] = useState(false);
  
  // Fallback timeout in case fonts never load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fontsLoaded) {
        console.log('Font loading timeout, proceeding anyway');
        setTimedOut(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!fontsLoaded && !timeout) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }  
  
  if (fontError) {
    console.log('Font error:', fontError);
  }

  return (
    <HouseholdsProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="payment" 
          options={{ 
            headerBackTitle: '',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="admin" 
          options={{ 
            headerBackTitle: '',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="household/[id]" 
          options={{ 
            headerBackTitle: '',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            headerBackTitle: '',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
      </Stack>
    </HouseholdsProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});