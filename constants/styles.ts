import { StyleSheet } from 'react-native';
import { Colors } from './index';

// Use system font as fallback - Bebas may not load on all devices
export const Fonts = {
  regular: 'BebasNeue',
  fallback: 'System',
};

export const Typography = {
  hero: {
    fontFamily: Fonts.regular,
    fontSize: 48,
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.regular,
    fontSize: 32,
    letterSpacing: 1,
  },
  heading: {
    fontFamily: Fonts.regular,
    fontSize: 24,
    letterSpacing: 1,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 14,
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