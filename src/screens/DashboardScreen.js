import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout from '../components/NavigationLayout';
import { COLORS, SHADOWS, formatFCFA, formatNumber } from '../theme/colors';
import { getCachedUser, getCachedUsers, getCurrentUser, getAllUsers } from '../services/authService';
import {
  getCachedSummary,
  loadFarmWorkbook,
  computeFarmSummary,
} from '../services/farmDataService';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [summary, setSummary] = useState(() => getCachedSummary());
  const [pendingUsersCount, setPendingUsersCount] = useState(
    () => (getCachedUsers() || []).filter((u) => u.statut === 'en_attente').length
  );
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      navigation.replace('Login');
      return;
    }
    setUser(currentUser);

    const wb = await loadFarmWorkbook();
    setSummary(computeFarmSummary(wb));

    if (currentUser.role === 'admin') {
      const users = await getAllUsers();
      setPendingUsersCount(users.filter((u) => u.statut === 'en_attente').length);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const isAdmin = user?.role === 'admin';
  const isGerant = user?.role === 'gerant';
  const s = summary || {};

  return (
    <NavigationLayout
      user={user}
      activeTab="Dashboard"
      title="GestionP"
      navigation={navigation}
      pendingUsersCount={pendingUsersCount}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroTitle}>
              {isAdmin || isGerant ? 'Reste Net' : 'Effectif Vivant'}
            </Text>
            <TouchableOpacity
              style={styles.reportQuickPill}
              onPress={() => navigation.navigate('RapportJournalier')}
            >
              <Ionicons name="document-text" size={15} color="#78350F" />
              <Text style={styles.reportQuickPillText}>Rapport Journalier</Text>
            </TouchableOpacity>
          </View>

          {isAdmin || isGerant ? (
            <>
              <Text style={styles.heroBigAmount}>{formatFCFA(s.resteApresDepenses)}</Text>
              <View style={styles.heroFinanceRow}>
                <View style={styles.heroFinanceBox}>
                  <Text style={styles.heroFinanceLabel}>Ventes Payées</Text>
                  <Text style={[styles.heroFinanceVal, { color: '#86EFAC' }]}>
                    {formatFCFA(s.totalVentesPayees)}
                  </Text>
                </View>
                <View style={styles.heroFinanceDivider} />
                <View style={styles.heroFinanceBox}>
                  <Text style={styles.heroFinanceLabel}>Dépenses</Text>
                  <Text style={[styles.heroFinanceVal, { color: '#FCA5A5' }]}>
                    {formatFCFA(s.totalDepenses)}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.heroBigAmount}>{formatNumber(s.vivantsTotal)} Poulets</Text>
          )}
        </View>

        {isAdmin && pendingUsersCount > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => navigation.navigate('AdminUsers')}
            activeOpacity={0.85}
          >
            <View style={styles.alertIconWrap}>
              <Ionicons name="person-add" size={20} color="#B45309" />
            </View>
            <Text style={styles.alertTitle}>
              {pendingUsersCount} demande(s) de compte en attente
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#B45309" />
          </TouchableOpacity>
        )}

        {(isAdmin || isGerant) && s.commandesEnAttente > 0 && (
          <TouchableOpacity
            style={[styles.alertBanner, { backgroundColor: '#DCFCE7', borderColor: '#22C55E' }]}
            onPress={() => navigation.navigate('Commandes')}
            activeOpacity={0.85}
          >
            <View style={[styles.alertIconWrap, { backgroundColor: '#BBF7D0' }]}>
              <Ionicons name="cart" size={20} color="#15803D" />
            </View>
            <Text style={[styles.alertTitle, { color: '#14532D' }]}>
              {s.commandesEnAttente} commande(s) en attente
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#15803D" />
          </TouchableOpacity>
        )}

        <View style={styles.kpiGrid}>
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigation.navigate('Production')}
            activeOpacity={0.8}
          >
            <View style={[styles.kpiIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="egg" size={22} color="#D97706" />
            </View>
            <Text style={styles.kpiValue}>{formatNumber(s.totalProductionTablettes)}</Text>
            <Text style={styles.kpiLabel}>Tablettes Produites</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigation.navigate('Production')}
            activeOpacity={0.8}
          >
            <View style={[styles.kpiIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="pulse" size={22} color="#15803D" />
            </View>
            <Text style={styles.kpiValue}>{formatNumber(s.vivantsTotal)}</Text>
            <Text style={styles.kpiLabel}>Poulets Vivants</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigation.navigate('Stockage')}
            activeOpacity={0.8}
          >
            <View style={[styles.kpiIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="cube" size={22} color="#0284C7" />
            </View>
            <Text style={styles.kpiValue}>{formatNumber(s.stockSacsAlimentRestant)} sacs</Text>
            <Text style={styles.kpiLabel}>Stock Aliment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigation.navigate(isAdmin || isGerant ? 'Commandes' : 'Stockage')}
            activeOpacity={0.8}
          >
            <View style={[styles.kpiIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="receipt" size={22} color="#C84B31" />
            </View>
            <Text style={styles.kpiValue}>{formatNumber(s.totalQuantiteFacturee)}</Text>
            <Text style={styles.kpiLabel}>Tablettes Vendues</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Menu</Text>

        <TouchableOpacity
          style={[styles.moduleRowCard, { borderColor: COLORS.secondary, backgroundColor: '#F0FDF4' }]}
          onPress={() => navigation.navigate('RapportJournalier')}
          activeOpacity={0.8}
        >
          <View style={[styles.moduleIconBox, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="document-text" size={24} color="#15803D" />
          </View>
          <Text style={[styles.moduleTitle, { color: '#14532D' }]}>Rapport Journalier</Text>
          <Ionicons name="chevron-forward" size={20} color="#15803D" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleRowCard}
          onPress={() => navigation.navigate('Production')}
          activeOpacity={0.8}
        >
          <View style={[styles.moduleIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="egg" size={24} color="#B45309" />
          </View>
          <Text style={styles.moduleTitle}>Production & Boxes</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleRowCard}
          onPress={() => navigation.navigate('Stockage')}
          activeOpacity={0.8}
        >
          <View style={[styles.moduleIconBox, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="cube" size={24} color="#15803D" />
          </View>
          <Text style={styles.moduleTitle}>Stockage (Aliment & Œufs)</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleRowCard}
          onPress={() => navigation.navigate('Depenses')}
          activeOpacity={0.8}
        >
          <View style={[styles.moduleIconBox, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="wallet" size={24} color="#0284C7" />
          </View>
          <Text style={styles.moduleTitle}>Dépenses & Constructions</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {(isAdmin || isGerant) && (
          <TouchableOpacity
            style={styles.moduleRowCard}
            onPress={() => navigation.navigate('Commandes')}
            activeOpacity={0.8}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="bag-check" size={24} color="#C84B31" />
            </View>
            <Text style={styles.moduleTitle}>Commandes & Factures</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}

        {(isAdmin || isGerant) && (
          <TouchableOpacity
            style={[styles.moduleRowCard, { borderColor: '#EAB308', backgroundColor: '#FFFBEB' }]}
            onPress={() => navigation.navigate('Bilan')}
            activeOpacity={0.8}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: '#FEF08A' }]}>
              <Ionicons name="pie-chart" size={24} color="#854D0E" />
            </View>
            <Text style={[styles.moduleTitle, { color: '#713F12' }]}>Bilan</Text>
            <Ionicons name="chevron-forward" size={20} color="#854D0E" />
          </TouchableOpacity>
        )}

        {isAdmin && (
          <TouchableOpacity
            style={[styles.moduleRowCard, { borderColor: '#B45309', borderWidth: 1.5 }]}
            onPress={() => navigation.navigate('Salaires')}
            activeOpacity={0.8}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: '#B45309' }]}>
              <Ionicons name="cash" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.moduleTitle}>Salaires des Employés</Text>
            <View style={styles.adminTag}>
              <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
              <Text style={styles.adminTagText}>ADMIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {isAdmin && (
          <TouchableOpacity
            style={styles.moduleRowCard}
            onPress={() => navigation.navigate('AdminUsers')}
            activeOpacity={0.8}
          >
            <View style={[styles.moduleIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="people" size={24} color="#7E22CE" />
            </View>
            <Text style={styles.moduleTitle}>Utilisateurs</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    ...SHADOWS.large,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    color: '#FDE68A',
    fontSize: 14,
    fontWeight: '800',
  },
  reportQuickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  reportQuickPillText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#78350F',
  },
  heroBigAmount: {
    color: '#FEF08A',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 6,
    marginBottom: 12,
  },
  heroFinanceRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  heroFinanceBox: {
    flex: 1,
  },
  heroFinanceDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  heroFinanceLabel: {
    color: '#E7E5E4',
    fontSize: 11,
    fontWeight: '600',
  },
  heroFinanceVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.2,
    borderColor: '#F59E0B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  alertIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#78350F',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  kpiIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moduleRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
    ...SHADOWS.small,
  },
  moduleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  adminTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B45309',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  adminTagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
});
