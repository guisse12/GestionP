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
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout from '../components/NavigationLayout';
import { COLORS, SHADOWS, formatFCFA } from '../theme/colors';
import { getCachedUser, getCurrentUser, loadAllUsers } from '../services/authService';
import {
  getCachedWorkbook,
  getCachedSummary,
  loadFarmWorkbook,
  computeFarmSummary,
  saveEmployeSalary,
  deleteEmployeSalary,
  addEmployePayment,
  toggleEmployePaymentStatus,
  deleteEmployePayment,
  calculateCompleteMonths,
} from '../services/farmDataService';

const PAYMENT_PERIODS = [
  'Novembre 2026',
  'Octobre 2026',
  'Septembre 2026',
  'Août 2026',
  'Juillet 2026',
  'Juin 2026',
  'Mai 2026',
  'Avril 2026',
  'Mars 2026',
];

const PAYMENT_TYPES = ['Salaire Mensuel', 'Avance', 'Prime / Bonus', 'Régularisation'];
const PAYMENT_METHODS = ['Espèces', 'Wave', 'Orange Money', 'Virement'];
const SUGGESTED_FUNCTIONS = [
  'Aviculteur Boxe 1',
  'Aviculteur Boxe 2',
  'Suivi Stock & Aliment',
  'Gardien / Sécurité',
  'Entretien & Hygiène',
  'Livreur',
];

