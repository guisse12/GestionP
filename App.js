import React, { useEffect, useRef, useCallback } from 'react';
import { AppState, View } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProductionScreen from './src/screens/ProductionScreen';
import StockageScreen from './src/screens/StockageScreen';
import DepensesScreen from './src/screens/DepensesScreen';
import SalairesScreen from './src/screens/SalairesScreen';
import BilanScreen from './src/screens/BilanScreen';
import CommandesScreen from './src/screens/CommandesScreen';
import RapportJournalierScreen from './src/screens/RapportJournalierScreen';
import ClientHomeScreen from './src/screens/ClientHomeScreen';
import ClientOrdersScreen from './src/screens/ClientOrdersScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import {
  getCachedUser,
  lockUserSession,
  isAutoLockSuppressed,
} from './src/services/authService';

const Stack = createNativeStackNavigator();

// Délai hors de l'application avant verrouillage automatique (1,5 seconde hors de l'app)
const BACKGROUND_LOCK_DELAY_MS = 1500;
// Délai d'inactivité prolongée écran allumé (3 minutes sans toucher l'écran)
const INACTIVITY_LOCK_DELAY_MS = 3 * 60 * 1000;

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const appStateRef = useRef(AppState.currentState);
  const backgroundedAtRef = useRef(null);
  const backgroundTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  const redirectToLogin = useCallback(() => {
    if (!navigationRef.isReady()) return;
    const currentRoute = navigationRef.getCurrentRoute()?.name;
    if (currentRoute && currentRoute !== 'Login') {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [navigationRef]);

  const triggerSessionLock = useCallback(
    async (reason = 'background') => {
      if (isAutoLockSuppressed()) return;
      const currentRoute = navigationRef.isReady()
        ? navigationRef.getCurrentRoute()?.name
        : null;
      const isPublicRoute = currentRoute === 'Login' || currentRoute === 'Register';
      if (!getCachedUser() && isPublicRoute) return;

      await lockUserSession(reason);
      redirectToLogin();
    },
    [navigationRef, redirectToLogin]
  );

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (getCachedUser()) {
        triggerSessionLock('inactivity');
      }
    }, INACTIVITY_LOCK_DELAY_MS);
  }, [triggerSessionLock]);

  useEffect(() => {
    resetInactivityTimer();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (!backgroundedAtRef.current) {
          backgroundedAtRef.current = Date.now();
        }
        if (backgroundTimerRef.current) {
          clearTimeout(backgroundTimerRef.current);
        }
        // Verrouiller la session si l'utilisateur quitte l'application un moment
        backgroundTimerRef.current = setTimeout(() => {
          if (appStateRef.current !== 'active' && !isAutoLockSuppressed()) {
            lockUserSession('background');
          }
        }, BACKGROUND_LOCK_DELAY_MS);
      } else if (
        (prevState === 'background' || prevState === 'inactive') &&
        nextAppState === 'active'
      ) {
        if (backgroundTimerRef.current) {
          clearTimeout(backgroundTimerRef.current);
          backgroundTimerRef.current = null;
        }
        const elapsed = backgroundedAtRef.current
          ? Date.now() - backgroundedAtRef.current
          : 0;
        backgroundedAtRef.current = null;

        if (!isAutoLockSuppressed() && (elapsed >= BACKGROUND_LOCK_DELAY_MS || !getCachedUser())) {
          triggerSessionLock('background');
        } else {
          resetInactivityTimer();
        }
      }
    });

    return () => {
      subscription.remove();
      if (backgroundTimerRef.current) clearTimeout(backgroundTimerRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer, triggerSessionLock]);

  const handleNavigationStateChange = useCallback(() => {
    resetInactivityTimer();
    if (!navigationRef.isReady()) return;
    const currentRoute = navigationRef.getCurrentRoute()?.name;
    const isPublicRoute = currentRoute === 'Login' || currentRoute === 'Register';
    if (!isPublicRoute && !getCachedUser()) {
      redirectToLogin();
    }
  }, [navigationRef, redirectToLogin, resetInactivityTimer]);

  return (
    <View
      style={{ flex: 1 }}
      onTouchStart={resetInactivityTimer}
    >
      <NavigationContainer
        ref={navigationRef}
        onStateChange={handleNavigationStateChange}
      >
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            animation: 'none',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />

          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Production" component={ProductionScreen} />
          <Stack.Screen name="Stockage" component={StockageScreen} />
          <Stack.Screen name="Depenses" component={DepensesScreen} />
          <Stack.Screen name="RapportJournalier" component={RapportJournalierScreen} />
          <Stack.Screen name="Bilan" component={BilanScreen} />
          <Stack.Screen name="Commandes" component={CommandesScreen} />

          <Stack.Screen name="Salaires" component={SalairesScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />

          <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
          <Stack.Screen name="ClientOrders" component={ClientOrdersScreen} />

          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
