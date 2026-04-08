import { useFonts } from 'expo-font';

export function useCustomFonts() {
  const [loaded] = useFonts({
    'BebasNeue': require('../assets/fonts/BebasNeue-Regular.ttf'),
  });

  return loaded;
}