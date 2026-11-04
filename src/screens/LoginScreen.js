import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { loginWithPhoneAndPassword, getCurrentUser } from '../services/authService';
import { loadFarmWorkbook } from '../services/farmDataService';

export default function LoginScreen({ navigation }) {
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Précharger les données du classeur en mémoire dès l'ouverture
    loadFarmWorkbook();

    (async () => {
      const user = await getCurrentUser();
      if (user && user.statut === 'valide') {
        redirectByRole(user);
      } else {
        setCheckingSession(false);
      }
    })();
  }, []);

  const redirectByRole = (user) => {
    if (user.role === 'client') {
      navigation.replace('ClientHome');
    } else {
      navigation.replace('Dashboard');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await loginWithPhoneAndPassword(telephone, password);
      if (res.success) {
        redirectByRole(res.user);
      } else {
        Alert.alert(
          res.pendingValidation ? 'Compte en attente' : 'Connexion impossible',
          res.error
        );
      }
    } catch (e) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.splashLoader}>
        <Image source={require('../../assets/logo.png')} style={styles.splashLogo} />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 14 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroBanner}>
            <View style={styles.logoBadge}>
              <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.appTitle}>GestionP</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Connexion</Text>

            <Text style={styles.inputLabel}>Numéro de téléphone</Text>
            <View style={styles.inputContainer}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>🇸🇳 +221</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Votre numéro"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={telephone}
                onChangeText={setTelephone}
              />
              {telephone.length > 0 && (
                <TouchableOpacity onPress={() => setTelephone('')} style={{ padding: 6 }}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.primary}
                style={{ marginLeft: 12, marginRight: 8 }}
              />
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
                  size={21}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Pas encore de compte ?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Créer un compte</Text>
              </TouchableOpacity>
            </View>
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
  splashLoader: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  heroBanner: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: Platform.OS === 'android' ? 48 : 34,
    paddingBottom: 46,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    ...SHADOWS.large,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    padding: 4,
    borderWidth: 3,
    borderColor: '#F59E0B',
    ...SHADOWS.medium,
    marginBottom: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: -24,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.2,
    borderColor: '#E7E0D3',
    borderRadius: 14,
    height: 50,
    marginBottom: 6,
  },
  prefixBox: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E7E0D3',
    backgroundColor: '#F5EFE6',
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
  },
  prefixText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 8,
    ...SHADOWS.small,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 6,
  },
  registerPrompt: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
