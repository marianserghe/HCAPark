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