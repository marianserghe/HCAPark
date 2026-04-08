import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Colors, DUES_AMOUNT, DUES_WITH_FEE } from '@/constants';
import { Fonts } from '@/constants/styles';
import { supabase, Household } from '@/lib/supabase';
import { PaymentModal } from '@/components/PaymentModal';

export default function HouseholdScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  async function handleStripePayment() {
    setShowPaymentModal(true);
  }

  async function handlePaymentComplete(method: 'card' | 'venmo' | 'check' | 'cash') {
    if (!household) return;
    
    try {
      const { error } = await supabase
        .from('households')
        .update({
          status: 'paid',
          amount_paid: method === 'card' ? DUES_WITH_FEE : DUES_AMOUNT,
          paid_at: new Date().toISOString(),
        })
        .eq('id', household.id);
      
      if (error) throw error;
      
      // Refresh household data
      await loadHousehold(household.id);
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
    <>
      <Stack.Screen 
        options={{
          title: `${household.house_number} ${household.street}`,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Header */}
      <View style={[
        styles.statusHeader,
        { backgroundColor: isPaid ? '#4CAF50' : '#F44336' }
      ]}>
        <Text style={styles.statusEmoji}>{isPaid ? '✓' : '✗'}</Text>
        <Text style={styles.statusText}>
          {isPaid ? 'PAID' : 'UNPAID'}
        </Text>
        {isPaid && household.paid_at && (
          <Text style={styles.statusDate}>
            {new Date(household.paid_at).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Address Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>ADDRESS</Text>
        <Text style={styles.cardValue}>{household.full_address}</Text>
        <Text style={styles.cardSubtext}>
          {household.first_name} {household.last_name}
          {household.spouse && ` & ${household.spouse}`}
        </Text>
      </View>

      {/* Dues Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>ANNUAL DUES</Text>
        
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Park Maintenance</Text>
          <Text style={styles.breakdownValue}>${DUES_AMOUNT.toFixed(2)}</Text>
        </View>
        
        {!isPaid && (
          <>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Processing Fee</Text>
              <Text style={styles.breakdownValue}>${(DUES_WITH_FEE - DUES_AMOUNT).toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>${DUES_WITH_FEE.toFixed(2)}</Text>
            </View>
          </>
        )}

        {isPaid && (
          <View style={styles.paidContainer}>
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.totalLabel}>PAID</Text>
              <Text style={[styles.totalValue, { color: '#4CAF50' }]}>${household.amount_paid.toFixed(2)}</Text>
            </View>
            {household.paid_at && (
              <Text style={styles.paidDate}>
                Paid on {new Date(household.paid_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Payment Buttons */}
      {!isPaid ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleStripePayment}
          >
            <Text style={styles.primaryButtonText}>PAY NOW — ${DUES_WITH_FEE.toFixed(2)}</Text>
          </TouchableOpacity>
          
          <Text style={styles.helpText}>
            Venmo, check, or cash? Tap above to see all payment options.
          </Text>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <View style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>🎉 THANK YOU!</Text>
            <Text style={styles.receiptText}>
              Your contribution helps keep our park beautiful for everyone.
            </Text>
            <Text style={styles.receiptSubtext}>
              {household.first_name} {household.last_name}{'\n'}
              {household.full_address}
            </Text>
          </View>
        </View>
      )}

      {/* Contact Info */}
      {household.phone && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CONTACT</Text>
          <Text style={styles.cardSubtext}>Phone: {household.phone}</Text>
          {household.email && <Text style={styles.cardSubtext}>Email: {household.email}</Text>}
        </View>
      )}
    </ScrollView>

    <PaymentModal
      visible={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      householdName={`${household?.first_name} ${household?.last_name}`}
      householdAddress={household?.full_address || ''}
      onPaymentComplete={handlePaymentComplete}
    />
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusHeader: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
  },
  statusEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  statusText: {
    fontFamily: Fonts.regular,
    fontSize: 32,
    letterSpacing: 2,
    color: '#fff',
  },
  statusDate: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardValue: {
    fontFamily: Fonts.regular,
    fontSize: 24,
    color: Colors.text,
    letterSpacing: 1,
  },
  cardSubtext: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.text,
  },
  breakdownValue: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontFamily: Fonts.regular,
    fontSize: 22,
    color: Colors.text,
    letterSpacing: 1,
  },
  totalValue: {
    fontFamily: Fonts.regular,
    fontSize: 26,
    color: Colors.primary,
    letterSpacing: 1,
  },
  paidContainer: {
    marginTop: 8,
  },
  paidDate: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 20,
    color: '#fff',
    letterSpacing: 1,
  },
  helpText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  receiptCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  receiptTitle: {
    fontFamily: Fonts.regular,
    fontSize: 28,
    color: '#4CAF50',
    marginBottom: 12,
  },
  receiptText: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  receiptSubtext: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});