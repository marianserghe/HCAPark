import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '@/constants';
import { Fonts } from '@/constants/styles';
import { DUES_AMOUNT, DUES_WITH_FEE } from '@/constants';

type PaymentMethod = 'card' | 'venmo' | 'check' | 'cash';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  householdName: string;
  householdAddress: string;
  onPaymentComplete: (method: PaymentMethod) => Promise<void>;
}

// Luhn algorithm for card number validation
function isValidCardNumber(number: string): boolean {
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Get card type from number
function getCardType(number: string): string {
  const cleaned = number.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'Amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  return '';
}

// Validate expiry date
function isValidExpiry(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
}

// Manual payment instructions
const MANUAL_INSTRUCTIONS = {
  venmo: {
    title: 'VENMO',
    icon: '📱',
    instructions: [
      'Send $50.00 to:',
      '@HCAParkDues',
      '',
      'Include your address in the note:',
      '123 Main St',
    ],
    note: 'Payment may take 1-2 business days to process.',
  },
  check: {
    title: 'CHECK',
    icon: '📝',
    instructions: [
      'Make check payable to:',
      'HCA Park Association',
      '',
      'Mail to:',
      'PO Box 123',
      'Waldwick, NJ 07463',
    ],
    note: 'Write your address on the memo line.',
  },
  cash: {
    title: 'CASH',
    icon: '💵',
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

export function PaymentModal({
  visible,
  onClose,
  householdName,
  householdAddress,
  onPaymentComplete,
}: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'details' | 'instructions' | 'processing' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState<{ cardNumber?: string; expiry?: string; cvc?: string; zipCode?: string; cardholderName?: string }>({});

  const validateCard = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!isValidCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Enter a valid card number';
    }
    
    if (!isValidExpiry(expiry)) {
      newErrors.expiry = 'Enter a valid expiry date';
    }
    
    if (cvc.length < 3) {
      newErrors.cvc = 'Enter 3-4 digit CVC';
    }
    
    if (zipCode.length < 5) {
      newErrors.zipCode = 'Enter ZIP code';
    }
    
    if (cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Enter cardholder name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setErrors({});
    if (method === 'card') {
      setStep('details');
    } else {
      // Show instructions for manual payment
      setStep('instructions');
    }
  };

  const handleOfflinePayment = async (method: PaymentMethod) => {
    setStep('processing');
    await onPaymentComplete(method);
    setStep('success');
  };

  const handleCardPayment = async () => {
    if (!validateCard()) return;
    
    setStep('processing');
    // TODO: Integrate with Stripe
    await onPaymentComplete('card');
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('method');
    setSelectedMethod(null);
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setZipCode('');
    setCardholderName('');
    setErrors({});
    onClose();
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

  const cardType = getCardType(cardNumber);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>PAY DUES</Text>
            <TouchableOpacity style={styles.closeButton} onPress={resetAndClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Property Info */}
          <View style={styles.propertyCard}>
            <Text style={styles.propertyAddress}>{householdAddress}</Text>
            <Text style={styles.propertyOwner}>{householdName}</Text>
          </View>

          {step === 'method' && (
            <ScrollView style={styles.content}>
              {/* Amount Breakdown */}
              <View style={styles.breakdownCard}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Annual Park Dues</Text>
                  <Text style={styles.breakdownValue}>${DUES_AMOUNT.toFixed(2)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Processing Fee</Text>
                  <Text style={styles.breakdownValue}>${(DUES_WITH_FEE - DUES_AMOUNT).toFixed(2)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.breakdownRow}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalValue}>${DUES_WITH_FEE.toFixed(2)}</Text>
                </View>
              </View>

              {/* Payment Methods */}
              <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
              
              <TouchableOpacity
                style={styles.methodButton}
                onPress={() => handleMethodSelect('card')}
              >
                <Text style={styles.methodIcon}>💳</Text>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>CREDIT/DEBIT CARD</Text>
                  <Text style={styles.methodSubtext}>Instant • $1.80 fee applies</Text>
                </View>
                <Text style={styles.methodArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodButton, styles.methodButtonAlt]}
                onPress={() => handleMethodSelect('venmo')}
              >
                <Text style={styles.methodIcon}>📱</Text>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, styles.methodTitleAlt]}>VENMO</Text>
                  <Text style={[styles.methodSubtext, styles.methodSubtextAlt]}>$50.00 • No fee</Text>
                </View>
                <Text style={[styles.methodArrow, styles.methodArrowAlt]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodButton, styles.methodButtonAlt]}
                onPress={() => handleMethodSelect('check')}
              >
                <Text style={styles.methodIcon}>📝</Text>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, styles.methodTitleAlt]}>CHECK</Text>
                  <Text style={[styles.methodSubtext, styles.methodSubtextAlt]}>$50.00 • No fee</Text>
                </View>
                <Text style={[styles.methodArrow, styles.methodArrowAlt]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodButton, styles.methodButtonAlt]}
                onPress={() => handleMethodSelect('cash')}
              >
                <Text style={styles.methodIcon}>💵</Text>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, styles.methodTitleAlt]}>CASH</Text>
                  <Text style={[styles.methodSubtext, styles.methodSubtextAlt]}>$50.00 • No fee</Text>
                </View>
                <Text style={[styles.methodArrow, styles.methodArrowAlt]}>›</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {step === 'details' && (
            <ScrollView style={styles.content}>
              <Text style={styles.sectionTitle}>CARD DETAILS</Text>
              
              {/* Card Preview */}
              {cardType && (
                <View style={styles.cardPreview}>
                  <Text style={styles.cardPreviewText}>{cardType}</Text>
                </View>
              )}
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
                <TextInput
                  style={[styles.input, errors.cardholderName && styles.inputError]}
                  placeholder="John Smith"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  autoCapitalize="words"
                  placeholderTextColor={Colors.textSecondary}
                />
                {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CARD NUMBER</Text>
                <TextInput
                  style={[styles.input, errors.cardNumber && styles.inputError]}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="number-pad"
                  maxLength={19}
                  placeholderTextColor={Colors.textSecondary}
                />
                {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>EXPIRY</Text>
                  <TextInput
                    style={[styles.input, errors.expiry && styles.inputError]}
                    placeholder="MM/YY"
                    value={expiry}
                    onChangeText={(text) => setExpiry(formatExpiry(text))}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholderTextColor={Colors.textSecondary}
                  />
                  {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>CVC</Text>
                  <TextInput
                    style={[styles.input, errors.cvc && styles.inputError]}
                    placeholder="123"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={cvc}
                    onChangeText={setCvc}
                    placeholderTextColor={Colors.textSecondary}
                  />
                  {errors.cvc && <Text style={styles.errorText}>{errors.cvc}</Text>}
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>ZIP</Text>
                  <TextInput
                    style={[styles.input, errors.zipCode && styles.inputError]}
                    placeholder="07463"
                    keyboardType="number-pad"
                    maxLength={5}
                    value={zipCode}
                    onChangeText={setZipCode}
                    placeholderTextColor={Colors.textSecondary}
                  />
                  {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
                </View>
              </View>

              <TouchableOpacity
                style={styles.payButton}
                onPress={handleCardPayment}
              >
                <Text style={styles.payButtonText}>PAY ${DUES_WITH_FEE.toFixed(2)}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={() => setStep('method')}>
                <Text style={styles.backButtonText}>← BACK TO METHODS</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {step === 'instructions' && selectedMethod && (
            <ScrollView style={styles.content}>
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsIcon}>
                  {MANUAL_INSTRUCTIONS[selectedMethod].icon}
                </Text>
                <Text style={styles.instructionsTitle}>
                  {MANUAL_INSTRUCTIONS[selectedMethod].title}
                </Text>
                
                <View style={styles.instructionsBox}>
                  {MANUAL_INSTRUCTIONS[selectedMethod].instructions.map((line, i) => (
                    <Text key={i} style={styles.instructionLine}>
                      {line}
                    </Text>
                  ))}
                </View>
                
                <Text style={styles.instructionsNote}>
                  {MANUAL_INSTRUCTIONS[selectedMethod].note}
                </Text>
                
                <Text style={styles.amountDue}>Amount Due: ${DUES_AMOUNT.toFixed(2)}</Text>
              </View>

              <TouchableOpacity 
                style={styles.markPaidButton}
                onPress={() => handleOfflinePayment(selectedMethod)}
              >
                <Text style={styles.markPaidText}>
                  I'VE SENT PAYMENT • MARK AS PAID
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={() => setStep('method')}>
                <Text style={styles.backButtonText}>← BACK TO METHODS</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {step === 'processing' && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.processingText}>Processing payment...</Text>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>PAYMENT COMPLETE</Text>
              <Text style={styles.successAmount}>${DUES_WITH_FEE.toFixed(2)}</Text>
              <Text style={styles.successMessage}>
                Thank you for your contribution to HCA Park!
              </Text>
              <TouchableOpacity style={styles.doneButton} onPress={resetAndClose}>
                <Text style={styles.doneButtonText}>DONE</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: Fonts.regular,
    fontSize: 28,
    letterSpacing: 2,
    color: Colors.primary,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  propertyCard: {
    padding: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  propertyAddress: {
    fontFamily: Fonts.regular,
    fontSize: 24,
    letterSpacing: 1,
    color: Colors.text,
  },
  propertyOwner: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  breakdownCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
    letterSpacing: 1,
    color: Colors.text,
  },
  totalValue: {
    fontFamily: Fonts.regular,
    fontSize: 28,
    letterSpacing: 1,
    color: Colors.primary,
  },
  sectionTitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginBottom: 12,
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
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  methodIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: Fonts.regular,
    fontSize: 20,
    letterSpacing: 1,
    color: '#fff',
  },
  methodTitleAlt: {
    color: Colors.text,
  },
  methodSubtext: {
    fontFamily: Fonts.regular,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: Fonts.regular,
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
    fontFamily: Fonts.regular,
    fontSize: 22,
    letterSpacing: 1,
    color: '#fff',
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 12,
  },
  backButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    letterSpacing: 1,
    color: Colors.textSecondary,
  },
  processingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  processingText: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  successContainer: {
    padding: 40,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    color: '#4CAF50',
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: Fonts.regular,
    fontSize: 28,
    letterSpacing: 2,
    color: '#4CAF50',
    marginBottom: 8,
  },
  successAmount: {
    fontFamily: Fonts.regular,
    fontSize: 48,
    letterSpacing: 1,
    color: Colors.text,
    marginBottom: 16,
  },
  successMessage: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  doneButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 20,
    letterSpacing: 1,
    color: '#fff',
  },
  // Card type preview
  cardPreview: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  cardPreviewText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1,
  },
  // Input error states
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  // Manual payment instructions
  instructionsCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  instructionsTitle: {
    fontFamily: Fonts.regular,
    fontSize: 28,
    letterSpacing: 2,
    color: Colors.primary,
    marginBottom: 16,
  },
  instructionsBox: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  instructionLine: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionsNote: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  amountDue: {
    fontFamily: Fonts.regular,
    fontSize: 22,
    letterSpacing: 1,
    color: Colors.text,
  },
  markPaidButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  markPaidText: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    letterSpacing: 1,
    color: '#fff',
  },
});