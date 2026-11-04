import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout from '../components/NavigationLayout';
import { COLORS, SHADOWS, formatFCFA, formatNumber } from '../theme/colors';
import { getCachedUser, getCurrentUser } from '../services/authService';
import { getCachedWorkbook, loadFarmWorkbook, deleteClientOrder } from '../services/farmDataService';

export default function ClientOrdersScreen({ navigation }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());

  const loadData = async () => {
    const u = await getCurrentUser();
    setUser(u);
    const wb = await loadFarmWorkbook();
    setWorkbook(wb);
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const allOrders = workbook?.commandes || [];
  const myOrders = allOrders.filter(
    (c) =>
      c.clientId === user?.id ||
      String(c.clientNom || '').toLowerCase() === String(user?.nom || '').toLowerCase() ||
      c.clientTelephone === user?.telephone
  );

  const allFactures = workbook?.factures || [];
  const myFactures = allFactures.filter((f) =>
    String(f.client || '').toLowerCase().includes(String(user?.nom || '').toLowerCase())
  );

  return (
    <NavigationLayout
      user={user}
      activeTab="ClientOrders"
      title="Mes Commandes"
      navigation={navigation}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topActionRow}>
          <Text style={styles.sectionTitle}>Commandes ({myOrders.length})</Text>
          <TouchableOpacity
            style={styles.newOrderBtn}
            onPress={() => navigation.navigate('ClientHome')}
          >
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text style={styles.newOrderBtnText}>Commander</Text>
          </TouchableOpacity>
        </View>

        {myOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cart-outline" size={38} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>Aucune commande</Text>
          </View>
        ) : (
          myOrders.map((cmd) => (
            <View key={cmd.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderCode}>{cmd.numeroCommande}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{cmd.statut}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={async () => {
                      const next = await deleteClientOrder(cmd.id);
                      setWorkbook(next);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.orderInfo}>
                🥚 {cmd.quantiteTablettes} tab. × {formatFCFA(cmd.prixUnitaire)}
              </Text>
              <Text style={styles.orderTotal}>{formatFCFA(cmd.total)}</Text>
              <Text style={styles.orderMeta}>
                📅 {cmd.date} • 📍 {cmd.modeReception}
              </Text>
            </View>
          ))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 18, marginBottom: 10 }]}>
          Factures ({myFactures.length})
        </Text>

        {myFactures.map((f) => (
          <View key={f.id} style={styles.factureRow}>
            <View>
              <Text style={styles.factureTitle}>
                N° {f.numeroFacture} • {f.date}
              </Text>
              <Text style={styles.factureSub}>
                {formatNumber(f.quantite)} tab. × {formatFCFA(f.prixUnitaire)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.factureAmount}>{formatFCFA(f.total)}</Text>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '800',
                  color: f.statut === 'Payé' ? COLORS.secondary : COLORS.danger,
                }}
              >
                {f.statut}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  newOrderBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  newOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderCode: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  statusPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#B45309',
  },
  orderInfo: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  orderTotal: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.secondary,
    marginTop: 4,
  },
  orderMeta: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  factureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  factureTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  factureSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  factureAmount: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
});
