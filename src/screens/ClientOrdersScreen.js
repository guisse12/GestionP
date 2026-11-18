import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout from '../components/NavigationLayout';
import { COLORS, SHADOWS, formatFCFA } from '../theme/colors';
import { getCachedUser, getCurrentUser, suppressAutoLock } from '../services/authService';
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

  const cleanPhone = (p) => String(p || '').replace(/[^0-9]/g, '');
  const userTel = cleanPhone(user?.telephone);
  const userId = user?.id;

  // Filtrage strict : Le client ne voit que ses PROPRES commandes
  const allOrders = workbook?.commandes || [];
  const myOrders = allOrders.filter((c) => {
    if (userId && c.clientId && c.clientId === userId) return true;
    if (userTel && c.clientTelephone && cleanPhone(c.clientTelephone) === userTel) return true;
    return false;
  });

  const getOrderStatusConfig = (statut) => {
    const s = String(statut || '').trim().toLowerCase();
    if (s.includes('attente')) {
      return {
        label: 'En attente',
        bg: '#FEF3C7',
        color: '#D97706',
        icon: 'time-outline',
      };
    }
    if (s.includes('annul')) {
      return {
        label: 'Annulée',
        bg: '#FEE2E2',
        color: '#DC2626',
        icon: 'close-circle-outline',
      };
    }
    return {
      label: 'Validée',
      bg: '#DCFCE7',
      color: '#15803D',
      icon: 'checkmark-circle-outline',
    };
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

  return (
    <NavigationLayout
      user={user}
      activeTab="ClientOrders"
      title="Mes Commandes"
      navigation={navigation}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Bannière d'appel direct du gérant */}
        <TouchableOpacity
          style={styles.callManagerBanner}
          onPress={handleCallManager}
          activeOpacity={0.85}
        >
          <View style={styles.callIconBox}>
            <Ionicons name="call" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.callManagerTitle}>Besoin d'aide pour votre commande ?</Text>
            <Text style={styles.callManagerSub}>Appeler le Gérant (COLY : 77 752 75 61)</Text>
          </View>
          <View style={styles.callActionPill}>
            <Text style={styles.callActionText}>Appeler</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.topActionRow}>
          <Text style={styles.sectionTitle}>Mes Commandes ({myOrders.length})</Text>
          <TouchableOpacity
            style={styles.newOrderBtn}
            onPress={() => navigation.navigate('ClientHome')}
          >
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text style={styles.newOrderBtnText}>+ Nouvelle commande</Text>
          </TouchableOpacity>
        </View>

        {myOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cart-outline" size={44} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>Aucune commande en cours</Text>
            <Text style={styles.emptySubtitle}>
              Vous n'avez pas encore passé de commande. Vos commandes validées ou en attente apparaîtront ici.
            </Text>
            <TouchableOpacity
              style={[styles.newOrderBtn, { marginTop: 14 }]}
              onPress={() => navigation.navigate('ClientHome')}
            >
              <Ionicons name="cart" size={18} color="#FFFFFF" />
              <Text style={styles.newOrderBtnText}>Commander maintenant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          myOrders.map((cmd) => {
            const statusCfg = getOrderStatusConfig(cmd.statut);
            const isPending = String(cmd.statut || '').toLowerCase().includes('attente');

            return (
              <View key={cmd.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderCode}>{cmd.numeroCommande}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
                      <Ionicons
                        name={statusCfg.icon}
                        size={14}
                        color={statusCfg.color}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.statusText, { color: statusCfg.color }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                    {isPending && (
                      <TouchableOpacity
                        onPress={async () => {
                          const next = await deleteClientOrder(cmd.id);
                          setWorkbook(next);
                        }}
                      >
                        <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <Text style={styles.orderInfo}>
                  🥚 {cmd.quantiteTablettes} tab. × {formatFCFA(cmd.prixUnitaire)}
                </Text>
                <Text style={styles.orderTotal}>{formatFCFA(cmd.total)}</Text>
                <Text style={styles.orderMeta}>
                  📅 {cmd.date} • 📍 {cmd.modeReception}
                </Text>
                {cmd.adresseLivraison && cmd.modeReception === 'Livraison' && (
                  <Text style={styles.orderMeta}>🏠 {cmd.adresseLivraison}</Text>
                )}
                {cmd.note ? (
                  <Text style={styles.orderNote}>💬 Note : {cmd.note}</Text>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  callManagerBanner: {
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
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '800',
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
  orderNote: {
    fontSize: 12,
    color: '#4B5563',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
