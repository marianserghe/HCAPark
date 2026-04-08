import { StyleSheet } from 'react-native';
import { Colors } from './index';

// Fonts
export const Fonts = {
  headline: 'BebasNeue',
  body: 'RobotoCondensed',
  // Alias for backwards compatibility
  regular: 'BebasNeue',
};

// Typography
export const Typography = {
  hero: {
    fontFamily: Fonts.headline,
    fontSize: 55,
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 37,
    letterSpacing: 1,
  },
  heading: {
    fontFamily: Fonts.headline,
    fontSize: 28,
    letterSpacing: 1,
  },
  bodyLarge: {
    fontFamily: Fonts.body,
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 18,
    lineHeight: 26,
  },
  bodySmall: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 18,
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
});