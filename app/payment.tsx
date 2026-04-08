import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Fonts } from '@/constants/styles';

const TIERS = {
  individual: {
    name: 'Individual',
    price: 50,
    period: 'year',
    description: 'Annual membership for one household',
  },
  family: {
    name: 'Family',
    price: 75,
    period: 'year',
    description: 'Annual membership for families',
  },
  lifetime: {
    name: 'Lifetime',
    price: 500,
    period: 'one-time',
    description: 'One-time payment, lifetime membership',
  },
};

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tier?: string }>();
  const tierId = (params.tier as keyof typeof TIERS) || 'individual';
  const tier = TIERS[tierId] || TIERS.individual;

  const totalWithFee = tier.price; // In future: add Stripe fee calculation

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Membership Payment',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <ImageBackground 
        source={require('@/assets/home-background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Selected Plan */}
            <View style={styles.planCard}>
              <Text style={styles.planName}>{tier.name} Membership</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>${tier.price}</Text>
                <Text style={styles.pricePeriod}>
                  /{tier.period === 'year' ? 'year' : 'one-time'}
                </Text>
              </View>
              <Text style={styles.planDescription}>{tier.description}</Text>
            </View>

            {/* Payment Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>PAYMENT SUMMARY</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{tier.name} Membership</Text>
                <Text style={styles.summaryValue}>${tier.price}.00</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotal}>Total</Text>
                <Text style={styles.summaryTotalAmount}>${totalWithFee}.00</Text>
              </View>
            </View>

            {/* Payment Instructions */}
            <View style={styles.infoCard}>
              <Feather name="info" size={20} color={Colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoTitle}>How to Pay</Text>
              <Text style={styles.infoText}>
                Membership payments are currently processed offline.{'\n\n'}
                Please send your payment via:{'\n\n'}
                • Venmo: @HCAPark{'\n'}
                • Check: Mail to HCA Park, Waldwick NJ 07463{'\n'}
                • Cash: Drop off at the park entrance{'\n\n'}
                Include your name and address with payment.
              </Text>
            </View>

            {/* Contact Button */}
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => router.push('/contact' as never)}
            >
              <Feather name="mail" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Questions? Contact Us</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(50, 50, 123, 0.425)',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  planName: {
    fontFamily: Fonts.headline,
    fontSize: 28,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceAmount: {
    fontFamily: Fonts.headline,
    fontSize: 48,
    color: Colors.text,
  },
  pricePeriod: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  planDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  summaryLabel: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
  },
  summaryValue: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  summaryTotal: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    color: Colors.text,
  },
  summaryTotalAmount: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    color: Colors.primary,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoTitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
  },
  contactButtonText: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1,
  },
});