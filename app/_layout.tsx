import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Image, StyleSheet, View, ActivityIndicator } from 'react-native';
import { HouseholdsProvider } from '@/lib/HouseholdsContext';
import { Colors } from '@/constants';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue: require('../assets/fonts/BebasNeue-Regular.ttf'),
    RobotoCondensed: require('../assets/fonts/RobotoCondensed-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <HouseholdsProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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