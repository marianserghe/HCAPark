import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// TODO: Replace with your Supabase project credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// SecureStore adapter for session persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types
export interface Household {
  id: string;
  house_number: string;
  street: string;
  full_address: string;
  last_name: string;
  first_name: string;
  spouse?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  status: 'paid' | 'unpaid';
  amount_paid: number;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  household_id: string;
  amount: number;
  method: 'stripe' | 'venmo' | 'check' | 'cash';
  stripe_payment_id?: string;
  created_at: string;
}