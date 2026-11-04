import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { logoutUser, getCachedUser } from '../services/authService';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.8, 300);

export const getRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Administrateur';
    case 'gerant':
      return 'Gérant';
    case 'employe':
      return 'Employé';
    case 'client':
      return 'Client';
    default:
      return 'Utilisateur';
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return '#B45309';
    case 'gerant':
      return '#15803D';
    case 'employe':
      return '#0284C7';
    case 'client':
      return '#C84B31';
    default:
      return COLORS.primary;
  }
};

export default function NavigationLayout({
  children,
  user: propUser,
  activeTab,
  title,
  navigation,
  pendingUsersCount = 0,
  pendingOrdersCount = 0,
}) {
  const user = propUser || getCachedUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isAdmin = user?.role === 'admin';
  const isGerant = user?.role === 'gerant';
  const isClient = user?.role === 'client';

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = (callback) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerOpen(false);
      if (callback) callback();
    });
  };

  const navigateTo = (screenName) => {
    closeDrawer(() => {
      navigation.navigate(screenName);
    });
  };

  const handleLogout = () => {
    closeDrawer(async () => {
      await logoutUser();
      navigation.replace('Login');
    });
  };

  const bottomTabs = isClient
    ? [
        { key: 'ClientHome', label: 'Commander', icon: 'cart' },
        { key: 'ClientOrders', label: 'Commandes', icon: 'receipt' },
        { key: 'Profile', label: 'Profil', icon: 'person-circle' },
      ]
    : [
        { key: 'Dashboard', label: 'Accueil', icon: 'grid' },
        { key: 'Production', label: 'Production', icon: 'egg' },
        { key: 'Stockage', label: 'Stockage', icon: 'cube' },
        { key: 'RapportJournalier', label: 'Rapport', icon: 'document-text' },
        ...(isAdmin
          ? [{ key: 'Bilan', label: 'Bilan', icon: 'bar-chart' }]
          : isGerant
          ? [{ key: 'Commandes', label: 'Commandes', icon: 'bag-check', badge: pendingOrdersCount }]
          : [{ key: 'Depenses', label: 'Dépenses', icon: 'wallet' }]),
      ];

  const menuItems = isClient
    ? [
        { key: 'ClientHome', label: 'Commander', icon: 'cart-outline' },
        { key: 'ClientOrders', label: 'Mes Commandes', icon: 'receipt-outline' },
        { key: 'Profile', label: 'Mon Profil', icon: 'person-outline' },
      ]
    : [
        { key: 'Dashboard', label: 'Tableau de bord', icon: 'grid-outline' },
        { key: 'RapportJournalier', label: 'Rapport Journalier', icon: 'document-text-outline' },
        { key: 'Production', label: 'Production & Boxes', icon: 'egg-outline' },
        { key: 'Stockage', label: 'Stockage', icon: 'cube-outline' },
        { key: 'Depenses', label: 'Dépenses', icon: 'wallet-outline' },
        ...(isAdmin || isGerant
          ? [
              {
                key: 'Commandes',
                label: 'Commandes & Factures',
                icon: 'bag-check-outline',
                badge: pendingOrdersCount,
              },
              { key: 'Bilan', label: 'Bilan', icon: 'pie-chart-outline' },
            ]
          : []),
        ...(isAdmin
          ? [
              {
                key: 'Salaires',
                label: 'Salaires',
                icon: 'cash-outline',
                adminOnly: true,
              },
              {
                key: 'AdminUsers',
                label: 'Utilisateurs',
                icon: 'people-outline',
                badge: pendingUsersCount,
                adminOnly: true,
              },
              {
                key: 'ClientHome',
                label: 'Espace Client',
                icon: 'storefront-outline',
              },
            ]
          : []),
        { key: 'Profile', label: 'Mon Profil', icon: 'person-outline' },
      ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* NAVBAR FIXE EN HAUT */}
      <View style={styles.topNavbar}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer} activeOpacity={0.75}>
          <Ionicons name="menu" size={26} color="#FFFFFF" />
          {isAdmin && pendingUsersCount + pendingOrdersCount > 0 && (
            <View style={styles.menuDot} />
          )}
        </TouchableOpacity>

        <View style={styles.headerBrandContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.headerLogo} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title || 'GestionP'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileQuickBtn}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Ionicons name="person-circle-outline" size={28} color="#FEF3C7" />
        </TouchableOpacity>
      </View>

      {/* CONTENU PRINCIPAL */}
      <View style={styles.contentContainer}>{children}</View>

      {/* NAVBAR FIXE EN BAS */}
      <View style={styles.bottomNavbar}>
        {bottomTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.bottomTabItem}
              onPress={() => navigation.navigate(tab.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.bottomIconWrap, isActive && styles.bottomIconWrapActive]}>
                <Ionicons
                  name={isActive ? tab.icon : `${tab.icon}-outline`}
                  size={21}
                  color={isActive ? COLORS.primary : COLORS.textSecondary}
                />
                {tab.badge > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.bottomTabLabel, isActive && styles.bottomTabLabelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* MENU LATÉRAL ANIMÉ */}
      <Modal visible={drawerOpen} transparent animationType="none" onRequestClose={() => closeDrawer()}>
        <View style={styles.drawerOverlay}>
          <Animated.View style={[styles.drawerBackdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => closeDrawer()} />
          </Animated.View>

          <Animated.View
            style={[
              styles.drawerPanel,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderTop}>
                <Image source={require('../../assets/logo.png')} style={styles.drawerLogo} />
                <TouchableOpacity onPress={() => closeDrawer()} style={styles.closeDrawerBtn}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.drawerUserName}>{user?.nom || 'GestionP'}</Text>
              <View style={[styles.rolePill, { backgroundColor: getRoleColor(user?.role) }]}>
                <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
                <Text style={styles.rolePillText}>{getRoleLabel(user?.role)}</Text>
              </View>
            </View>

            <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
              {menuItems.map((item) => {
                const isSelected = activeTab === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.drawerItem, isSelected && styles.drawerItemActive]}
                    onPress={() => navigateTo(item.key)}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.drawerItemIcon,
                        isSelected && { backgroundColor: COLORS.primary },
                        item.adminOnly && !isSelected && { backgroundColor: '#FEF3C7' },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={isSelected ? '#FFFFFF' : item.adminOnly ? COLORS.primary : COLORS.textSecondary}
                      />
                    </View>
                    <Text style={[styles.drawerItemLabel, isSelected && styles.drawerItemLabelActive]}>
                      {item.label}
                    </Text>
                    {item.adminOnly && (
                      <View style={styles.adminLockBadge}>
                        <Ionicons name="lock-closed" size={10} color="#B45309" />
                      </View>
                    )}
                    {item.badge > 0 && (
                      <View style={styles.drawerBadge}>
                        <Text style={styles.drawerBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              <View style={styles.drawerDivider} />

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                <Text style={styles.logoutBtnText}>Déconnexion</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  topNavbar: {
    height: 60,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
    ...SHADOWS.medium,
    zIndex: 20,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerBrandContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
  },
  profileQuickBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomNavbar: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    ...SHADOWS.medium,
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  bottomIconWrap: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomIconWrapActive: {
    backgroundColor: COLORS.primarySoft,
  },
  bottomTabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bottomTabLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  tabBadge: {
    position: 'absolute',
    top: -3,
    right: 2,
    backgroundColor: COLORS.danger,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 25, 23, 0.55)',
  },
  drawerPanel: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    ...SHADOWS.large,
  },
  drawerHeader: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: Platform.OS === 'android' ? 28 : 44,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomRightRadius: 24,
  },
  drawerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  drawerLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  closeDrawerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerUserName: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    gap: 5,
  },
  rolePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  drawerScroll: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 4,
  },
  drawerItemActive: {
    backgroundColor: COLORS.primarySoft,
  },
  drawerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  drawerItemLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  adminLockBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 4,
    marginLeft: 6,
  },
  drawerBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  drawerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.dangerBg,
    marginBottom: 28,
    gap: 10,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '800',
  },
});
