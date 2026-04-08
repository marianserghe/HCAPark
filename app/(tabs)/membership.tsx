import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Fonts } from '@/constants/styles';

const MEMBERSHIP_TIERS = [
  {
    id: 'individual',
    name: 'Individual',
    price: 50,
    period: 'year',
    description: 'Annual membership for one household',
    features: [
      'Park maintenance support',
      'Community events access',
      'Voting rights at meetings',
      'Newsletter subscription',
    ],
    popular: false,
  },
  {
    id: 'family',
    name: 'Family',
    price: 75,
    period: 'year',
    description: 'Annual membership for families',
    features: [
      'All Individual benefits',
      'Priority event registration',
      'Reserved picnic area access',
      'Discounted event tickets',
    ],
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 500,
    period: 'one-time',
    description: 'One-time payment, lifetime membership',
    features: [
      'All Family benefits',
      'Name on park recognition board',
      'Exclusive member events',
      'Legacy contribution',
    ],
    popular: false,
  },
];

export default function MembershipScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Membership',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>JOIN OUR COMMUNITY</Text>
          <Text style={styles.headerSubtitle}>
            Your membership helps keep our park beautiful for everyone
          </Text>
        </View>

        <View style={styles.tiers}>
          {MEMBERSHIP_TIERS.map(tier => (
            <View 
              key={tier.id} 
              style={[styles.tierCard, tier.popular && styles.tierCardPopular]}
            >
              {tier.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <Text style={styles.tierName}>{tier.name}</Text>
              <View style={styles.tierPrice}>
                <Text style={styles.tierPriceAmount}>${tier.price}</Text>
                <Text style={styles.tierPricePeriod}>
                  /{tier.period === 'year' ? 'year' : 'one-time'}
                </Text>
              </View>
              <Text style={styles.tierDescription}>{tier.description}</Text>
              
              <View style={styles.features}>
                {tier.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Feather name="check" size={16} color={Colors.primary} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.selectButton, tier.popular && styles.selectButtonPopular]}
                onPress={() => router.push('/pay-dues' as never)}
              >
                <Text style={styles.selectButtonText}>
                  {tier.id === 'lifetime' ? 'SELECT' : 'JOIN NOW'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Questions about membership?{'\n'}
            Contact us at membership@hcapark.org
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.headline,
    fontSize: 28,
    color: '#fff',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  tiers: {
    padding: 16,
  },
  tierCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  tierCardPopular: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  tierName: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: Colors.text,
    letterSpacing: 1,
    marginBottom: 8,
  },
  tierPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  tierPriceAmount: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: Colors.primary,
  },
  tierPricePeriod: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  tierDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  features: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  selectButtonPopular: {
    backgroundColor: Colors.primaryDark,
  },
  selectButtonText: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});