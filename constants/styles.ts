import { StyleSheet } from 'react-native';
import { Colors } from './index';

// Bebas Neue font for headers and important text
export const Fonts = {
  regular: 'BebasNeue',
  fallback: 'System',
};

// Typography - increased by 15%
export const Typography = {
  hero: {
    fontFamily: Fonts.regular,
    fontSize: 55,  // 48 * 1.15
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.regular,
    fontSize: 37,  // 32 * 1.15
    letterSpacing: 1,
  },
  heading: {
    fontFamily: Fonts.regular,
    fontSize: 28,  // 24 * 1.15
    letterSpacing: 1,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 21,  // 18 * 1.15
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 16,  // 14 * 1.15
    letterSpacing: 0.5,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: Fonts.regular,
  },
});