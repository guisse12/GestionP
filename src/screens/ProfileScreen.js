import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout, { getRoleLabel, getRoleColor } from '../components/NavigationLayout';
import { COLORS, SHADOWS } from '../theme/colors';
import {
  getCachedUser,
  getCurrentUser,
  updateUserProfile,
  logoutUser,
} from '../services/authService';

export default function ProfileScreen({ navigation }) {
  const initU = getCachedUser();
  const [user, setUser] = useState(() => initU);
  const [nom, setNom] = useState(() => initU?.nom || '');
  const [telephone, setTelephone] = useState(() => initU?.telephone || '');
  const [poste, setPoste] = useState(() => initU?.poste || '');
  const [adresse, setAdresse] = useState(() => initU?.adresse || '');
  const [password, setPassword] = useState(() => initU?.password || '');
  const [showPassword, setShowPassword] = useState(false);

  const loadData = async () => {
    const u = await getCurrentUser();
    if (!u) {
      navigation.replace('Login');
      return;
    }
    setUser(u);
    setNom(u.nom || '');
    setTelephone(u.telephone || '');
    setPoste(u.poste || '');
    setAdresse(u.adresse || '');
    setPassword(u.password || '');
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!nom.trim() || !telephone.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Nom, téléphone et mot de passe sont obligatoires.');
      return;
    }

    const res = await updateUserProfile(user.id, {
      nom: nom.trim(),
      telephone: telephone.trim(),
      poste: poste.trim(),
      adresse: adresse.trim(),
      password: password.trim(),
    });

    if (!res.success) {
      Alert.alert('Erreur', res.error);
      return;
    }

    setUser(res.user);
    Alert.alert('Enregistré', 'Profil mis à jour.');
  };

  const handleLogout = async () => {
    await logoutUser();
    navigation.replace('Login');
  };

  return (
    <NavigationLayout
      user={user}
      activeTab="Profile"
      title="Mon Profil"
      navigation={navigation}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileBanner}>
          <Image source={require('../../assets/logo.png')} style={styles.avatarLogo} />
          <Text style={styles.profileName}>{user?.nom}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role) }]}>
            <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
            <Text style={styles.roleBadgeText}>{getRoleLabel(user?.role)}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Nom *</Text>
          <TextInput style={styles.input} value={nom} onChangeText={setNom} />

          <Text style={styles.label}>Téléphone *</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={telephone}
            onChangeText={setTelephone}
          />

          <Text style={styles.label}>Poste</Text>
          <TextInput style={styles.input} value={poste} onChangeText={setPoste} />

          <Text style={styles.label}>Adresse</Text>
          <TextInput style={styles.input} value={adresse} onChangeText={setAdresse} />

          <Text style={styles.label}>Mot de passe *</Text>
          <View style={styles.pwdWrap}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
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

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={styles.logoutBtnText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  profileBanner: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    ...SHADOWS.medium,
  },
  avatarLogo: {
    width: 68,
    height: 68,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 8,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    gap: 5,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E7E0D3',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pwdWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E7E0D3',
    borderRadius: 12,
    height: 46,
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  logoutBtn: {
    backgroundColor: COLORS.dangerBg,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: 14.5,
    fontWeight: '800',
  },
});
