import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout from '../components/NavigationLayout';
import { COLORS, SHADOWS, formatFCFA } from '../theme/colors';
import { getCachedUser, getCurrentUser } from '../services/authService';
import {
  getCachedWorkbook,
  getCachedSummary,
  loadFarmWorkbook,
  computeFarmSummary,
  addExpenseItem,
  deleteExpenseItem,
} from '../services/farmDataService';

export default function DepensesScreen({ navigation }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());
  const [summary, setSummary] = useState(() => getCachedSummary());
  const [expenseType, setExpenseType] = useState('autres');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [designation, setDesignation] = useState('');
  const [montant, setMontant] = useState('');

  const loadData = async () => {
    const u = await getCurrentUser();
    setUser(u);
    const wb = await loadFarmWorkbook();
    setWorkbook(wb);
    setSummary(computeFarmSummary(wb));
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const s = summary || {};

  const handleAddExpense = async () => {
    const cleanDesig = designation.trim();
    const cleanMontant = Number(montant) || 0;
    if (!cleanDesig || cleanMontant <= 0) {
      Alert.alert('Champs requis', 'Veuillez renseigner la désignation et le montant.');
      return;
    }

    const updated = await addExpenseItem({
      type: expenseType,
      date: date.trim(),
      designation: cleanDesig,
      montant: cleanMontant,
      auteur: user?.nom || user?.role || '',
    });

    if (updated?.alreadyExists) {
      Alert.alert(
        'Déjà enregistré',
        `La dépense "${cleanDesig}" (${formatFCFA(cleanMontant)}) du ${date.trim()} a déjà été ajoutée. Il n'est plus possible de l'ajouter une seconde fois.`
      );
      return;
    }

    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setDesignation('');
    setMontant('');

    Alert.alert('Enregistré', `${cleanDesig} : ${formatFCFA(cleanMontant)}`);
  };

  const handleDelete = (id, label) => {
    Alert.alert('Supprimer ?', label, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteExpenseItem(expenseType, id);
          setWorkbook(updated);
          setSummary(computeFarmSummary(updated));
        },
      },
    ]);
  };

  const itemsList =
    expenseType === 'autres'
      ? workbook?.autresDepenses || []
      : workbook?.constructions || [];

  return (
    <NavigationLayout
      user={user}
      activeTab="Depenses"
      title="Dépenses"
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.tabBtn, expenseType === 'autres' && styles.tabBtnActive]}
            onPress={() => setExpenseType('autres')}
          >
            <Ionicons
              name="medkit"
              size={17}
              color={expenseType === 'autres' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, expenseType === 'autres' && { color: '#FFFFFF' }]}>
              Autres Achats ({workbook?.autresDepenses?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, expenseType === 'constructions' && styles.tabBtnActive]}
            onPress={() => setExpenseType('constructions')}
          >
            <Ionicons
              name="construct"
              size={17}
              color={expenseType === 'constructions' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, expenseType === 'constructions' && { color: '#FFFFFF' }]}>
              Constructions ({workbook?.constructions?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalsBanner}>
          <View style={styles.totalCol}>
            <Text style={styles.totalLabel}>AUTRES ACHATS</Text>
            <Text style={styles.totalVal}>{formatFCFA(s.totalAutresDepenses)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalCol}>
            <Text style={styles.totalLabel}>CONSTRUCTIONS</Text>
            <Text style={styles.totalVal}>{formatFCFA(s.totalConstructions)}</Text>
          </View>
        </View>

        {expenseType === 'autres' && (
          <View style={styles.quickTagsRow}>
            {[
              'Vaccins & Médicaments',
              'Transport aliment',
              'Alvéoles',
              'Vétérinaire',
              'Carburant',
              'Ravitaillement',
            ].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.quickTag}
                onPress={() => setDesignation(tag)}
              >
                <Text style={styles.quickTagText}>+ {tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nouvelle dépense</Text>

          <Text style={styles.label}>Date</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} />

          <Text style={styles.label}>Désignation *</Text>
          <TextInput
            style={styles.input}
            placeholder={expenseType === 'autres' ? 'Produit acheté' : 'Travaux'}
            placeholderTextColor={COLORS.textMuted}
            value={designation}
            onChangeText={setDesignation}
          />

          <Text style={styles.label}>Montant (FCFA) *</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={COLORS.textMuted}
            value={montant}
            onChangeText={setMontant}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleAddExpense}>
            <Ionicons name="add-circle" size={21} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listHeader}>Historique ({itemsList.length})</Text>

        {itemsList.map((item) => {
          const label = item.produit || item.designation;
          return (
            <View key={item.id} style={styles.expenseCard}>
              <View style={styles.expenseLeft}>
                <View
                  style={[
                    styles.expenseIcon,
                    { backgroundColor: expenseType === 'autres' ? '#FEF3C7' : '#E0F2FE' },
                  ]}
                >
                  <Ionicons
                    name={expenseType === 'autres' ? 'receipt-outline' : 'hammer-outline'}
                    size={20}
                    color={expenseType === 'autres' ? COLORS.primary : '#0284C7'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseTitle}>{label}</Text>
                  <Text style={styles.expenseDate}>{item.date}</Text>
                </View>
              </View>

              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>{formatFCFA(item.montant)}</Text>
                {(user?.role === 'admin' || user?.role === 'gerant') && (
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, label)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 30 },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#EFECE6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  totalsBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  totalCol: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  totalLabel: {
    color: '#FDE68A',
    fontSize: 10.5,
    fontWeight: '800',
  },
  totalVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  quickTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  quickTag: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickTagText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#78350F',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
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
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  amountInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
    height: 48,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  listHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    paddingRight: 8,
  },
  expenseIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  expenseDate: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  expenseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.accent,
  },
});
