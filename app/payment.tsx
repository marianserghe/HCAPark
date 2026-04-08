import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ImageBackground,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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

// Manual payment instructions
const MANUAL_INSTRUCTIONS = {
  venmo: {
    title: 'VENMO',
    icon: 'smartphone' as const,
    instructions: [
      `Send $${TIERS.individual.price} to:`,
      '@HCAPark',
      '',
      'Include your name and address in the note.',
    ],
    note: 'Payment may take 1-2 business days to process.',
  },
  check: {
    title: 'CHECK',
    icon: 'file-text' as const,
    instructions: [
      'Make check payable to:',
      'HCA Park Association',
      '',
      'Mail to:',
      'PO Box 123',
      'Waldwick, NJ 07463',
    ],
    note: 'Write your name and address on the memo line.',
  },
  cash: {
    title: 'CASH',
    icon: 'dollar-sign' as const,
    instructions: [
      'Drop off cash payment at:',
      '123 Park Avenue',
      'Waldwick, NJ 07463',
      '',
      'Hours: Mon-Fri 9AM-5PM',
    ],
    note: 'Request a receipt for your records.',
  },
};

type PaymentMethod = 'card' | 'venmo' | 'check' | 'cash';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tier?: string }>();
  const tierId = (params.tier as keyof typeof TIERS) || 'individual';
  const tier = TIERS[tierId] || TIERS.individual;
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method === 'card') {
      setShowCardForm(true);
    }
  };

  const handleCardPayment = async () => {
    if (cardNumber.length < 16 || expiry.length < 5 || cvc.length < 3 || name.length < 2) {
      Alert.alert('Error', 'Please fill in all fields correctly.');
      return;
    }
    
    setProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessing(false);
    setShowCardForm(false);
    setShowSuccess(true);
  };

  const handleOfflinePayment = () => {
    setShowSuccess(true);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '').replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Membership Payment',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
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

            {/* Payment Methods */}
            <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
            
            <TouchableOpacity
              style={styles.methodButton}
              onPress={() => handleMethodSelect('card')}
            >
              <View style={styles.methodIconWrap}>
                <Feather name="credit-card" size={24} color="#fff" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>CREDIT/DEBIT CARD</Text>
                <Text style={styles.methodSubtext}>Instant • Processing fee may apply</Text>
              </View>
              <Text style={styles.methodArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodButton, styles.methodButtonAlt]}
              onPress={() => handleMethodSelect('venmo')}
            >
              <View style={[styles.methodIconWrap, styles.methodIconWrapAlt]}>
                <Feather name="smartphone" size={24} color={Colors.primary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodTitle, styles.methodTitleAlt]}>VENMO</Text>
                <Text style={[styles.methodSubtext, styles.methodSubtextAlt]}>${tier.price}.00 • No fee</Text>
              </View>
              <Text style={[styles.methodArrow, styles.methodArrowAlt]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodButton, styles.methodButtonAlt]}
              onPress={() => handleMethodSelect('check')}
            >
              <View style={[styles.methodIconWrap, styles.methodIconWrapAlt]}>
                <Feather name="file-text" size={24} color={Colors.primary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodTitle, styles.methodTitleAlt]}>CHECK</Text>
                <Text style={[styles.methodSubtext, styles.methodSubtextAlt]}>${tier.price}.00 • No fee</Text>
              </View>
              <Text style={[styles.methodArrow, styles.methodArrowAlt]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodButton, styles.methodButtonAlt]}
              onPress={() => handleMethodSelect('cash')}
            >
              <View style={[styles.methodIconWrap, styles.methodIconWrapAlt]}>
                <Feather name="dollar-sign" size={24} color={Colors.primary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodTitle, styles.methodTitleAlt]}>CASH</Text>
                <Text style={[styles.methodSubtext, styles.methodSubtextAlt]}>${tier.price}.00 • No fee</Text>
              </View>
              <Text style={[styles.methodArrow, styles.methodArrowAlt]}>›</Text>
            </TouchableOpacity>

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

      {/* Card Payment Modal */}
      <Modal
        visible={showCardForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCardForm(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ width: 32 }} />
              <Text style={styles.modalTitle}>CARD PAYMENT</Text>
              <TouchableOpacity onPress={() => setShowCardForm(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.planSummary}>
                <Text style={styles.planSummaryText}>{tier.name} Membership</Text>
                <Text style={styles.planSummaryPrice}>${tier.price}.00</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Smith"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CARD NUMBER</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="number-pad"
                  maxLength={19}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>EXPIRY</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    value={expiry}
                    onChangeText={(text) => setExpiry(formatExpiry(text))}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVC</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={cvc}
                    onChangeText={setCvc}
                    keyboardType="number-pad"
                    maxLength={4}
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.payButton}
                onPress={handleCardPayment}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.payButtonText}>PAY ${tier.price}.00</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Offline Payment Instructions Modal */}
      <Modal
        visible={selectedMethod !== null && selectedMethod !== 'card' && !showSuccess}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMethod(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ width: 32 }} />
              <Text style={styles.modalTitle}>
                {selectedMethod && MANUAL_INSTRUCTIONS[selectedMethod as 'venmo' | 'check' | 'cash']?.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedMethod(null)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.instructionsIconWrap}>
                <Feather 
                  name={selectedMethod ? MANUAL_INSTRUCTIONS[selectedMethod as 'venmo' | 'check' | 'cash']?.icon || 'info' : 'info'} 
                  size={32} 
                  color={Colors.primary} 
                />
              </View>

              <View style={styles.instructionsBox}>
                {selectedMethod && MANUAL_INSTRUCTIONS[selectedMethod as 'venmo' | 'check' | 'cash']?.instructions.map((line, i) => (
                  <Text key={i} style={styles.instructionLine}>{line}</Text>
                ))}
              </View>

              <Text style={styles.instructionsNote}>
                {selectedMethod && MANUAL_INSTRUCTIONS[selectedMethod as 'venmo' | 'check' | 'cash']?.note}
              </Text>

              <Text style={styles.amountDue}>Amount Due: ${tier.price}.00</Text>

              <TouchableOpacity
                style={styles.markPaidButton}
                onPress={handleOfflinePayment}
              >
                <Text style={styles.markPaidText}>I'VE SENT PAYMENT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>THANK YOU!</Text>
            <Text style={styles.successMessage}>
              Your {tier.name} membership payment has been recorded.
            </Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.back()}
            >
              <Text style={styles.doneButtonText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontFamily: Fonts.headline,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 16,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  methodButtonAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  methodIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodIconWrapAlt: {
    backgroundColor: 'rgba(50, 50, 123, 0.1)',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    color: '#fff',
    letterSpacing: 1,
  },
  methodTitleAlt: {
    color: Colors.text,
  },
  methodSubtext: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  methodSubtextAlt: {
    color: Colors.textSecondary,
  },
  methodArrow: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
  },
  methodArrowAlt: {
    color: Colors.textSecondary,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 10,
  },
  contactButtonText: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: Colors.primary,
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
  },
  closeText: {
    fontSize: 24,
    color: Colors.textSecondary,
    width: 32,
    textAlign: 'center',
  },
  modalContent: {
    padding: 20,
  },
  planSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planSummaryText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.text,
  },
  planSummaryPrice: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: Fonts.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputRow: {
    flexDirection: 'row',
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  payButtonText: {
    fontFamily: Fonts.headline,
    fontSize: 22,
    color: '#fff',
    letterSpacing: 1,
  },
  // Instructions modal
  instructionsIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(50, 50, 123, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  instructionsBox: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  instructionLine: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionsNote: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  amountDue: {
    fontFamily: Fonts.headline,
    fontSize: 22,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  markPaidButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  markPaidText: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1,
  },
  // Success modal
  successContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    margin: 20,
  },
  successIcon: {
    fontSize: 64,
    color: '#4CAF50',
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: Fonts.headline,
    fontSize: 32,
    color: '#4CAF50',
    marginBottom: 12,
    letterSpacing: 2,
  },
  successMessage: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  doneButtonText: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    color: '#fff',
    letterSpacing: 1,
  },
});