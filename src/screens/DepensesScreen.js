import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
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
  updateExpenseItem,
  deleteExpenseItem,
} from '../services/farmDataService';

export default function DepensesScreen({ navigation, route }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());
  const [summary, setSummary] = useState(() => getCachedSummary());
  const [expenseType, setExpenseType] = useState(route?.params?.tab || 'autres'); // 'autres' | 'aliment' | 'entretien' | 'constructions'

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [designation, setDesignation] = useState('');
  const [montant, setMontant] = useState('');

  // Modale de modification d'une dépense ou d'un versement aliment en cas d'erreur
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editMontant, setEditMontant] = useState('');

  const loadData = async () => {
    const u = await getCurrentUser();
    setUser(u);
    const wb = await loadFarmWorkbook();
    setWorkbook(wb);
    setSummary(computeFarmSummary(wb));
  };

  useEffect(() => {
    if (route?.params?.tab) {
      setExpenseType(route.params.tab);
    }
  }, [route?.params?.tab]);

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const s = summary || {};
  const canModify = user?.role === 'admin' || user?.role === 'gerant' || user?.role === 'employe';

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
        `L'entrée "${cleanDesig}" (${formatFCFA(cleanMontant)}) du ${date.trim()} a déjà été ajoutée. Utilisez le bouton Modifier si vous souhaitez la corriger.`
      );
      return;
    }

    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setDesignation('');
    setMontant('');

    Alert.alert('Enregistré', `${cleanDesig} : ${formatFCFA(cleanMontant)}`);
  };

  const openEditModal = (item) => {
    setEditingExpense(item);
    setEditDate(item.date || new Date().toISOString().split('T')[0]);
    setEditDesignation(item.produit || item.designation || '');
    setEditMontant(String(item.montant || ''));
    setEditModalVisible(true);
  };

  const handleSaveEditedExpense = async () => {
    if (!editingExpense) return;
    const cleanDesig = editDesignation.trim();
    const cleanMontant = Number(editMontant) || 0;
    if (!cleanDesig || cleanMontant <= 0) {
      Alert.alert('Champs requis', 'Veuillez renseigner la désignation et le montant.');
      return;
    }

    const updated = await updateExpenseItem({
      type: expenseType,
      id: editingExpense.id,
      date: editDate.trim(),
      designation: cleanDesig,
      montant: cleanMontant,
    });

    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setEditModalVisible(false);
    setEditingExpense(null);
    Alert.alert('Modifié ✅', `${cleanDesig} : ${formatFCFA(cleanMontant)}`);
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
          if (editingExpense?.id === id) {
            setEditModalVisible(false);
            setEditingExpense(null);
          }
        },
      },
    ]);
  };

  const itemsList =
    expenseType === 'autres'
      ? workbook?.autresDepenses || []
      : expenseType === 'aliment'
      ? workbook?.versementsAliment || []
      : expenseType === 'entretien'
      ? workbook?.entretiens || []
      : workbook?.constructions || [];

  const quickTags =
    expenseType === 'autres'
      ? [
          'Vaccins & Médicaments',
          'Vétérinaire',
          'Ravitaillement',
        ]
      : expenseType === 'aliment'
      ? [
          'Versement Aliment',
          'Avance Aliment',
          'Achat Sacs Aliment',
          'Transport Aliment',
          'Emprunt Aliment',
        ]
      : expenseType === 'entretien'
      ? [
          'Carburant',
          'Alvéoles',
          'Nettoyage & Désinfection',
          'Réparation matériel',
          'Entretien groupes / solaire',
          'Plomberie & Abreuvoirs',
          'Copeaux / Litière',
        ]
      : [];

  const formTitleText =
    expenseType === 'aliment'
      ? 'Nouvelle dépense d’aliment'
      : expenseType === 'entretien'
      ? 'Nouvelle dépense d’entretien'
      : expenseType === 'constructions'
      ? 'Nouvelle dépense construction'
      : 'Nouvelle dépense';

  const designationPlaceholder =
    expenseType === 'aliment'
      ? 'Ex: Versement, Transport, Emprunt...'
      : expenseType === 'entretien'
      ? 'Entretien effectué'
      : expenseType === 'constructions'
      ? 'Travaux'
      : 'Produit acheté';

  return (
    <NavigationLayout
      user={user}
      activeTab="Depenses"
      title="Dépenses"
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Barre d'onglets : Autres Achats | Versement Aliment | Entretien | Constructions */}
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.tabBtn, expenseType === 'autres' && styles.tabBtnActive]}
            onPress={() => {
              setExpenseType('autres');
              setDesignation('');
            }}
          >
            <Ionicons
              name="medkit"
              size={14}
              color={expenseType === 'autres' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, expenseType === 'autres' && { color: '#FFFFFF' }]}>
              Autres Achats ({workbook?.autresDepenses?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, expenseType === 'aliment' && styles.tabBtnActive]}
            onPress={() => {
              setExpenseType('aliment');
              setDesignation('');
            }}
          >
            <Ionicons
              name="nutrition"
              size={14}
              color={expenseType === 'aliment' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, expenseType === 'aliment' && { color: '#FFFFFF' }]}>
              Dépenses Aliment ({workbook?.versementsAliment?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, expenseType === 'entretien' && styles.tabBtnActive]}
            onPress={() => {
              setExpenseType('entretien');
              setDesignation('');
            }}
          >
            <Ionicons
              name="build"
              size={14}
              color={expenseType === 'entretien' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, expenseType === 'entretien' && { color: '#FFFFFF' }]}>
              Entretien ({workbook?.entretiens?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, expenseType === 'constructions' && styles.tabBtnActive]}
            onPress={() => {
              setExpenseType('constructions');
              setDesignation('');
            }}
          >
            <Ionicons
              name="construct"
              size={14}
              color={expenseType === 'constructions' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, expenseType === 'constructions' && { color: '#FFFFFF' }]}>
              Constructions ({workbook?.constructions?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bandeau récapitulatif interactif (Grille 2x2 : Autres Achats | Versement Aliment | Entretien | Constructions) */}
        <View style={styles.totalsBanner}>
          <View style={styles.totalsGridRow}>
            <TouchableOpacity
              style={[
                styles.totalBoxCard,
                expenseType === 'autres' && styles.totalBoxCardActive,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setExpenseType('autres');
                setDesignation('');
              }}
            >
              <View style={styles.totalBoxHeader}>
                <Ionicons name="medkit" size={14} color="#FDE68A" />
                <Text style={styles.totalLabel}>AUTRES ACHATS</Text>
              </View>
              <Text style={styles.totalVal}>{formatFCFA(s.totalAutresDepenses)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.totalBoxCard,
                expenseType === 'aliment' && styles.totalBoxCardActive,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setExpenseType('aliment');
                setDesignation('');
              }}
            >
              <View style={styles.totalBoxHeader}>
                <Ionicons name="nutrition" size={14} color="#86EFAC" />
                <Text style={[styles.totalLabel, { color: '#86EFAC' }]}>DÉPENSES ALIMENT</Text>
              </View>
              <Text style={styles.totalVal}>{formatFCFA(s.totalVersementsAliment)}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.totalsGridRow, { marginTop: 8 }]}>
            <TouchableOpacity
              style={[
                styles.totalBoxCard,
                expenseType === 'entretien' && styles.totalBoxCardActive,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setExpenseType('entretien');
                setDesignation('');
              }}
            >
              <View style={styles.totalBoxHeader}>
                <Ionicons name="build" size={14} color="#FDBA74" />
                <Text style={[styles.totalLabel, { color: '#FDBA74' }]}>ENTRETIEN</Text>
              </View>
              <Text style={styles.totalVal}>{formatFCFA(s.totalEntretiens)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.totalBoxCard,
                expenseType === 'constructions' && styles.totalBoxCardActive,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setExpenseType('constructions');
                setDesignation('');
              }}
            >
              <View style={styles.totalBoxHeader}>
                <Ionicons name="construct" size={14} color="#93C5FD" />
                <Text style={[styles.totalLabel, { color: '#93C5FD' }]}>CONSTRUCTIONS</Text>
              </View>
              <Text style={styles.totalVal}>{formatFCFA(s.totalConstructions)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {quickTags.length > 0 && (
          <View style={styles.quickTagsRow}>
            {quickTags.map((tag) => (
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
          <Text style={styles.formTitle}>{formTitleText}</Text>

          <Text style={styles.label}>Date</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} />

          <Text style={styles.label}>Désignation *</Text>
          <TextInput
            style={styles.input}
            placeholder={designationPlaceholder}
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

        {itemsList.length === 0 && (
          <View style={styles.emptyExpenseBox}>
            <Ionicons
              name={
                expenseType === 'aliment'
                  ? 'nutrition-outline'
                  : expenseType === 'entretien'
                  ? 'build-outline'
                  : 'receipt-outline'
              }
              size={28}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyExpenseText}>
              {expenseType === 'aliment'
                ? 'Aucune dépense d’aliment enregistrée. Utilisez les boutons ci-dessus (Versement, Avance, Achat, Transport, Emprunt) pour en ajouter.'
                : expenseType === 'entretien'
                ? 'Aucune dépense d’entretien enregistrée. Utilisez le formulaire ci-dessus pour ajouter un entretien.'
                : 'Aucune dépense enregistrée dans cette catégorie.'}
            </Text>
          </View>
        )}

        {itemsList.map((item) => {
          const label = item.produit || item.designation;
          const iconBg =
            expenseType === 'autres'
              ? '#FEF3C7'
              : expenseType === 'aliment'
              ? '#DCFCE7'
              : expenseType === 'entretien'
              ? '#FFEDD5'
              : '#E0F2FE';
          const iconName =
            expenseType === 'autres'
              ? 'receipt-outline'
              : expenseType === 'aliment'
              ? 'nutrition-outline'
              : expenseType === 'entretien'
              ? 'build-outline'
              : 'hammer-outline';
          const iconColor =
            expenseType === 'autres'
              ? COLORS.primary
              : expenseType === 'aliment'
              ? COLORS.secondary
              : expenseType === 'entretien'
              ? '#EA580C'
              : '#0284C7';

          return (
            <View key={item.id} style={styles.expenseCard}>
              <TouchableOpacity
                style={styles.expenseLeft}
                activeOpacity={0.75}
                onPress={() => canModify && openEditModal(item)}
              >
                <View style={[styles.expenseIcon, { backgroundColor: iconBg }]}>
                  <Ionicons name={iconName} size={20} color={iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseTitle}>{label}</Text>
                  <Text style={styles.expenseDate}>{item.date}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>{formatFCFA(item.montant)}</Text>
                {canModify && (
                  <View style={styles.expenseActionBtns}>
                    <TouchableOpacity
                      onPress={() => openEditModal(item)}
                      style={styles.editIconBtn}
                    >
                      <Ionicons name="create-outline" size={16} color="#78350F" />
                    </TouchableOpacity>
                    {(user?.role === 'admin' || user?.role === 'gerant') && (
                      <TouchableOpacity
                        onPress={() => handleDelete(item.id, label)}
                        style={styles.deleteIconBtn}
                      >
                        <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Modale de modification d'une dépense ou d'un versement aliment en cas d'erreur */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>
                  {expenseType === 'aliment'
                    ? 'Modifier la dépense d’aliment'
                    : expenseType === 'entretien'
                    ? 'Modifier l’entretien'
                    : 'Modifier la dépense'}
                </Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={editDate}
                onChangeText={setEditDate}
              />

              <Text style={styles.label}>Désignation *</Text>
              <TextInput
                style={styles.input}
                value={editDesignation}
                onChangeText={setEditDesignation}
              />

              <Text style={styles.label}>Montant (FCFA) *</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={editMontant}
                onChangeText={setEditMontant}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#78716C' }]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                  onPress={handleSaveEditedExpense}
                >
                  <Text style={styles.modalBtnText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 30 },
  tabSwitch: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#EFECE6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  tabBtn: {
    width: '48.8%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 11,
    gap: 5,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  totalsBanner: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
  },
  totalsGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  totalBoxCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  totalBoxCardActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: '#F59E0B',
  },
  totalBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  totalLabel: {
    color: '#FDE68A',
    fontSize: 10.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  totalVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyExpenseBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    gap: 8,
  },
  emptyExpenseText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
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
    alignItems: 'flex-end',
    gap: 5,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.accent,
  },
  expenseActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editIconBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 7,
    padding: 5,
  },
  deleteIconBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 7,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
