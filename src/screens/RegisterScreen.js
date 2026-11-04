import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { registerWithPhoneAndPassword } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [adresse, setAdresse] = useState('');
  const [role, setRole] = useState('client');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await registerWithPhoneAndPassword({
        nom,
        telephone,
        password,
        role,
        adresse,
      });

      if (!res.success) {
        Alert.alert('Inscription impossible', res.error);
        return;
      }

      if (res.requiresValidation) {
        Alert.alert(
          'Demande envoyée',
          "Votre compte sera activé après validation par l'Administrateur.",
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      } else {
        navigation.replace('ClientHome');
      }
    } catch (e) {
      Alert.alert('Erreur', "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <Text style={styles.headerTitle}>Créer un Compte</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Profil</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[styles.roleOption, role === 'client' && styles.roleOptionActive]}
                onPress={() => setRole('client')}
              >
                <Ionicons
                  name="cart"
                  size={22}
                  color={role === 'client' ? '#FFFFFF' : COLORS.primary}
                />
                <Text style={[styles.roleOptionTitle, role === 'client' && { color: '#FFFFFF' }]}>
                  Client
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleOption, role === 'employe' && styles.roleOptionActive]}
                onPress={() => setRole('employe')}
              >
                <Ionicons
                  name="egg"
                  size={22}
                  color={role === 'employe' ? '#FFFFFF' : COLORS.secondary}
                />
                <Text style={[styles.roleOptionTitle, role === 'employe' && { color: '#FFFFFF' }]}>
                  Employé
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleOption, role === 'gerant' && styles.roleOptionActive]}
                onPress={() => setRole('gerant')}
              >
                <Ionicons
                  name="briefcase"
                  size={22}
                  color={role === 'gerant' ? '#FFFFFF' : '#0284C7'}
                />
                <Text style={[styles.roleOptionTitle, role === 'gerant' && { color: '#FFFFFF' }]}>
                  Gérant
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nom complet *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                placeholderTextColor={COLORS.textMuted}
                value={nom}
                onChangeText={setNom}
              />
            </View>

            <Text style={styles.inputLabel}>Téléphone *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="77 123 45 67"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={telephone}
                onChangeText={setTelephone}
              />
            </View>

            <Text style={styles.inputLabel}>Adresse</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ville / Quartier"
                placeholderTextColor={COLORS.textMuted}
                value={adresse}
                onChangeText={setAdresse}
              />
            </View>

            <Text style={styles.inputLabel}>Mot de passe *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ paddingHorizontal: 12 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>S’inscrire</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginBackLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginBackText}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 34,
  },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: Platform.OS === 'android' ? 34 : 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'android' ? 34 : 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.medium,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#E7E0D3',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  roleOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.2,
    borderColor: '#E7E0D3',
    borderRadius: 14,
    height: 48,
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingRight: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.secondary,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 8,
    ...SHADOWS.small,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
  },
  loginBackLink: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  loginBackText: {
    color: COLORS.primary,
    fontSize: 13.5,
    fontWeight: '800',
  },
});
