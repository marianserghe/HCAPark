export const Colors = {
  primary: '#32327b',      // Deep purple-blue
  primaryDark: '#252560',  // Darker purple-blue
  secondary: '#4A4A9E',    // Lighter purple-blue
  error: '#F44336',        // Red - unpaid
  warning: '#FF9800',      // Orange
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
};

export const DUES_AMOUNT = 50.00;
export const STRIPE_FEE_PERCENT = 0.029;
export const STRIPE_FEE_FIXED = 0.30;

// Calculate total so neighborhood receives exactly DUES_AMOUNT
export const calculateTotalWithFee = () => {
  const total = Math.ceil((DUES_AMOUNT + STRIPE_FEE_FIXED) / (1 - STRIPE_FEE_PERCENT) * 100) / 100;
  return total;
};

export const DUES_WITH_FEE = calculateTotalWithFee(); // ~$51.80

export const PARK_LOCATION = {
  latitude: 41.0105,   // Waldwick, NJ center
  longitude: -74.1035,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};