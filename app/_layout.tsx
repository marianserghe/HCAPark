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
            headerTitle: 'HCA PARK DUES',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="admin" 
          options={{ 
            headerTitle: 'ADMIN DASHBOARD',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="household/[id]" 
          options={{ 
            headerTitle: 'HOUSEHOLD',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }} 
        />
      </Stack>
    </HouseholdsProvider>
  );
}