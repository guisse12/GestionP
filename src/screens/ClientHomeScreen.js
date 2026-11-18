import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout from '../components/NavigationLayout';
import { COLORS, SHADOWS, formatFCFA, formatNumber } from '../theme/colors';
import { getCachedUser, getCurrentUser, suppressAutoLock } from '../services/authService';
import {
  getCachedSummary,
  loadFarmWorkbook,
  computeFarmSummary,
  createClientOrder,
} from '../services/farmDataService';

const QUICK_QUANTITIES = [5, 10, 25, 50, 100, 200, 500, 1000];

export default function ClientHomeScreen({ navigation }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [summary, setSummary] = useState(() => getCachedSummary());
  const [quantite, setQuantite] = useState(10);
  const [modeReception, setModeReception] = useState('Retrait au poulailler');
  const [adresse, setAdresse] = useState('');
  const [note, setNote] = useState('');
  const scrollRef = useRef(null);

  const scrollToOffset = (yOffset) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: yOffset, animated: true });
    }, 120);
  };

  const loadData = async () => {
    const u = await getCurrentUser();
    setUser(u);
    if (u?.adresse) setAdresse(u.adresse);
    const wb = await loadFarmWorkbook();
    setSummary(computeFarmSummary(wb));
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const s = summary || {};
  const prixUnitaire = s.prixTabletteDefaut || 2200;
  const qteNum = Math.max(1, Number(quantite) || 1);
  const montantTotal = qteNum * prixUnitaire;

  const adjustQty = (delta) => {
    setQuantite((prev) => Math.max(1, (Number(prev) || 0) + delta));
  };

  const handleCallManager = async () => {
    const url = 'tel:+221777527561';
    try {
      suppressAutoLock(60000);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Appel Gérant', 'Numéro du Gérant (COLY) : +221 77 752 75 61');
      }
    } catch (e) {
      Alert.alert('Appel Gérant', 'Numéro du Gérant (COLY) : +221 77 752 75 61');
    }
  };

  const handleOrderSubmit = async () => {
    await createClientOrder({
      clientId: user?.id || 'guest',
      clientNom: user?.nom || 'Client',
      clientTelephone: user?.telephone || '',
      adresseLivraison:
        modeReception === 'Retrait au poulailler'
          ? 'Retrait au Poulailler (Thiès)'
          : adresse || user?.adresse || 'Thiès',
      modeReception,
      quantiteTablettes: qteNum,
      prixUnitaire,
      note,
    });

    Alert.alert(
      'Commande envoyée !',
      `${qteNum} tablettes (${formatFCFA(montantTotal)})`,
      [
        {
          text: 'Mes commandes',
          onPress: () => navigation.navigate('ClientOrders'),
        },
        { text: 'OK' },
      ]
    );
    setNote('');
  };

  return (
    <NavigationLayout
      user={user}
      activeTab="ClientHome"
      title="Commander"
      navigation={navigation}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.productBanner}>
          <Image source={require('../../assets/logo.png')} style={styles.productImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.productTitle}>Tablette d’œufs</Text>
            <Text style={styles.productPrice}>{formatFCFA(prixUnitaire)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.callManagerCard}
          onPress={handleCallManager}
          activeOpacity={0.85}
        >
          <View style={styles.callIconBox}>
            <Ionicons name="call" size={19} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.callManagerTitle}>Besoin d'un renseignement ?</Text>
            <Text style={styles.callManagerSub}>Appeler le Gérant (COLY : 77 752 75 61)</Text>
          </View>
          <View style={styles.callActionPill}>
            <Text style={styles.callActionText}>Appeler</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Quantité</Text>

          <View style={styles.quickGrid}>
            {QUICK_QUANTITIES.map((q) => {
              const active = Number(quantite) === q;
              return (
                <TouchableOpacity
                  key={q}
                  style={[styles.qtyChip, active && styles.qtyChipActive]}
                  onPress={() => setQuantite(q)}
                >
                  <Text style={[styles.qtyChipText, active && { color: '#FFFFFF' }]}>
                    {q} tab.
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.stepperRow}>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustQty(-5)}>
              <Ionicons name="remove" size={24} color={COLORS.primaryDark} />
            </TouchableOpacity>

            <View style={styles.stepperInputWrap}>
              <TextInput
                style={styles.stepperInput}
                keyboardType="numeric"
                value={String(quantite)}
                onChangeText={(v) => setQuantite(v.replace(/[^0-9]/g, ''))}
                onFocus={() => scrollToOffset(120)}
              />
              <Text style={styles.stepperUnit}>tablettes</Text>
            </View>

            <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustQty(5)}>
              <Ionicons name="add" size={24} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Réception</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeCard,
                modeReception === 'Retrait au poulailler' && styles.modeCardActive,
              ]}
              onPress={() => setModeReception('Retrait au poulailler')}
            >
              <Ionicons
                name="storefront"
                size={22}
                color={modeReception === 'Retrait au poulailler' ? '#FFFFFF' : COLORS.primary}
              />
              <Text
                style={[
                  styles.modeTitle,
                  modeReception === 'Retrait au poulailler' && { color: '#FFFFFF' },
                ]}
              >
                Sur place
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeCard,
                modeReception === 'Livraison' && styles.modeCardActive,
              ]}
              onPress={() => setModeReception('Livraison')}
            >
              <Ionicons
                name="bicycle"
                size={22}
                color={modeReception === 'Livraison' ? '#FFFFFF' : COLORS.secondary}
              />
              <Text
                style={[
                  styles.modeTitle,
                  modeReception === 'Livraison' && { color: '#FFFFFF' },
                ]}
              >
                Livraison
              </Text>
            </TouchableOpacity>
          </View>

          {modeReception === 'Livraison' && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.inputLabel}>Adresse (max 25 caractères)</Text>
              <TextInput
                style={styles.input}
                placeholder="Lieu de livraison"
                maxLength={25}
                value={adresse}
                onChangeText={(txt) => setAdresse(txt.slice(0, 25))}
                onFocus={() => scrollToOffset(280)}
              />
            </View>
          )}

          <Text style={[styles.inputLabel, { marginTop: 10 }]}>Note (Optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Message ou heure"
            value={note}
            onChangeText={setNote}
            onFocus={() => scrollToOffset(360)}
          />
        </View>

        <View style={styles.checkoutCard}>
          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutLabel}>TOTAL ({qteNum} tab.)</Text>
            <Text style={styles.checkoutTotal}>{formatFCFA(montantTotal)}</Text>
          </View>

          <TouchableOpacity
            style={styles.orderButton}
            onPress={handleOrderSubmit}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.orderButtonText}>Commander</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    gap: 14,
    ...SHADOWS.medium,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  callManagerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#86EFAC',
    gap: 12,
    ...SHADOWS.small,
  },
  callIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callManagerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  callManagerSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 2,
  },
  callActionPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  callActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  productPrice: {
    color: '#FEF08A',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  qtyChip: {
    width: '22.8%',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.4,
    borderColor: '#E7E0D3',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  qtyChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  qtyChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 8,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  stepperInputWrap: {
    alignItems: 'center',
    flex: 1,
  },
  stepperInput: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textAlign: 'center',
    paddingVertical: 0,
  },
  stepperUnit: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#E7E0D3',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E7E0D3',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  checkoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    ...SHADOWS.medium,
  },
  checkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkoutLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  checkoutTotal: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  orderButton: {
    backgroundColor: COLORS.secondary,
    height: 54,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...SHADOWS.small,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '900',
  },
});
