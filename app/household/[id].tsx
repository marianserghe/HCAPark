import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, DUES_AMOUNT, DUES_WITH_FEE } from '@/constants';
import { supabase, Household } from '@/lib/supabase';

export default function HouseholdScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadHousehold(id);
    }
  }, [id]);

  async function loadHousehold(householdId: string) {
    try {
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .eq('id', householdId)
        .single();
      
      if (error) throw error;
      setHousehold(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function markAsPaid() {
    if (!household) return;
    
    try {
      const { error } = await supabase
        .from('households')
        .update({
          status: 'paid',
          amount_paid: DUES_AMOUNT,
          paid_at: new Date().toISOString(),
        })
        .eq('id', household.id);
      
      if (error) throw error;
      
      Alert.alert('Success', 'Payment recorded! Your home is now green on the map. 🎉');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!household) {
    return (
      <View style={styles.centered}>
        <Text>Household not found</Text>
      </View>
    );
  }

  const isPaid = household.status === 'paid';

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={[
        styles.statusHeader,
        { backgroundColor: isPaid ? Colors.primary : Colors.error }
      ]}>
        <Text style={styles.statusEmoji}>{isPaid ? '✓' : '✗'}</Text>
        <Text style={styles.statusText}>
          {isPaid ? 'PAID' : 'UNPAID'}
        </Text>
      </View>

      {/* Address */}
      <View style={styles.section}>
        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{household.full_address}</Text>
      </View>

      {/* Resident */}
      <View style={styles.section}>
        <Text style={styles.label}>Resident</Text>
        <Text style={styles.value}>
          {household.first_name} {household.last_name}
          {household.spouse && ` & ${household.spouse}`}
        </Text>
      </View>

      {/* Dues Info */}
      <View style={styles.section}>
        <Text style={styles.label}>Annual Dues</Text>
        <Text style={styles.value}>${DUES_AMOUNT.toFixed(2)}</Text>
      </View>

      {isPaid ? (
        /* Already Paid */
        <View style={styles.paidSection}>
          <Text style={styles.paidTitle}>Thank you for your contribution! 🎉</Text>
          <Text style={styles.paidText}>
            Your dues were paid${household.paid_at ? ` on ${new Date(household.paid_at).toLocaleDateString()}` : ''}.
          </Text>
          <Text style={styles.paidText}>
            Amount: ${household.amount_paid.toFixed(2)}
          </Text>
        </View>
      ) : (
        /* Pay Button */
        <View style={styles.paySection}>
          <Text style={styles.amountLabel}>Amount Due</Text>
          <Text style={styles.amountBreakdown}>
            Dues: ${DUES_AMOUNT.toFixed(2)}
          </Text>
          <Text style={styles.amountBreakdown}>
            Processing fee: ${(DUES_WITH_FEE - DUES_AMOUNT).toFixed(2)}
          </Text>
          <Text style={styles.amountTotal}>
            Total: ${DUES_WITH_FEE.toFixed(2)}
          </Text>

          <TouchableOpacity 
            style={styles.payButton}
            onPress={markAsPaid}
          >
            <Text style={styles.payButtonText}>Pay Dues</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            (Payment integration coming soon. For now, contact your park admin.)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusHeader: {
    padding: 20,
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
  },
  paidSection: {
    backgroundColor: '#E8F5E9',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  paidTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  paidText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  paySection: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  amountBreakdown: {
    fontSize: 16,
    color: Colors.text,
  },
  amountTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginVertical: 16,
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});