import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { loginWithPhoneAndPassword, getCurrentUser } from '../services/authService';
import { loadFarmWorkbook } from '../services/farmDataService';

// Configuration des 2 tablettes d'œufs (Gauche et Droite du logo fixe)
// Chaque alvéole reçoit un œuf qui tombe du haut et se pose dans la tablette
const TRAY_SLOTS_LEFT = [
  { id: 'L1', slotIndex: 0, color: '#FEF08A', delay: 0, duration: 1550 },
  { id: 'L2', slotIndex: 1, color: '#FBBF24', delay: 320, duration: 1620 },
  { id: 'L3', slotIndex: 2, color: '#FFFBEB', delay: 640, duration: 1500 },
  { id: 'L4', slotIndex: 3, color: '#FDE68A', delay: 960, duration: 1680 },
  { id: 'L5', slotIndex: 4, color: '#F59E0B', delay: 220, duration: 1600 },
  { id: 'L6', slotIndex: 5, color: '#FEF3C7', delay: 780, duration: 1540 },
];

const TRAY_SLOTS_RIGHT = [
  { id: 'R1', slotIndex: 0, color: '#FFFBEB', delay: 160, duration: 1580 },
  { id: 'R2', slotIndex: 1, color: '#FDE68A', delay: 480, duration: 1520 },
  { id: 'R3', slotIndex: 2, color: '#FBBF24', delay: 820, duration: 1640 },
  { id: 'R4', slotIndex: 3, color: '#FEF08A', delay: 110, duration: 1600 },
  { id: 'R5', slotIndex: 4, color: '#FFFBEB', delay: 540, duration: 1560 },
  { id: 'R6', slotIndex: 5, color: '#F59E0B', delay: 900, duration: 1660 },
];

const ALL_FALLING_EGGS = [...TRAY_SLOTS_LEFT, ...TRAY_SLOTS_RIGHT];

export default function LoginScreen({ navigation }) {
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Animations des 12 œufs qui tombent verticalement dans les alvéoles des tablettes
  // (Le logo central reste 100% fixe, sans flottement)
  const fallAnims = useRef(ALL_FALLING_EGGS.map(() => new Animated.Value(0))).current;

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

  useEffect(() => {
    const loops = fallAnims.map((anim, idx) => {
      const cfg = ALL_FALLING_EGGS[idx];
      return Animated.loop(
        Animated.sequence([
          Animated.delay(cfg.delay),
          // Chute de l'œuf depuis le haut jusqu'à l'alvéole de la tablette avec rebond doux à l'atterrissage
          Animated.timing(anim, {
            toValue: 1,
            duration: cfg.duration,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          // L'œuf reste posé sur la tablette quelques instants
          Animated.delay(950),
          // Fondu rapide avant le cycle suivant
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });

    loops.forEach((l) => l.start());

    return () => {
      loops.forEach((l) => l.stop());
    };
  }, [fallAnims]);

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

  const renderEggTray = (slots, animOffset) => {
    return (
      <View style={styles.trayContainer}>
        {/* Grille de 6 alvéoles (2 rangées x 3 colonnes) où les œufs tombent et se posent */}
        <View style={styles.trayGrid}>
          {slots.map((slot, i) => {
            const animVal = fallAnims[animOffset + i];
            // L'œuf part de -95px au-dessus et tombe exactement à 0px (dans l'alvéole de la tablette)
            const translateY = animVal.interpolate({
              inputRange: [0, 1],
              outputRange: [-95, 0],
            });
            const opacity = animVal.interpolate({
              inputRange: [0, 0.12, 1],
              outputRange: [0, 1, 1],
            });
            const scale = animVal.interpolate({
              inputRange: [0, 0.85, 0.94, 1],
              outputRange: [0.85, 1.04, 0.96, 1],
            });

            return (
              <View key={slot.id} style={styles.traySlotCell}>
                {/* Œuf qui tombe du haut et atterrit dans l'alvéole */}
                <Animated.View
                  style={[
                    styles.fallingEggWrap,
                    {
                      opacity,
                      transform: [{ translateY }, { scale }],
                    },
                  ]}
                >
                  <Ionicons name="egg" size={20} color={slot.color} />
                  <View style={styles.eggShineDot} />
                </Animated.View>

                {/* Alvéole moulée de la tablette d'œufs */}
                <View style={styles.trayAlveoleCup} />
              </View>
            );
          })}
        </View>
        {/* Socle de la tablette d'œufs */}
        <View style={styles.trayBaseBar}>
          <View style={styles.trayBaseRidge} />
          <View style={styles.trayBaseRidge} />
          <View style={styles.trayBaseRidge} />
        </View>
      </View>
    );
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
            {/* Scène d'en-tête : Tablette Gauche + Logo Officiel 100% Fixe + Tablette Droite */}
            <View style={styles.headerStageRow}>
              {/* Tablette d'œufs Gauche (6 œufs qui tombent dans les alvéoles) */}
              {renderEggTray(TRAY_SLOTS_LEFT, 0)}

              {/* Logo Officiel 100% FIXE (sans aucun flottement) */}
              <View style={styles.logoCenterWrap}>
                <View style={styles.logoStaticHalo} />
                <View style={styles.logoBadge}>
                  <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
                </View>
              </View>

              {/* Tablette d'œufs Droite (6 œufs qui tombent dans les alvéoles) */}
              {renderEggTray(TRAY_SLOTS_RIGHT, TRAY_SLOTS_LEFT.length)}
            </View>

            <Text style={styles.appTitle}>Bienvenue sur GestionP</Text>
          </View>

          <View style={styles.card}>
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
    paddingTop: Platform.OS === 'android' ? 42 : 30,
    paddingBottom: 46,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.large,
  },
  headerStageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 14,
    gap: 10,
  },
  trayContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 26,
  },
  trayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 90,
    justifyContent: 'center',
    rowGap: 8,
    columnGap: 4,
  },
  traySlotCell: {
    width: 26,
    height: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  fallingEggWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -4,
    zIndex: 2,
  },
  eggShineDot: {
    position: 'absolute',
    top: 4,
    left: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  trayAlveoleCup: {
    width: 24,
    height: 9,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: 'rgba(253, 230, 138, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.55)',
    zIndex: 3,
  },
  trayBaseBar: {
    width: 94,
    height: 8,
    backgroundColor: '#B45309',
    borderRadius: 4,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#F59E0B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  trayBaseRidge: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(254, 243, 199, 0.45)',
  },
  logoCenterWrap: {
    width: 118,
    height: 118,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoStaticHalo: {
    position: 'absolute',
    width: 114,
    height: 114,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.28)',
  },
  logoBadge: {
    width: 102,
    height: 102,
    borderRadius: 28,
    backgroundColor: '#FFFBEB',
    padding: 4,
    borderWidth: 3,
    borderColor: '#F59E0B',
    ...SHADOWS.medium,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.6,
    textAlign: 'center',
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
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.2,
    borderColor: '#E7E0D3',
    borderRadius: 14,
    height: 50,
    marginBottom: 8,
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
