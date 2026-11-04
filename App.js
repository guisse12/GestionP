import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
  );
}
