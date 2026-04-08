import { Stack } from 'expo-router';
import { Image, StyleSheet } from 'react-native';
import { HouseholdsProvider } from '@/lib/HouseholdsContext';
import { Colors } from '@/constants';

export default function RootLayout() {
  return (
    <HouseholdsProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerTitle: () => (
              <Image 
                source={require('@/assets/logo.png')}
                style={styles.logo}
                tintColor="#fff"
              />
            ),
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="admin" 
          options={{ 
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="household/[id]" 
          options={{ 
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
      </Stack>
    </HouseholdsProvider>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
});