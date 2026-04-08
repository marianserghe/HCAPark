import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import { Fonts } from '@/constants/styles';

const ADMIN_PASSWORD = 'hca2024';

export default function HomeScreen() {
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  function handleAdminPress() {
    setShowPasswordModal(true);
    setPassword('');
  }

  function handlePasswordSubmit() {
    if (password === ADMIN_PASSWORD) {
      setShowPasswordModal(false);
      setPassword('');
      router.push('/admin');
    } else {
      Alert.alert('Incorrect Password', 'Please try again.');
      setPassword('');
    }
  }

  return (
    <ImageBackground 
      source={require('@/assets/home-background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Hamburger Menu */}
        <TouchableOpacity style={styles.menuButton} onPress={handleAdminPress}>
          <View style={styles.menuBar} />
          <View style={styles.menuBar} />
          <View style={styles.menuBar} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Logo */}
          <Image 
            source={require('@/assets/logo.png')}
            style={styles.logo}
            tintColor="#fff"
          />
          
          {/* Welcome Text */}
          <Text style={styles.tagline}>
            Keeping Our Park Beautiful, Together
          </Text>

          {/* Nav Buttons */}
          <View style={styles.buttons}>
            <NavButton 
              emoji="📅" 
              title="Calendar of Events" 
              subtitle="See upcoming events & RSVP"
              onPress={() => router.push('/calendar' as never)}
            />
            
            <NavButton 
              emoji="💰" 
              title="Pay Your Dues" 
              subtitle="Annual membership dues"
              onPress={() => router.push('/pay-dues' as never)}
            />
            
            <NavButton 
              emoji="🎫" 
              title="Membership" 
              subtitle="Pricing & descriptions"
              onPress={() => router.push('/membership' as never)}
            />
            
            <NavButton 
              emoji="✉️" 
              title="Contact Us" 
              subtitle="Get in touch"
              onPress={() => router.push('/contact' as never)}
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>COMMUNITY PROGRESS</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>381</Text>
                <Text style={styles.statLabel}>Households</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>26</Text>
                <Text style={styles.statLabel}>Streets</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>07463</Text>
                <Text style={styles.statLabel}>Zip Code</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Admin Password Modal */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>ADMIN ACCESS</Text>
              <Text style={styles.modalLabel}>Enter password:</Text>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoFocus
                onSubmitEditing={handlePasswordSubmit}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: Colors.textSecondary }]}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Text style={styles.modalButtonText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: Colors.primary }]}
                  onPress={handlePasswordSubmit}
                >
                  <Text style={styles.modalButtonText}>ENTER</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

function NavButton({ 
  emoji, 
  title, 
  subtitle, 
  onPress 
}: { 
  emoji: string; 
  title: string; 
  subtitle: string; 
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.navButton} onPress={onPress}>
      <Text style={styles.navEmoji}>{emoji}</Text>
      <View style={styles.navText}>
        <Text style={styles.navTitle}>{title}</Text>
        <Text style={styles.navSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.navArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 136, 229, 0.85)',
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  menuBar: {
    width: 24,
    height: 2,
    backgroundColor: '#fff',
    marginBottom: 4,
    borderRadius: 1,
  },
  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 16,
  },
  tagline: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  buttons: {
    marginBottom: 32,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  navEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  navText: {
    flex: 1,
  },
  navTitle: {
    fontFamily: Fonts.headline,
    fontSize: 22,
    color: Colors.text,
    letterSpacing: 1,
  },
  navSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  navArrow: {
    fontSize: 28,
    color: Colors.primary,
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
  },
  statsTitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: Colors.primary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: Fonts.headline,
    fontSize: 32,
    color: Colors.text,
    letterSpacing: 1,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 320,
  },
  modalTitle: {
    fontFamily: Fonts.headline,
    fontSize: 28,
    letterSpacing: 2,
    textAlign: 'center',
    color: Colors.primary,
    marginBottom: 20,
  },
  modalLabel: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontFamily: Fonts.body,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: Fonts.headline,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1,
  },
});