export default function SalairesScreen({ navigation }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());
  const [summary, setSummary] = useState(() => getCachedSummary());
  const [appUsers, setAppUsers] = useState([]);

  // Filtre liste principale : 'all' | 'gerant' | 'employe'
  const [roleFilter, setRoleFilter] = useState('all');

  // Employé / Gérant actuellement ouvert dans son interface de paiement individuelle
  const [selectedEmployeId, setSelectedEmployeId] = useState(null);

  // Modal Ajout / Modification d'un Employé ou Gérant
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [categorie, setCategorie] = useState('employe'); // 'employe' | 'gerant'
  const [nom, setNom] = useState('');
  const [poste, setPoste] = useState('');
  const [adresse, setAdresse] = useState('Thiès');
  const [telephone, setTelephone] = useState('');
  const [salaireMensuel, setSalaireMensuel] = useState('');
  const [dateDebut, setDateDebut] = useState('2026-03-24');
  const [dateFin, setDateFin] = useState('');
  const [nbMoisManuel, setNbMoisManuel] = useState('');

  // Formulaire de paiement individuel (propre à l'employé ouvert)
  const [payEditId, setPayEditId] = useState(null);
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payPeriode, setPayPeriode] = useState('Novembre 2026');
  const [payType, setPayType] = useState('Salaire Mensuel');
  const [payMode, setPayMode] = useState('Espèces');
  const [payMontant, setPayMontant] = useState('');
  const [payStatut, setPayStatut] = useState('Payé');
  const [payNote, setPayNote] = useState('');

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

    try {
      const allU = await loadAllUsers();
      setAppUsers(
        (allU || []).filter((acc) => acc.role === 'gerant' || acc.role === 'employe')
      );
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const s = summary || {};
  const employesList = s.employesCalcules || [];
  const selectedEmploye = employesList.find((e) => e.id === selectedEmployeId) || null;

  // Ouvrir l'interface de paiement individuelle d'un employé / gérant
  const openIndividualPaymentInterface = (emp) => {
    setSelectedEmployeId(emp.id);
    setPayEditId(null);
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayPeriode('Novembre 2026');
    setPayType('Salaire Mensuel');
    setPayMode('Espèces');
    setPayMontant(emp.salaireMensuel > 0 ? String(emp.salaireMensuel) : '');
    setPayStatut('Payé');
    setPayNote('');
  };

  // Ouvrir le modal d'ajout/édition d'un employé ou gérant
  const openEditModal = (emp = null, defaultCat = 'employe') => {
    if (emp) {
      setEditId(emp.id);
      setCategorie(emp.categorie === 'gerant' ? 'gerant' : 'employe');
      setNom(emp.nom);
      setPoste(emp.poste || (emp.categorie === 'gerant' ? 'Gérant du poulailler' : ''));
      setAdresse(emp.adresse || 'Thiès');
      setTelephone(emp.telephone || '');
      setSalaireMensuel(String(emp.salaireMensuel || ''));
      setDateDebut(emp.dateDebut || '2026-03-24');
      setDateFin(emp.dateFin || '');
      setNbMoisManuel(
        emp.nbMoisManuel !== null && emp.nbMoisManuel !== undefined ? String(emp.nbMoisManuel) : ''
      );
    } else {
      setEditId(null);
      setCategorie(defaultCat);
      setNom('');
      setPoste(defaultCat === 'gerant' ? 'Gérant du poulailler' : '');
      setAdresse('Thiès');
      setTelephone('');
      setSalaireMensuel('');
      setDateDebut(new Date().toISOString().split('T')[0]);
      setDateFin('');
      setNbMoisManuel('');
    }
    setModalVisible(true);
  };

  const handlePickExistingAccount = (acc) => {
    setNom(acc.nom || '');
    setTelephone(acc.telephone || '');
    const cat = acc.role === 'gerant' ? 'gerant' : 'employe';
    setCategorie(cat);
    setPoste(acc.poste || (cat === 'gerant' ? 'Gérant du poulailler' : ''));
    setAdresse(acc.adresse || 'Thiès');
  };

  const handleSaveEmploye = async () => {
    if (!nom.trim()) {
      Alert.alert('Nom requis', 'Veuillez saisir le nom de la personne.');
      return;
    }
    if (!poste.trim()) {
      Alert.alert('Fonction requise', 'Veuillez attribuer une fonction / poste à cette personne.');
      return;
    }

    const updated = await saveEmployeSalary({
      id: editId,
      nom: nom.trim(),
      categorie,
      poste: poste.trim(),
      adresse: adresse.trim() || 'Thiès',
      telephone: telephone.trim(),
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
    Alert.alert(
      'Supprimer cette fiche ?',
      `Voulez-vous vraiment supprimer ${emp.nom} (${
        emp.categorie === 'gerant' ? 'Gérant' : 'Employé'
      }) de la liste des salaires ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteEmployeSalary(emp.id);
            setWorkbook(updated);
            setSummary(computeFarmSummary(updated));
            if (selectedEmployeId === emp.id) {
              setSelectedEmployeId(null);
            }
          },
        },
      ]
    );
  };

  // Enregistrer ou modifier un paiement dans l'interface individuelle de l'employé
  const handleSaveIndividualPayment = async () => {
    if (!selectedEmploye) return;
    const cleanMontant = Number(payMontant) || 0;
    if (cleanMontant <= 0) {
      Alert.alert('Montant requis', 'Veuillez saisir un montant de paiement supérieur à 0 FCFA.');
      return;
    }

    const updated = await addEmployePayment(selectedEmploye.id, {
      id: payEditId,
      date: payDate.trim() || new Date().toISOString().split('T')[0],
      periode: payPeriode.trim() || 'Mensuel',
      type: payType,
      modePaiement: payMode,
      montant: cleanMontant,
      statut: payStatut,
      note: payNote.trim(),
    });

    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setPayEditId(null);
    setPayNote('');
    Alert.alert(
      'Paiement enregistré ✅',
      `${payType} de ${formatFCFA(cleanMontant)} (${payPeriode}) enregistré pour ${selectedEmploye.nom}.`
    );
  };

  const handleEditPaymentRow = (p) => {
    setPayEditId(p.id);
    setPayDate(p.date || new Date().toISOString().split('T')[0]);
    setPayPeriode(p.periode || 'Novembre 2026');
    setPayType(p.type || 'Salaire Mensuel');
    setPayMode(p.modePaiement || 'Espèces');
    setPayMontant(String(p.montant || ''));
    setPayStatut(p.statut || 'Payé');
    setPayNote(p.note || '');
  };

  const handleTogglePaymentStatus = async (p) => {
    if (!selectedEmploye) return;
    const updated = await toggleEmployePaymentStatus(selectedEmploye.id, p.id);
    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
  };

  const handleDeletePaymentRow = (p) => {
    if (!selectedEmploye) return;
    Alert.alert(
      'Supprimer ce versement ?',
      `${p.periode} — ${formatFCFA(p.montant)}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteEmployePayment(selectedEmploye.id, p.id);
            setWorkbook(updated);
            setSummary(computeFarmSummary(updated));
          },
        },
      ]
    );
  };

  const handleShareEmployeeReceipt = async (emp, singlePayment = null) => {
    const roleLabel = emp.categorie === 'gerant' ? 'Gérant' : 'Employé';
    const lines = singlePayment
      ? [
          `🧾 REÇU DE PAIEMENT - GestionP`,
          `👤 Bénéficiaire : ${emp.nom} (${roleLabel} - ${emp.poste || roleLabel})`,
          `📅 Date : ${singlePayment.date}`,
          `🗓 Période : ${singlePayment.periode}`,
          `🏷 Type : ${singlePayment.type}`,
          `💳 Mode : ${singlePayment.modePaiement}`,
          `💰 Montant versé : ${formatFCFA(singlePayment.montant)}`,
          `📌 Statut : ${singlePayment.statut}`,
          ...(singlePayment.note ? [`📝 Note : ${singlePayment.note}`] : []),
        ]
      : [
          `📊 FICHE DE PAIEMENT INDIVIDUELLE - GestionP`,
          `👤 Nom : ${emp.nom} (${roleLabel})`,
          `💼 Poste : ${emp.poste || roleLabel}`,
          `💵 Salaire de référence : ${formatFCFA(emp.salaireMensuel)} / mois`,
          `📅 Date d'embauche : ${emp.dateDebut || '-'}`,
          `--------------------------------`,
          `✅ TOTAL PAYÉ : ${formatFCFA(emp.totalPaye)}`,
          ...(emp.totalEnAttenteIndividuel > 0
            ? [`⏳ En attente : ${formatFCFA(emp.totalEnAttenteIndividuel)}`]
            : []),
          `--------------------------------`,
          ...(emp.paiements && emp.paiements.length > 0
            ? [
                `📋 HISTORIQUE DES VERSEMENTS (${emp.paiements.length}) :`,
                ...emp.paiements.map(
                  (p) =>
                    `• ${p.date} [${p.periode}] : ${formatFCFA(p.montant)} (${p.type} - ${p.modePaiement}) [${p.statut}]`
                ),
              ]
            : [`• Calcul forfaitaire : ${emp.moisComplets} mois × ${formatFCFA(emp.salaireMensuel)}`]),
        ];

    try {
      await Share.share({
        title: `Paiement ${emp.nom}`,
        message: lines.join('\n'),
      });
    } catch (e) {}
  };

  const filteredEmployes = employesList.filter((emp) => {
    if (roleFilter === 'gerant') return emp.categorie === 'gerant';
    if (roleFilter === 'employe') return emp.categorie !== 'gerant';
    return true;
  });

  const nbGerants = employesList.filter((e) => e.categorie === 'gerant').length;
  const nbEmployes = employesList.filter((e) => e.categorie !== 'gerant').length;

  const previewMonths =
    nbMoisManuel.trim() !== ''
      ? Number(nbMoisManuel) || 0
      : calculateCompleteMonths(dateDebut, dateFin);
  const previewTotal = (Number(salaireMensuel) || 0) * previewMonths;

  return (
    <NavigationLayout
      user={user}
      activeTab="Salaires"
      title={selectedEmploye ? `Paiement • ${selectedEmploye.nom}` : 'Salaires & Paiements'}
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      {/* =====================================================================
          VUE 1 : INTERFACE DE PAIEMENT INDIVIDUELLE PROPRE À L'EMPLOYÉ / GÉRANT
         ===================================================================== */}
      {selectedEmploye ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Barre supérieure de retour + actions rapides */}
          <View style={styles.indivTopBar}>
            <TouchableOpacity
              style={styles.backToListBtn}
              onPress={() => setSelectedEmployeId(null)}
            >
              <Ionicons name="arrow-back" size={18} color={COLORS.primaryDark} />
              <Text style={styles.backToListText}>Tous les employés</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={styles.indivConfigBtn}
                onPress={() => openEditModal(selectedEmploye)}
              >
                <Ionicons name="settings-outline" size={16} color={COLORS.primaryDark} />
                <Text style={styles.indivConfigBtnText}>Contrat / Salaire</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.indivShareBtn}
                onPress={() => handleShareEmployeeReceipt(selectedEmploye)}
              >
                <Ionicons name="share-social-outline" size={17} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Carte d'identité & Bilan Salarial Personnel de l'Employé / Gérant */}
          <View
            style={[
              styles.indivHeroCard,
              selectedEmploye.categorie === 'gerant' && { backgroundColor: '#14532D' },
            ]}
          >
            <View style={styles.indivHeroTop}>
              <View
                style={[
                  styles.indivAvatarLarge,
                  selectedEmploye.categorie === 'gerant' && { backgroundColor: '#DCFCE7' },
                ]}
              >
                <Text
                  style={[
                    styles.indivAvatarLetter,
                    selectedEmploye.categorie === 'gerant' && { color: '#15803D' },
                  ]}
                >
                  {selectedEmploye.nom.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Text style={styles.indivName}>{selectedEmploye.nom}</Text>
                  <View
                    style={[
                      styles.rolePillBadge,
                      {
                        backgroundColor:
                          selectedEmploye.categorie === 'gerant' ? '#22C55E' : '#F59E0B',
                      },
                    ]}
                  >
                    <Text style={styles.rolePillBadgeText}>
                      {selectedEmploye.categorie === 'gerant' ? 'GÉRANT' : 'EMPLOYÉ'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.indivPoste}>
                  {selectedEmploye.poste || 'Personnel'} • 📍 {selectedEmploye.adresse || 'Thiès'}
                  {selectedEmploye.telephone ? ` • 📞 ${selectedEmploye.telephone}` : ''}
                </Text>
                <Text style={styles.indivSubDate}>
                  Depuis le {selectedEmploye.dateDebut || '2026-03-24'}
                </Text>
              </View>
            </View>

            <View style={styles.indivKpiRow}>
              <View style={styles.indivKpiBox}>
                <Text style={styles.indivKpiLbl}>SALAIRE DE RÉF.</Text>
                <Text style={styles.indivKpiVal}>
                  {formatFCFA(selectedEmploye.salaireMensuel)}
                </Text>
                <Text style={styles.indivKpiHint}>par mois</Text>
              </View>

              <View style={styles.indivKpiBox}>
                <Text style={styles.indivKpiLbl}>TOTAL PAYÉ</Text>
                <Text style={[styles.indivKpiVal, { color: '#86EFAC' }]}>
                  {formatFCFA(selectedEmploye.totalPaye)}
                </Text>
                <Text style={styles.indivKpiHint}>
                  {selectedEmploye.paiements.length > 0
                    ? `${selectedEmploye.paiements.length} versement(s)`
                    : `${selectedEmploye.moisComplets} mois cumulés`}
                </Text>
              </View>

              <View style={styles.indivKpiBox}>
                <Text style={styles.indivKpiLbl}>EN ATTENTE</Text>
                <Text style={[styles.indivKpiVal, { color: '#FDE68A' }]}>
                  {formatFCFA(selectedEmploye.totalEnAttenteIndividuel)}
                </Text>
                <Text style={styles.indivKpiHint}>reste à régler</Text>
              </View>
            </View>
          </View>

          {/* Formulaire de Paiement Individuel (Montant personnalisable pour ce mois) */}
          <View style={styles.paymentFormCard}>
            <View style={styles.formHeaderRow}>
              <View style={styles.formIconBadge}>
                <Ionicons name="cash-outline" size={20} color="#15803D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formCardTitle}>
                  {payEditId
                    ? `Modifier le paiement de ${selectedEmploye.nom}`
                    : `Nouveau paiement pour ${selectedEmploye.nom}`}
                </Text>
              </View>
              {payEditId && (
                <TouchableOpacity
                  onPress={() => {
                    setPayEditId(null);
                    setPayMontant(
                      selectedEmploye.salaireMensuel > 0
                        ? String(selectedEmploye.salaireMensuel)
                        : ''
                    );
                    setPayNote('');
                  }}
                >
                  <Text style={{ color: COLORS.danger, fontWeight: '800', fontSize: 12 }}>
                    Annuler
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sélection rapide du mois / période */}
            <Text style={styles.inputLabel}>Mois / Période concernée</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 8 }}
            >
              {PAYMENT_PERIODS.map((per) => {
                const active = payPeriode === per;
                return (
                  <TouchableOpacity
                    key={per}
                    style={[styles.chipBtn, active && styles.chipBtnActive]}
                    onPress={() => setPayPeriode(per)}
                  >
                    <Text style={[styles.chipBtnText, active && { color: '#FFFFFF' }]}>
                      {per}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Période personnalisée</Text>
                <TextInput
                  style={styles.input}
                  value={payPeriode}
                  onChangeText={setPayPeriode}
                  placeholder=""
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Date du paiement</Text>
                <TextInput
                  style={styles.input}
                  value={payDate}
                  onChangeText={setPayDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            {/* Type de versement */}
            <Text style={styles.inputLabel}>Type de versement</Text>
            <View style={styles.chipsWrapRow}>
              {PAYMENT_TYPES.map((t) => {
                const active = payType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chipBtn, active && styles.chipBtnActive]}
                    onPress={() => setPayType(t)}
                  >
                    <Text style={[styles.chipBtnText, active && { color: '#FFFFFF' }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Montant du paiement (pré-rempli ou différent) */}
            <View style={styles.amountLabelRow}>
              <Text style={styles.inputLabel}>Montant à payer pour ce versement (FCFA) *</Text>
              {selectedEmploye.salaireMensuel > 0 && (
                <TouchableOpacity
                  onPress={() => setPayMontant(String(selectedEmploye.salaireMensuel))}
                >
                  <Text style={styles.fillRefSalaryLink}>
                    Mettre salaire réf. ({formatFCFA(selectedEmploye.salaireMensuel)})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.input, styles.amountHighlightInput]}
              keyboardType="numeric"
              value={payMontant}
              onChangeText={setPayMontant}
              placeholder=""
            />

            {/* Mode de paiement & Statut */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <View style={{ flex: 1.3 }}>
                <Text style={styles.inputLabel}>Mode de règlement</Text>
                <View style={styles.chipsWrapRow}>
                  {PAYMENT_METHODS.map((m) => {
                    const active = payMode === m;
                    return (
                      <TouchableOpacity
                        key={m}
                        style={[styles.smallChipBtn, active && styles.smallChipBtnActive]}
                        onPress={() => setPayMode(m)}
                      >
                        <Text
                          style={[styles.smallChipText, active && { color: '#FFFFFF' }]}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Statut</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {['Payé', 'En attente'].map((st) => {
                    const active = payStatut === st;
                    return (
                      <TouchableOpacity
                        key={st}
                        style={[
                          styles.statusToggleBtn,
                          active &&
                            (st === 'Payé'
                              ? { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }
                              : { backgroundColor: '#D97706', borderColor: '#D97706' }),
                        ]}
                        onPress={() => setPayStatut(st)}
                      >
                        <Text
                          style={[
                            styles.statusToggleText,
                            active && { color: '#FFFFFF' },
                          ]}
                        >
                          {st}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            <Text style={styles.inputLabel}>Note / Observation (Optionnel)</Text>
            <TextInput
              style={styles.input}
              value={payNote}
              onChangeText={setPayNote}
              placeholder=""
            />

            <TouchableOpacity
              style={styles.submitPaymentBtn}
              onPress={handleSaveIndividualPayment}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitPaymentBtnText}>
                {payEditId
                  ? 'Mettre à jour ce paiement'
                  : `Valider le paiement pour ${selectedEmploye.nom}`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Historique des Paiements de cet Employé / Gérant */}
          <View style={styles.historySectionCard}>
            <View style={styles.historyHeaderRow}>
              <Ionicons name="time-outline" size={19} color={COLORS.primaryDark} />
              <Text style={styles.historySectionTitle}>
                Historique des paiements de {selectedEmploye.nom} (
                {selectedEmploye.paiements.length})
              </Text>
            </View>

            {selectedEmploye.paiements.length === 0 ? (
              <View style={styles.emptyHistoryBox}>
                <Text style={styles.emptyHistoryTitle}>
                  Aucun versement individuel détaillé pour le moment.
                </Text>
                <Text style={styles.emptyHistorySub}>
                  Calcul forfaitaire actuel : {selectedEmploye.moisComplets} mois ×{' '}
                  {formatFCFA(selectedEmploye.salaireMensuel)} ={' '}
                  <Text style={{ fontWeight: '900', color: COLORS.secondary }}>
                    {formatFCFA(selectedEmploye.totalForfaitMois)}
                  </Text>
                </Text>
              </View>
            ) : (
              selectedEmploye.paiements.map((p) => {
                const isPaid = p.statut !== 'En attente';
                return (
                  <View key={p.id} style={styles.paymentHistoryRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.payHistoryPeriode}>{p.periode}</Text>
                        <View
                          style={[
                            styles.payTypeBadge,
                            p.type === 'Avance' && { backgroundColor: '#FEF3C7' },
                            p.type === 'Prime / Bonus' && { backgroundColor: '#DCFCE7' },
                          ]}
                        >
                          <Text style={styles.payTypeBadgeText}>{p.type}</Text>
                        </View>
                      </View>

                      <Text style={styles.payHistoryMeta}>
                        📅 {p.date} • 💳 {p.modePaiement}
                        {p.note ? ` • 📝 ${p.note}` : ''}
                      </Text>

                      <View style={styles.payRowActions}>
                        <TouchableOpacity
                          style={[
                            styles.payStatusPill,
                            { backgroundColor: isPaid ? '#DCFCE7' : '#FEF3C7' },
                          ]}
                          onPress={() => handleTogglePaymentStatus(p)}
                        >
                          <Ionicons
                            name={isPaid ? 'checkmark-circle' : 'time'}
                            size={13}
                            color={isPaid ? '#15803D' : '#B45309'}
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '800',
                              color: isPaid ? '#15803D' : '#B45309',
                            }}
                          >
                            {p.statut}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.payActionMiniBtn}
                          onPress={() => handleEditPaymentRow(p)}
                        >
                          <Ionicons name="create-outline" size={15} color={COLORS.primary} />
                          <Text style={styles.payActionMiniText}>Modifier</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.payActionMiniBtn}
                          onPress={() => handleShareEmployeeReceipt(selectedEmploye, p)}
                        >
                          <Ionicons name="share-outline" size={15} color={COLORS.secondary} />
                          <Text style={[styles.payActionMiniText, { color: COLORS.secondary }]}>
                            Reçu
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.payActionMiniBtn}
                          onPress={() => handleDeletePaymentRow(p)}
                        >
                          <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.payHistoryAmount,
                        { color: isPaid ? COLORS.secondary : '#D97706' },
                      ]}
                    >
                      {formatFCFA(p.montant)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      ) : (
        /* =====================================================================
           VUE 2 : LISTE GÉNÉRALE DES EMPLOYÉS & GÉRANTS
           ===================================================================== */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bannière Globale Salaires */}
          <View style={styles.heroSalaryCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>POULAILLER DE THIÈS • SALAIRES PAYÉS</Text>
              <Text style={styles.heroAmount}>{formatFCFA(s.totalSalaires)}</Text>
              <Text style={styles.heroSubCount}>
                {nbGerants} Gérant(s) • {nbEmployes} Employé(s)
              </Text>
            </View>
            <View style={{ gap: 6 }}>
              <TouchableOpacity
                style={styles.addEmpBtn}
                onPress={() => openEditModal(null, 'employe')}
              >
                <Ionicons name="person-add" size={16} color="#78350F" />
                <Text style={styles.addEmpBtnText}>+ Employé</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addEmpBtn, { backgroundColor: '#DCFCE7' }]}
                onPress={() => openEditModal(null, 'gerant')}
              >
                <Ionicons name="shield-checkmark" size={16} color="#14532D" />
                <Text style={[styles.addEmpBtnText, { color: '#14532D' }]}>+ Gérant</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtres : Tous | Gérants | Employés */}
          <View style={styles.filterTabsRow}>
            {[
              { key: 'all', label: `Tous (${employesList.length})` },
              { key: 'gerant', label: `Gérants (${nbGerants})` },
              { key: 'employe', label: `Employés (${nbEmployes})` },
            ].map((tab) => {
              const active = roleFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.filterTabBtn, active && styles.filterTabBtnActive]}
                  onPress={() => setRoleFilter(tab.key)}
                >
                  <Text style={[styles.filterTabText, active && { color: '#FFFFFF' }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {filteredEmployes.map((emp) => {
            const isGerant = emp.categorie === 'gerant';
            return (
              <TouchableOpacity
                key={emp.id}
                style={[
                  styles.empCard,
                  isGerant && { borderLeftWidth: 4, borderLeftColor: '#15803D' },
                ]}
                activeOpacity={0.88}
                onPress={() => openIndividualPaymentInterface(emp)}
              >
                <View style={styles.empHeader}>
                  <View
                    style={[
                      styles.empAvatar,
                      isGerant && { backgroundColor: '#DCFCE7' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.empAvatarLetter,
                        isGerant && { color: '#15803D' },
                      ]}
                    >
                      {emp.nom.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.empName}>{emp.nom}</Text>
                      <View
                        style={[
                          styles.smallRoleBadge,
                          { backgroundColor: isGerant ? '#DCFCE7' : '#E0F2FE' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.smallRoleBadgeText,
                            { color: isGerant ? '#15803D' : '#0284C7' },
                          ]}
                        >
                          {isGerant ? 'Gérant' : 'Employé'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.empPoste}>
                      {emp.poste || (isGerant ? 'Gérant du poulailler' : 'Employé')} • 📍{' '}
                      {emp.adresse || 'Thiès'}
                      {emp.telephone ? ` • 📞 ${emp.telephone}` : ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.iconOnlyBtn}
                    onPress={() => openEditModal(emp)}
                  >
                    <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconOnlyBtn}
                    onPress={() => handleDeleteEmploye(emp)}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>

                <View style={styles.empStatsGrid}>
                  <View style={styles.empStatCol}>
                    <Text style={styles.empStatLbl}>Salaire de base</Text>
                    <Text style={styles.empStatVal}>{formatFCFA(emp.salaireMensuel)}</Text>
                  </View>
                  <View style={styles.empStatCol}>
                    <Text style={styles.empStatLbl}>Suivi</Text>
                    <Text style={[styles.empStatVal, { color: COLORS.primary }]}>
                      {emp.nbPaiements > 0
                        ? `${emp.nbPaiements} paie(s)`
                        : `${emp.moisComplets} mois`}
                    </Text>
                  </View>
                  <View style={styles.empStatCol}>
                    <Text style={styles.empStatLbl}>Total Payé</Text>
                    <Text
                      style={[
                        styles.empStatVal,
                        { color: COLORS.secondary, fontWeight: '900' },
                      ]}
                    >
                      {formatFCFA(emp.totalPaye)}
                    </Text>
                  </View>
                </View>

                {/* Bouton d'accès direct à l'interface de paiement personnelle */}
                <View style={styles.openPayInterfaceBar}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="wallet-outline" size={16} color={COLORS.primaryDark} />
                    <Text style={styles.openPayInterfaceText}>
                      Ouvrir l’interface de paiement de {emp.nom}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color={COLORS.primaryDark} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* =====================================================================
          MODAL D'AJOUT / MODIFICATION D'UN EMPLOYÉ OU GÉRANT
         ===================================================================== */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>
                {editId
                  ? `Modifier ${nom}`
                  : categorie === 'gerant'
                  ? 'Ajouter un Gérant'
                  : 'Ajouter un Employé'}
              </Text>

              {/* Sélecteur Employé vs Gérant */}
              <Text style={styles.inputLabel}>Catégorie *</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
                {[
                  { key: 'employe', label: 'Employé', icon: 'person-outline' },
                  { key: 'gerant', label: 'Gérant', icon: 'shield-checkmark-outline' },
                ].map((opt) => {
                  const active = categorie === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.catSelectorBtn,
                        active &&
                          (opt.key === 'gerant'
                            ? { backgroundColor: '#15803D', borderColor: '#15803D' }
                            : { backgroundColor: COLORS.primary, borderColor: COLORS.primary }),
                      ]}
                      onPress={() => {
                        setCategorie(opt.key);
                        if (!editId) {
                          setPoste(opt.key === 'gerant' ? 'Gérant du poulailler' : '');
                        }
                      }}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={17}
                        color={active ? '#FFFFFF' : COLORS.textPrimary}
                      />
                      <Text
                        style={[
                          styles.catSelectorText,
                          active && { color: '#FFFFFF' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Import rapide depuis les comptes utilisateurs existants */}
              {!editId && appUsers.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.inputLabel}>
                    Ou sélectionner un compte inscrit :
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {appUsers.map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        style={styles.accountQuickChip}
                        onPress={() => handlePickExistingAccount(acc)}
                      >
                        <Ionicons
                          name="person-circle-outline"
                          size={15}
                          color={COLORS.primaryDark}
                        />
                        <Text style={styles.accountQuickChipText}>
                          {acc.nom} ({acc.role === 'gerant' ? 'Gérant' : 'Employé'})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.inputLabel}>Nom complet * (max 25 caractères)</Text>
              <TextInput
                style={styles.input}
                maxLength={25}
                value={nom}
                onChangeText={(txt) => setNom(txt.slice(0, 25))}
                placeholder="Saisir le nom"
              />

              <Text style={styles.inputLabel}>Fonction / Poste attribué *</Text>
              <TextInput
                style={styles.input}
                value={poste}
                onChangeText={setPoste}
                placeholder="Saisir la fonction de l'employé"
              />
              {categorie === 'employe' && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 6 }}
                >
                  {SUGGESTED_FUNCTIONS.map((fn) => {
                    const active = poste === fn;
                    return (
                      <TouchableOpacity
                        key={fn}
                        style={[styles.chipBtn, active && styles.chipBtnActive]}
                        onPress={() => setPoste(fn)}
                      >
                        <Text style={[styles.chipBtnText, active && { color: '#FFFFFF' }]}>
                          {fn}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Adresse (max 25)</Text>
                  <TextInput
                    style={styles.input}
                    maxLength={25}
                    value={adresse}
                    onChangeText={(txt) => setAdresse(txt.slice(0, 25))}
                    placeholder="Thiès"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Téléphone (9 chiffres)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="phone-pad"
                    maxLength={9}
                    value={telephone}
                    onChangeText={(txt) => setTelephone(txt.replace(/[^0-9]/g, '').slice(0, 9))}
                    placeholder="770000000"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>
                Salaire mensuel de référence (FCFA) *
              </Text>
              <TextInput
                style={[styles.input, { borderColor: COLORS.primary, borderWidth: 1.5 }]}
                keyboardType="numeric"
                value={salaireMensuel}
                onChangeText={setSalaireMensuel}
                placeholder=""
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

              <Text style={styles.inputLabel}>Nombre de mois forfaitaire (Optionnel)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={nbMoisManuel}
                onChangeText={setNbMoisManuel}
                placeholder={`Auto : ${calculateCompleteMonths(dateDebut, dateFin)} mois`}
              />

              <View style={styles.previewSalaryBox}>
                <Text style={styles.previewSalaryText}>
                  Forfait indicatif : {previewMonths} mois × {formatFCFA(salaireMensuel)} ={' '}
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 36 },
  heroSalaryCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  heroLabel: {
    color: '#FBBF24',
    fontSize: 10.5,
    fontWeight: '800',
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  heroSubCount: {
    color: '#FDE68A',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 3,
  },
  addEmpBtn: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  addEmpBtnText: {
    color: '#78350F',
    fontSize: 12,
    fontWeight: '900',
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#EFECE6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
    gap: 6,
  },
  filterTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  filterTabBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  helperBannerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  empCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  empHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  empAvatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
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
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  smallRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 7,
  },
  smallRoleBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
  },
  empPoste: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  iconOnlyBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  openPayInterfaceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  openPayInterfaceText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  // --- STYLES DE L'INTERFACE INDIVIDUELLE DE PAIEMENT ---
  indivTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backToListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 6,
  },
  backToListText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  indivConfigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 11,
    gap: 5,
  },
  indivConfigBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  indivShareBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indivHeroCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    ...SHADOWS.medium,
  },
  indivHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  indivAvatarLarge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indivAvatarLetter: {
    fontSize: 23,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  indivName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  rolePillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  rolePillBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  indivPoste: {
    color: '#FDE68A',
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  indivSubDate: {
    color: '#E7E5E4',
    fontSize: 11,
    marginTop: 2,
  },
  indivKpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  indivKpiBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 10,
  },
  indivKpiLbl: {
    color: '#FDE68A',
    fontSize: 9.5,
    fontWeight: '800',
  },
  indivKpiVal: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    marginTop: 3,
  },
  indivKpiHint: {
    color: '#D6D3D1',
    fontSize: 10,
    marginTop: 1,
  },
  paymentFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  formIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  formCardSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  chipBtn: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E7E0D3',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    marginRight: 6,
  },
  chipBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  chipBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  chipsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  smallChipBtn: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E7E0D3',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  smallChipBtnActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  smallChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  amountLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  fillRefSalaryLink: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  amountHighlightInput: {
    borderColor: COLORS.secondary,
    borderWidth: 1.5,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  statusToggleBtn: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E7E0D3',
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusToggleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  submitPaymentBtn: {
    backgroundColor: COLORS.secondary,
    height: 48,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    ...SHADOWS.small,
  },
  submitPaymentBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  historySectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  historySectionTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  emptyHistoryBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
  },
  emptyHistoryTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptyHistorySub: {
    fontSize: 12.5,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  paymentHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
    gap: 10,
  },
  payHistoryPeriode: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  payTypeBadge: {
    backgroundColor: '#F5EFE6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  payTypeBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  payHistoryMeta: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  payRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  payStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    gap: 4,
  },
  payActionMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  payActionMiniText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  payHistoryAmount: {
    fontSize: 15,
    fontWeight: '900',
  },
  // --- MODAL AJOUT / ÉDITION EMPLOYÉ OU GÉRANT ---
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  catSelectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#E7E0D3',
    backgroundColor: '#FAF7F2',
    gap: 6,
  },
  catSelectorText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  accountQuickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    marginRight: 6,
    gap: 5,
  },
  accountQuickChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
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
