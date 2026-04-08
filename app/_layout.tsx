import { Stack } from 'expo-router';
import { HouseholdsProvider } from '@/lib/HouseholdsContext';
import { Colors } from '@/constants';

export default function RootLayout() {
  return (
    <HouseholdsProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerTitle: 'HCA Park',
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