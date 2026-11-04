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
  saveEmployeSalary,
  deleteEmployeSalary,
  calculateCompleteMonths,
} from '../services/farmDataService';

export default function SalairesScreen({ navigation }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());
  const [summary, setSummary] = useState(() => getCachedSummary());

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nom, setNom] = useState('');
  const [poste, setPoste] = useState('');
  const [salaireMensuel, setSalaireMensuel] = useState('');
  const [dateDebut, setDateDebut] = useState('2026-03-24');
  const [dateFin, setDateFin] = useState('');
  const [nbMoisManuel, setNbMoisManuel] = useState('');

  const loadData = async () => {
    const u = await getCurrentUser();
    if (!u || u.role !== 'admin') {
      Alert.alert('Accès Réservé', "Page réservée à l'Administrateur.");
      navigation.replace('Dashboard');
      return;
    }
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

  const openEditModal = (emp = null) => {
    if (emp) {
      setEditId(emp.id);
      setNom(emp.nom);
      setPoste(emp.poste || 'Employé');
      setSalaireMensuel(String(emp.salaireMensuel || ''));
      setDateDebut(emp.dateDebut || '2026-03-24');
      setDateFin(emp.dateFin || '');
      setNbMoisManuel(
        emp.nbMoisManuel !== null && emp.nbMoisManuel !== undefined ? String(emp.nbMoisManuel) : ''
      );
    } else {
      setEditId(null);
      setNom('');
      setPoste('Employé');
      setSalaireMensuel('');
      setDateDebut(new Date().toISOString().split('T')[0]);
      setDateFin('');
      setNbMoisManuel('');
    }
    setModalVisible(true);
  };

  const handleSaveEmploye = async () => {
    if (!nom.trim()) {
      Alert.alert('Nom requis', "Veuillez saisir le nom de l'employé.");
      return;
    }

    const updated = await saveEmployeSalary({
      id: editId,
      nom: nom.trim(),
      poste: poste.trim(),
      salaireMensuel: Number(salaireMensuel) || 0,
      dateDebut: dateDebut.trim() || '2026-03-24',
      dateFin: dateFin.trim(),
      nbMoisManuel: nbMoisManuel.trim() === '' ? null : Number(nbMoisManuel),
    });

    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setModalVisible(false);
  };

  const handleDeleteEmploye = (emp) => {
    Alert.alert('Supprimer ?', emp.nom, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteEmployeSalary(emp.id);
          setWorkbook(updated);
          setSummary(computeFarmSummary(updated));
        },
      },
    ]);
  };

  const s = summary || {};
  const employesList = s.employesCalcules || [];

  const previewMonths =
    nbMoisManuel.trim() !== ''
      ? Number(nbMoisManuel) || 0
      : calculateCompleteMonths(dateDebut, dateFin);
  const previewTotal = (Number(salaireMensuel) || 0) * previewMonths;

  return (
    <NavigationLayout
      user={user}
      activeTab="Salaires"
      title="Salaires"
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSalaryCard}>
          <View>
            <Text style={styles.heroLabel}>TOTAL SALAIRES</Text>
            <Text style={styles.heroAmount}>{formatFCFA(s.totalSalaires)}</Text>
          </View>
          <TouchableOpacity style={styles.addEmpBtn} onPress={() => openEditModal(null)}>
            <Ionicons name="person-add" size={18} color="#78350F" />
            <Text style={styles.addEmpBtnText}>+ Employé</Text>
          </TouchableOpacity>
        </View>

        {employesList.map((emp) => (
          <View key={emp.id} style={styles.empCard}>
            <View style={styles.empHeader}>
              <View style={styles.empAvatar}>
                <Text style={styles.empAvatarLetter}>{emp.nom.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.empName}>{emp.nom}</Text>
                <Text style={styles.empPoste}>{emp.poste || 'Employé'}</Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditModal(emp)}
              >
                <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                <Text style={styles.editBtnText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 6 }}
                onPress={() => handleDeleteEmploye(emp)}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>

            <View style={styles.empStatsGrid}>
              <View style={styles.empStatCol}>
                <Text style={styles.empStatLbl}>Salaire / Mois</Text>
                <Text style={styles.empStatVal}>{formatFCFA(emp.salaireMensuel)}</Text>
              </View>
              <View style={styles.empStatCol}>
                <Text style={styles.empStatLbl}>Début</Text>
                <Text style={styles.empStatVal}>{emp.dateDebut || '-'}</Text>
              </View>
              <View style={styles.empStatCol}>
                <Text style={styles.empStatLbl}>Mois</Text>
                <Text style={[styles.empStatVal, { color: COLORS.primary }]}>
                  {emp.moisComplets} mois
                </Text>
              </View>
              <View style={styles.empStatCol}>
                <Text style={styles.empStatLbl}>Total Payé</Text>
                <Text style={[styles.empStatVal, { color: COLORS.secondary, fontWeight: '900' }]}>
                  {formatFCFA(emp.totalPaye)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editId ? nom : 'Nouvel Employé'}
            </Text>

            <Text style={styles.inputLabel}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={nom}
              onChangeText={setNom}
              placeholder="Nom de l'employé"
            />

            <Text style={styles.inputLabel}>Poste</Text>
            <TextInput
              style={styles.input}
              value={poste}
              onChangeText={setPoste}
              placeholder="Poste"
            />

            <Text style={styles.inputLabel}>Salaire par mois (FCFA) *</Text>
            <TextInput
              style={[styles.input, { borderColor: COLORS.primary, borderWidth: 1.5 }]}
              keyboardType="numeric"
              value={salaireMensuel}
              onChangeText={setSalaireMensuel}
              placeholder="0"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Date début</Text>
                <TextInput
                  style={styles.input}
                  value={dateDebut}
                  onChangeText={setDateDebut}
                  placeholder="2026-03-24"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Date fin</Text>
                <TextInput
                  style={styles.input}
                  value={dateFin}
                  onChangeText={setDateFin}
                  placeholder="Optionnel"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Nombre de mois (Optionnel)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={nbMoisManuel}
              onChangeText={setNbMoisManuel}
              placeholder={`Auto : ${calculateCompleteMonths(dateDebut, dateFin)} mois`}
            />

            <View style={styles.previewSalaryBox}>
              <Text style={styles.previewSalaryText}>
                Total : {previewMonths} mois × {formatFCFA(salaireMensuel)} ={' '}
                <Text style={{ fontWeight: '900', color: '#78350F' }}>
                  {formatFCFA(previewTotal)}
                </Text>
              </Text>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#78716C' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.secondary }]}
                onPress={handleSaveEmploye}
              >
                <Text style={styles.modalBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  heroSalaryCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    ...SHADOWS.medium,
  },
  heroLabel: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  addEmpBtn: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addEmpBtnText: {
    color: '#78350F',
    fontSize: 13,
    fontWeight: '900',
  },
  empCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  empHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  empAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empAvatarLetter: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  empName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  empPoste: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  empStatsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
  },
  empStatCol: {
    flex: 1,
  },
  empStatLbl: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  empStatVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputLabel: {
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
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  previewSalaryBox: {
    backgroundColor: '#FEF08A',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  previewSalaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#713F12',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
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
