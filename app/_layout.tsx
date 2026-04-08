import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { HouseholdsProvider } from '@/lib/HouseholdsContext';
import { useCustomFonts } from '@/hooks/useFonts';
import { Colors } from '@/constants';

export default function RootLayout() {
  const fontsLoaded = useCustomFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <HouseholdsProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'HCA Park Dues',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="admin" 
          options={{ 
            title: 'Admin Dashboard',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="household/[id]" 
          options={{ 
            title: 'Household',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
      </Stack>
    </HouseholdsProvider>
  );
}