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
import { Feather } from '@expo/vector-icons';
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
              icon="calendar"
              title="Calendar of Events" 
              subtitle="See upcoming events & RSVP"
              onPress={() => router.push('/calendar' as never)}
            />
            
            <NavButton 
              icon="map-pin"
              title="Pay Your Dues" 
              subtitle="Annual membership dues"
              onPress={() => router.push('/pay-dues' as never)}
            />
            
            <NavButton 
              icon="award"
              title="Membership" 
              subtitle="Pricing & descriptions"
              onPress={() => router.push('/membership' as never)}
            />
            
            <NavButton 
              icon="mail"
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

          {/* Admin Link */}
          <TouchableOpacity 
            style={styles.adminLink}
            onPress={handleAdminPress}
          >
            <Feather name="settings" size={16} color="rgba(255,255,255,0.5)" />
            <Text style={styles.adminText}>Admin</Text>
          </TouchableOpacity>
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
  icon, 
  title, 
  subtitle, 
  onPress 
}: { 
  icon: keyof typeof Feather.glyphMap;
  title: string; 
  subtitle: string; 
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.navButton} onPress={onPress}>
      <View style={styles.navIconWrap}>
        <Feather name={icon} size={24} color={Colors.primary} />
      </View>
      <View style={styles.navText}>
        <Text style={styles.navTitle}>{title}</Text>
        <Text style={styles.navSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={24} color={Colors.primary} />
    </TouchableOpacity>
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
    paddingTop: 16,
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
  navIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    padding: 8,
  },
  adminText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 6,
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