import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout from '../components/NavigationLayout';
import { COLORS, SHADOWS, formatFCFA, formatNumber } from '../theme/colors';
import { getCachedUser, getCurrentUser } from '../services/authService';
import {
  getCachedWorkbook,
  getCachedSummary,
  loadFarmWorkbook,
  computeFarmSummary,
  updateOrderStatusByManager,
  updateClientOrder,
  deleteClientOrder,
  addFactureEntry,
  updateFactureEntry,
  deleteFactureEntry,
  toggleFacturePaymentStatus,
  signFactureEntry,
  updateBilanYellowBoxes,
  getNextSuggestedFactureNumber,
} from '../services/farmDataService';
import {
  numberToFrenchWords,
  formatInvoiceNumberPad,
  generateElectronicInvoiceHtml,
  printElectronicInvoice,
  downloadElectronicInvoicePdf,
} from '../utils/electronicInvoiceGenerator';
import { CACHET_IMAGE_DATA_URI, LOGO_IMAGE_DATA_URI } from '../utils/officialStampData';

// Pavé tactile de dessin de signature au doigt (sans dépendance native externe)
function SignaturePad({ paths = [], onChangePaths }) {
  const currentPointsRef = useRef([]);
  const [, setTick] = useState(0);

  const pointsToSvgPath = (pts) => {
    if (!pts || pts.length === 0) return '';
    return pts
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${Math.round(p.x)} ${Math.round(p.y)}`)
      .join(' ');
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPointsRef.current = [{ x: locationX, y: locationY }];
        setTick((t) => t + 1);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPointsRef.current.push({ x: locationX, y: locationY });
        setTick((t) => t + 1);
      },
      onPanResponderRelease: () => {
        const d = pointsToSvgPath(currentPointsRef.current);
        if (d) {
          onChangePaths([...paths, d]);
        }
        currentPointsRef.current = [];
        setTick((t) => t + 1);
      },
    })
  ).current;

  const parsePointsFromPath = (d) => {
    const tokens = String(d || '')
      .trim()
      .split(/\s+/);
    const pts = [];
    for (let i = 0; i < tokens.length; i += 3) {
      const x = Number(tokens[i + 1]);
      const y = Number(tokens[i + 2]);
      if (!isNaN(x) && !isNaN(y)) pts.push({ x, y });
    }
    return pts;
  };

  const allSegments = [];
  const allPaths = [
    ...paths.map(parsePointsFromPath),
    ...(currentPointsRef.current.length > 0 ? [currentPointsRef.current] : []),
  ];

  allPaths.forEach((pts, pIdx) => {
    for (let i = 1; i < pts.length; i++) {
      const p1 = pts[i - 1];
      const p2 = pts[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.max(2, Math.sqrt(dx * dx + dy * dy));
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      allSegments.push({
        key: `${pIdx}_${i}`,
        left: p1.x,
        top: p1.y,
        width: len,
        angle,
      });
    }
  });

  return (
    <View style={styles.sigPadContainer} {...panResponder.panHandlers}>
      {allSegments.length === 0 && (
        <Text style={styles.sigPadHint}>
          ✍️ Signez ici avec votre doigt
        </Text>
      )}
      {allSegments.map((seg) => (
        <View
          key={seg.key}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: seg.left,
            top: seg.top,
            width: seg.width,
            height: 2.8,
            backgroundColor: '#1D4ED8',
            borderRadius: 2,
            transformOrigin: '0% 50%',
            transform: [{ rotate: `${seg.angle}deg` }],
          }}
        />
      ))}
    </View>
  );
}

export default function CommandesScreen({ navigation }) {
  const initS = getCachedSummary();
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());
  const [summary, setSummary] = useState(() => initS);
  const [activeTab, setActiveTab] = useState('factures');
  const [factureFilter, setFactureFilter] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');

  const [defaultPriceInput, setDefaultPriceInput] = useState(() =>
    String(initS?.prixTabletteDefaut || 2200)
  );
  const [editingDefaultPrice, setEditingDefaultPrice] = useState(false);

  // Modale Facture Électronique (Création & Modification en cas d'erreur)
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFacture, setEditingFacture] = useState(null);
  const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
  const [numeroFacture, setNumeroFacture] = useState('');
  const [clientNom, setClientNom] = useState('');
  const [quantite, setQuantite] = useState('');
  const [designation, setDesignation] = useState('Tablettes');
  const [prixUnitaire, setPrixUnitaire] = useState(() =>
    String(initS?.prixTabletteDefaut || 2200)
  );
  const [statutFacture, setStatutFacture] = useState('Payé');
  const [cachetFacture, setCachetFacture] = useState(true);
  const [signatureGerant, setSignatureGerant] = useState(null);
  const [signataireGerantNom, setSignataireGerantNom] = useState('');
  const [signatureAdmin, setSignatureAdmin] = useState(null);
  const [signataireAdminNom, setSignataireAdminNom] = useState('');
  const [showSigPadRole, setShowSigPadRole] = useState(null); // 'gerant' | 'admin' | null
  const [tempSigPaths, setTempSigPaths] = useState([]);

  // Aperçu PDF plein écran de la Facture Électronique
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Modale Modification Commande Client en cas d'erreur
  const [orderEditModal, setOrderEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderClientNom, setOrderClientNom] = useState('');
  const [orderClientTel, setOrderClientTel] = useState('');
  const [orderQuantite, setOrderQuantite] = useState('');
  const [orderPrixUnitaire, setOrderPrixUnitaire] = useState('');
  const [orderAdresse, setOrderAdresse] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const loadData = async () => {
    const u = await getCurrentUser();
    if (!u || (u.role !== 'admin' && u.role !== 'gerant')) {
      Alert.alert('Accès Réservé', 'Page réservée au Gérant et à l’Administrateur.');
      navigation.replace('Dashboard');
      return;
    }
    setUser(u);
    const wb = await loadFarmWorkbook();
    setWorkbook(wb);
    const s = computeFarmSummary(wb);
    setSummary(s);
    const defPrice = String(s.prixTabletteDefaut || 2200);
    setDefaultPriceInput(defPrice);
    if (!editingFacture) {
      setPrixUnitaire(defPrice);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const handleSaveDefaultPrice = async () => {
    const newPrice = Number(defaultPriceInput) || 2200;
    const updated = await updateBilanYellowBoxes({ prixTabletteDefaut: newPrice });
    const nextS = computeFarmSummary(updated);
    setWorkbook(updated);
    setSummary(nextS);
    setPrixUnitaire(String(newPrice));
    setEditingDefaultPrice(false);
    Alert.alert('Tarif mis à jour', `Nouveau prix par défaut : ${formatFCFA(newPrice)} / tablette.`);
  };

  const handleOrderStatus = async (cmd, newStatut) => {
    const updated = await updateOrderStatusByManager(cmd.id, newStatut);
    if (updated?.insufficientStock) {
      Alert.alert(
        'Stock insuffisant',
        `Cette commande demande ${cmd.quantiteTablettes} tablettes mais il n’y a que ${updated.availableStock} tablettes en stock.`
      );
      return;
    }
    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
  };

  const openOrderEditModal = (cmd) => {
    setEditingOrder(cmd);
    setOrderClientNom(cmd.clientNom || '');
    setOrderClientTel(cmd.clientTelephone || '');
    setOrderQuantite(String(cmd.quantiteTablettes || ''));
    setOrderPrixUnitaire(String(cmd.prixUnitaire || s.prixTabletteDefaut || 2200));
    setOrderAdresse(cmd.adresseLivraison || 'Thiès');
    setOrderNote(cmd.note || '');
    setOrderEditModal(true);
  };

  const handleSaveOrderEdit = async () => {
    if (!editingOrder) return;
    const qte = Number(orderQuantite) || 0;
    if (!orderClientNom.trim() || qte <= 0) {
      Alert.alert('Champs requis', 'Veuillez renseigner le client et une quantité valide.');
      return;
    }
    const updated = await updateClientOrder({
      id: editingOrder.id,
      clientNom: orderClientNom.trim(),
      clientTelephone: orderClientTel.trim(),
      quantiteTablettes: qte,
      prixUnitaire: Number(orderPrixUnitaire) || s.prixTabletteDefaut || 2200,
      adresseLivraison: orderAdresse.trim() || 'Thiès',
      note: orderNote.trim(),
    });
    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setOrderEditModal(false);
    setEditingOrder(null);
    Alert.alert('Modifié', 'La commande a été mise à jour avec succès.');
  };

  const openNewFactureModal = () => {
    setEditingFacture(null);
    setDateFacture(new Date().toISOString().split('T')[0]);
    setNumeroFacture(formatInvoiceNumberPad(getNextSuggestedFactureNumber(workbook)));
    setClientNom('');
    setQuantite('');
    setDesignation('Tablettes');
    setPrixUnitaire(String(s.prixTabletteDefaut || 2200));
    setStatutFacture('Payé');
    setCachetFacture(true);
    if (user?.role === 'gerant') {
      setSignataireGerantNom(user?.nom || 'COLY');
      setSignatureGerant(null);
      setSignataireAdminNom('');
      setSignatureAdmin(null);
    } else if (user?.role === 'admin') {
      setSignataireAdminNom(user?.nom || 'Administrateur');
      setSignatureAdmin(null);
      setSignataireGerantNom('');
      setSignatureGerant(null);
    }
    setShowSigPadRole(null);
    setTempSigPaths([]);
    setModalVisible(true);
  };

  const openEditFactureModal = (facture) => {
    setEditingFacture(facture);
    setDateFacture(facture.date || new Date().toISOString().split('T')[0]);
    setNumeroFacture(formatInvoiceNumberPad(facture.numeroFacture || '01'));
    setClientNom(facture.client || '');
    setQuantite(String(facture.quantite || ''));
    setDesignation(facture.designation || 'Tablettes');
    setPrixUnitaire(String(facture.prixUnitaire || s.prixTabletteDefaut || 2200));
    setStatutFacture(facture.statut === 'Non Payé' ? 'Non Payé' : 'Payé');
    setCachetFacture(facture.cachet !== false);
    setSignatureGerant(facture.signatureGerant || null);
    setSignataireGerantNom(facture.signataireGerantNom || '');
    setSignatureAdmin(facture.signatureAdmin || null);
    setSignataireAdminNom(facture.signataireAdminNom || '');
    setShowSigPadRole(null);
    setTempSigPaths([]);
    setModalVisible(true);
  };

  const handleApplySignature = (role) => {
    const defaultName =
      role === 'admin'
        ? user?.role === 'admin'
          ? user?.nom || 'Administrateur'
          : 'Administrateur'
        : user?.role === 'gerant'
        ? user?.nom || 'COLY'
        : 'COLY (Gérant)';

    const sigObj = tempSigPaths.length > 0 ? { paths: tempSigPaths } : { paths: [] };
    if (role === 'admin') {
      setSignatureAdmin(sigObj);
      if (!signataireAdminNom) setSignataireAdminNom(defaultName);
    } else {
      setSignatureGerant(sigObj);
      if (!signataireGerantNom) setSignataireGerantNom(defaultName);
    }
    setShowSigPadRole(null);
    setTempSigPaths([]);
  };

  const handleQuickSignCard = async (facture) => {
    const role = user?.role === 'admin' ? 'admin' : 'gerant';
    const signerName =
      user?.nom || (role === 'admin' ? 'Administrateur' : 'COLY (Gérant)');
    const updated = await signFactureEntry({
      id: facture.id,
      role,
      signerName,
      signatureData:
        role === 'admin' ? facture.signatureAdmin || { paths: [] } : facture.signatureGerant || { paths: [] },
      cachet: true,
    });
    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    Alert.alert(
      'Facture signée & cachetée ✅',
      `Signature (${signerName}) et cachet officiel TERA AGRO - SUARL apposés sur la Facture N° ${formatInvoiceNumberPad(
        facture.numeroFacture
      )}.`
    );
  };

  const handleSaveFacture = async () => {
    const qte = Number(quantite) || 0;
    const pu = Number(prixUnitaire) || s.prixTabletteDefaut || 2200;
    const cleanDate = (dateFacture || new Date().toISOString().split('T')[0]).trim();
    const cleanNum = numeroFacture.trim();
    const cleanDesig = (designation || 'Tablettes').trim() || 'Tablettes';
    const totalCalc = qte * pu;
    const sommeLettres = numberToFrenchWords(totalCalc);

    if (!clientNom.trim() || qte <= 0) {
      Alert.alert('Champs requis', 'Veuillez saisir le nom du client et la quantité de tablettes.');
      return;
    }

    if (editingFacture) {
      const updated = await updateFactureEntry({
        id: editingFacture.id,
        date: cleanDate,
        numeroFacture: cleanNum || editingFacture.numeroFacture,
        quantite: qte,
        designation: cleanDesig,
        prixUnitaire: pu,
        client: clientNom.trim(),
        statut: statutFacture,
        cachet: cachetFacture,
        signatureGerant,
        signataireGerantNom: signataireGerantNom.trim(),
        signatureAdmin,
        signataireAdminNom: signataireAdminNom.trim(),
        sommeEnLettres: sommeLettres,
      });

      if (updated?.duplicateInvoiceNumberForDate) {
        Alert.alert(
          'Numéro déjà utilisé à cette date',
          `La facture N° ${cleanNum} existe déjà pour la date ${cleanDate} (${updated.existingInvoice?.client}).\n\nDeux factures peuvent avoir le même numéro uniquement si leurs dates sont différentes.`
        );
        return;
      }

      if (updated?.insufficientStock) {
        Alert.alert(
          'Stock insuffisant',
          `Impossible d’appliquer cette quantité (${qte} tab.) : le stock disponible maximal est de ${updated.availableStock} tablettes.`
        );
        return;
      }

      setWorkbook(updated);
      setSummary(computeFarmSummary(updated));
      setModalVisible(false);
      setEditingFacture(null);
      Alert.alert(
        'Facture électronique mise à jour ✅',
        `Facture N° ${formatInvoiceNumberPad(cleanNum || editingFacture.numeroFacture)} enregistrée.`
      );
      return;
    }

    const updated = await addFactureEntry({
      date: cleanDate,
      numeroFacture: cleanNum || formatInvoiceNumberPad(getNextSuggestedFactureNumber(workbook)),
      quantite: qte,
      designation: cleanDesig,
      prixUnitaire: pu,
      client: clientNom.trim(),
      statut: statutFacture,
      cachet: cachetFacture,
      signatureGerant,
      signataireGerantNom: signataireGerantNom.trim(),
      signatureAdmin,
      signataireAdminNom: signataireAdminNom.trim(),
      sommeEnLettres: sommeLettres,
      deductStock: true,
      auteur: user?.nom || user?.role || '',
    });

    if (updated?.duplicateInvoiceNumberForDate) {
      Alert.alert(
        'Numéro déjà utilisé à cette date',
        `La facture N° ${cleanNum} existe déjà pour la date ${cleanDate} (${updated.existingInvoice?.client}).\n\nDeux factures peuvent avoir le même numéro uniquement si leurs dates sont différentes.`
      );
      return;
    }

    if (updated?.insufficientStock) {
      Alert.alert(
        'Stock insuffisant',
        `Impossible de facturer ${qte} tablettes : il ne reste que ${updated.availableStock} tablettes en stock.`
      );
      return;
    }

    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setModalVisible(false);
    setClientNom('');
    setQuantite('');
    setNumeroFacture('');
  };

  const handleDeleteFacture = (facture) => {
    Alert.alert(
      'Supprimer cette facture ?',
      `Facture N° ${formatInvoiceNumberPad(facture.numeroFacture)} • ${facture.client}\nDate : ${facture.date}\nMontant : ${formatFCFA(facture.total)}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteFactureEntry(facture.id, true);
            setWorkbook(updated);
            setSummary(computeFarmSummary(updated));
            if (editingFacture?.id === facture.id) {
              setModalVisible(false);
              setEditingFacture(null);
            }
          },
        },
      ]
    );
  };

  const handleToggleFacture = async (facture) => {
    const updated = await toggleFacturePaymentStatus(facture.id);
    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
  };

  const s = summary || {};
  const commandesList = workbook?.commandes || [];
  const allFactures = workbook?.factures || [];
  const cleanSearch = searchQuery.trim().toLowerCase();
  const filteredFactures = allFactures.filter((f) => {
    if (factureFilter !== 'tous' && f.statut !== factureFilter) return false;
    if (!cleanSearch) return true;
    const matchClient = String(f.client || '').toLowerCase().includes(cleanSearch);
    const matchNum = String(f.numeroFacture || '').toLowerCase().includes(cleanSearch);
    const matchDate = String(f.date || '').toLowerCase().includes(cleanSearch);
    return matchClient || matchNum || matchDate;
  });

  // Calcul instantané en temps réel dès la saisie de la quantité ou du prix unitaire
  const liveFactureTotal = (Number(quantite) || 0) * (Number(prixUnitaire) || 0);
  const liveSommeEnLettres = numberToFrenchWords(liveFactureTotal);

  return (
    <NavigationLayout
      user={user}
      activeTab="Commandes"
      title="Factures & Commandes"
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'factures' && styles.tabBtnActive]}
            onPress={() => setActiveTab('factures')}
          >
            <Ionicons
              name="receipt"
              size={17}
              color={activeTab === 'factures' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'factures' && { color: '#FFFFFF' }]}>
              Factures Électroniques ({allFactures.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'commandes' && styles.tabBtnActive]}
            onPress={() => setActiveTab('commandes')}
          >
            <Ionicons
              name="bag-check"
              size={17}
              color={activeTab === 'commandes' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'commandes' && { color: '#FFFFFF' }]}>
              Commandes ({commandesList.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryHero}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>VENTES PAYÉES</Text>
            <Text style={[styles.summaryVal, { color: '#86EFAC' }]}>
              {formatFCFA(s.totalVentesPayees)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>LIVRÉ NON PAYÉ</Text>
            <Text style={[styles.summaryVal, { color: '#FDE047' }]}>
              {formatFCFA(s.totalVentesNonPayees)}
            </Text>
          </View>
        </View>

        {/* Bandeau de modification rapide du prix de la tablette */}
        <View style={styles.priceConfigBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Ionicons name="pricetag" size={18} color="#92400E" />
            <Text style={styles.priceConfigLabel}>
              Prix Unitaire Tablette :{' '}
              <Text style={{ fontWeight: '900' }}>{formatFCFA(s.prixTabletteDefaut || 2200)}</Text>
            </Text>
          </View>
          {editingDefaultPrice ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TextInput
                style={styles.priceQuickInput}
                keyboardType="numeric"
                value={defaultPriceInput}
                onChangeText={setDefaultPriceInput}
              />
              <TouchableOpacity style={styles.priceSaveBtn} onPress={handleSaveDefaultPrice}>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.priceEditPill}
              onPress={() => setEditingDefaultPrice(true)}
            >
              <Ionicons name="create-outline" size={15} color="#78350F" />
              <Text style={styles.priceEditPillText}>Changer le prix</Text>
            </TouchableOpacity>
          )}
        </View>

        {activeTab === 'commandes' ? (
          <>
            {commandesList.length === 0 ? (
              <View style={styles.orderCard}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '800',
                    color: COLORS.textSecondary,
                    paddingVertical: 12,
                  }}
                >
                  Aucune commande en cours
                </Text>
              </View>
            ) : (
              commandesList.map((cmd) => {
                const isPending = cmd.statut === 'En attente';
                const isConfirmed = cmd.statut === 'Confirmée';
                const isPaid = cmd.statut === 'Livrée & Payée';
                return (
                  <View key={cmd.id} style={styles.orderCard}>
                    <View style={styles.orderTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderNum}>
                          {cmd.numeroCommande} • {cmd.clientNom}
                        </Text>
                        <Text style={styles.orderMeta}>
                          📞 {cmd.clientTelephone} • {cmd.date}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isPending && { backgroundColor: '#FEF3C7' },
                          isConfirmed && { backgroundColor: '#E0F2FE' },
                          isPaid && { backgroundColor: '#DCFCE7' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isPending && { color: '#B45309' },
                            isConfirmed && { color: '#0284C7' },
                            isPaid && { color: '#15803D' },
                          ]}
                        >
                          {cmd.statut}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderDetailsBox}>
                      <Text style={styles.orderQtyText}>
                        🥚 <Text style={{ fontWeight: '900' }}>{cmd.quantiteTablettes} tab.</Text> ×{' '}
                        {formatFCFA(cmd.prixUnitaire)} ={' '}
                        <Text style={{ fontWeight: '900', color: COLORS.primary }}>
                          {formatFCFA(cmd.total)}
                        </Text>
                      </Text>
                      <Text style={styles.orderAddress}>
                        📍 {cmd.modeReception} : {cmd.adresseLivraison}
                      </Text>
                      {cmd.note ? <Text style={styles.orderNote}>💬 "{cmd.note}"</Text> : null}
                    </View>

                    <View style={styles.orderActionsRow}>
                      {cmd.statut === 'En attente' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: '#0284C7' }]}
                          onPress={() => handleOrderStatus(cmd, 'Confirmée')}
                        >
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Confirmer</Text>
                        </TouchableOpacity>
                      )}

                      {!cmd.factureGeneree && cmd.statut !== 'Annulée' && (
                        <>
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: COLORS.secondary }]}
                            onPress={() => handleOrderStatus(cmd, 'Livrée & Payée')}
                          >
                            <Ionicons name="cash" size={16} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>Payée</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#D97706' }]}
                            onPress={() => handleOrderStatus(cmd, 'Livrée (Non Payé)')}
                          >
                            <Ionicons name="time" size={16} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>Livré Non Payé</Text>
                          </TouchableOpacity>
                        </>
                      )}

                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#FEF3C7' }]}
                        onPress={() => openOrderEditModal(cmd)}
                      >
                        <Ionicons name="create-outline" size={16} color="#78350F" />
                        <Text style={[styles.actionBtnText, { color: '#78350F' }]}>Modifier</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                        onPress={async () => {
                          const next = await deleteClientOrder(cmd.id);
                          setWorkbook(next);
                          setSummary(computeFarmSummary(next));
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                        <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            <View style={styles.factureTopControls}>
              <View style={styles.filterPills}>
                {['tous', 'Payé', 'Non Payé'].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterPill, factureFilter === f && styles.filterPillActive]}
                    onPress={() => setFactureFilter(f)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        factureFilter === f && { color: '#FFFFFF' },
                      ]}
                    >
                      {f === 'tous' ? 'Toutes' : f === 'Non Payé' ? 'Livré Non Payé' : 'Payé'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.newFactureBtn}
                onPress={openNewFactureModal}
              >
                <Ionicons name="document-text" size={17} color="#FFFFFF" />
                <Text style={styles.newFactureBtnText}>+ Facture Électronique</Text>
              </TouchableOpacity>
            </View>

            {/* Barre de recherche rapide par N° Facture, Client ou Date */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={17} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher par N° facture, client ou date..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {filteredFactures.map((f) => {
              const isPaye = f.statut === 'Payé';
              const isSigned =
                Boolean(f.signataireGerantNom || f.signatureGerant) ||
                Boolean(f.signataireAdminNom || f.signatureAdmin);

              return (
                <View key={f.id} style={styles.factureCard}>
                  <TouchableOpacity
                    style={{ flex: 1, paddingRight: 8 }}
                    activeOpacity={0.75}
                    onPress={() => setPreviewInvoice(f)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text style={styles.factureNumBadge}>
                        FACTURE N° {formatInvoiceNumberPad(f.numeroFacture)}
                      </Text>
                      <Text style={styles.factureClient}>{f.client}</Text>
                    </View>
                    <Text style={styles.factureDetail}>
                      📅 {f.date} • {formatNumber(f.quantite)} {f.designation || 'Tablettes'} ×{' '}
                      {formatFCFA(f.prixUnitaire)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <Text style={styles.factureTotal}>{formatFCFA(f.total)}</Text>
                      <View style={styles.cachetMiniPill}>
                        <Ionicons name="ribbon" size={12} color="#1D4ED8" />
                        <Text style={styles.cachetMiniPillText}>
                          {isSigned ? 'Cachetée & Signée' : 'Cachet TERA AGRO'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.factureActionsRight}>
                    {/* Tampon bleu PAYÉ / LIVRÉ NON PAYÉ cliquable */}
                    <TouchableOpacity
                      style={[
                        styles.blueStampBadge,
                        isPaye ? styles.blueStampPaye : styles.blueStampNonPaye,
                      ]}
                      onPress={() => handleToggleFacture(f)}
                    >
                      <Text style={styles.blueStampText}>
                        {isPaye ? 'PAYÉ' : 'LIVRÉ NON PAYÉ'}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.factureEditDeleteRow}>
                      <TouchableOpacity
                        style={styles.iconPreviewBtn}
                        onPress={() => setPreviewInvoice(f)}
                      >
                        <Ionicons name="eye-outline" size={15} color="#1D4ED8" />
                        <Text style={styles.iconPreviewBtnText}>Voir / PDF</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconSignBtn}
                        onPress={() => handleQuickSignCard(f)}
                      >
                        <Ionicons name="pencil" size={14} color="#15803D" />
                        <Text style={styles.iconSignBtnText}>Signer</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconEditBtn}
                        onPress={() => openEditFactureModal(f)}
                      >
                        <Ionicons name="create-outline" size={15} color="#78350F" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconDeleteBtn}
                        onPress={() => handleDeleteFacture(f)}
                      >
                        <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* MODALE DE SAISIE & MODIFICATION DE FACTURE ÉLECTRONIQUE (MODÈLE OFFICIEL TERA AGRO - SUARL) */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollInner}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.electronicSheetCard}>
              {/* Barre supérieure de fermeture */}
              <View style={styles.sheetTopBar}>
                <Text style={styles.sheetTopBarTitle}>
                  {editingFacture ? 'Modifier la Facture Électronique' : 'Saisie Facture Électronique'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setEditingFacture(null);
                  }}
                >
                  <Ionicons name="close-circle" size={26} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* EN-TÊTE OFFICIEL AU DESIGN DE L'APPLICATION */}
              <View style={styles.officialHeaderBox}>
                <View style={styles.officialLogoBadge}>
                  <Image
                    source={{ uri: LOGO_IMAGE_DATA_URI }}
                    style={styles.officialInvoiceLogo}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.officialHeaderTextCol}>
                  <Text style={styles.officialCompanyName}>TERA AGRO - SUARL</Text>
                  <View style={styles.officialBadgeRow}>
                    <View style={styles.officialPoulaillerPill}>
                      <Text style={styles.officialPoulaillerPillText}>POULAILLER</Text>
                    </View>
                    <View style={styles.officialNineaPill}>
                      <Text style={styles.officialNineaPillText}>NINEA : 013274551</Text>
                    </View>
                  </View>
                  <Text style={styles.officialAddress}>
                    📍 Keur Issa Thiès • 📞 +221 77 977 42 42
                  </Text>
                </View>
              </View>

              {/* LIGNE FACTURE N° & DATE */}
              <View style={styles.invoiceMetaRow}>
                <View style={styles.invoiceNumWrap}>
                  <Text style={styles.invoiceNumLabel}>FACTURE N°</Text>
                  <View style={styles.invoiceNumControlBox}>
                    <TouchableOpacity
                      style={styles.invoiceNumStepBtn}
                      onPress={() => {
                        const cur = parseInt(String(numeroFacture || '1').replace(/[^0-9]/g, ''), 10) || 1;
                        const next = Math.max(1, cur - 1);
                        setNumeroFacture(formatInvoiceNumberPad(next));
                      }}
                    >
                      <Ionicons name="remove" size={15} color={COLORS.primaryDark} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.invoiceNumInput}
                      value={numeroFacture}
                      onChangeText={setNumeroFacture}
                      keyboardType="numeric"
                      placeholder={formatInvoiceNumberPad(getNextSuggestedFactureNumber(workbook))}
                      placeholderTextColor={COLORS.textMuted}
                    />
                    <TouchableOpacity
                      style={styles.invoiceNumStepBtn}
                      onPress={() => {
                        const cur = parseInt(String(numeroFacture || '0').replace(/[^0-9]/g, ''), 10) || 0;
                        const next = cur + 1;
                        setNumeroFacture(formatInvoiceNumberPad(next));
                      }}
                    >
                      <Ionicons name="add" size={15} color={COLORS.primaryDark} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.invoiceDateWrap}>
                  <Text style={styles.invoiceDateLabel}>Date</Text>
                  <TextInput
                    style={styles.invoiceDateInput}
                    value={dateFacture}
                    onChangeText={setDateFacture}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              {/* CARTE CLIENT */}
              <View style={styles.invoiceClientRow}>
                <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.invoiceClientLabel}>Client :</Text>
                <TextInput
                  style={styles.invoiceClientInput}
                  value={clientNom}
                  onChangeText={setClientNom}
                  placeholder="Nom et prénom du client..."
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              {/* TABLEAU MODERNE : QUANTITÉ | DÉSIGNATION | PRIX UNIT. | PRIX TOTAL */}
              <View style={styles.invoiceTableOuter}>
                <View style={styles.invoiceTableHeader}>
                  <Text style={[styles.invoiceTh, { flex: 1 }]} numberOfLines={1}>
                    QUANTITÉ
                  </Text>
                  <Text style={[styles.invoiceTh, { flex: 1.7 }]} numberOfLines={1}>
                    DÉSIGNATION
                  </Text>
                  <Text style={[styles.invoiceTh, { flex: 1.2 }]} numberOfLines={1}>
                    PRIX UNIT.
                  </Text>
                  <Text
                    style={[styles.invoiceTh, { flex: 1.6, borderRightWidth: 0 }]}
                    numberOfLines={1}
                  >
                    PRIX TOTAL
                  </Text>
                </View>

                {/* Ligne de saisie directe avec calcul instantané du PRIX TOTAL sur 1 seule ligne */}
                <View style={styles.invoiceTableRowInput}>
                  <View style={[styles.invoiceTdCell, { flex: 1 }]}>
                    <TextInput
                      style={styles.invoiceCellInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={COLORS.textMuted}
                      value={quantite}
                      onChangeText={setQuantite}
                    />
                  </View>

                  <View style={[styles.invoiceTdCell, { flex: 1.7 }]}>
                    <TextInput
                      style={styles.invoiceCellInput}
                      value={designation}
                      onChangeText={setDesignation}
                      placeholder="Tablettes"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View style={[styles.invoiceTdCell, { flex: 1.2 }]}>
                    <TextInput
                      style={styles.invoiceCellInput}
                      keyboardType="numeric"
                      value={prixUnitaire}
                      onChangeText={setPrixUnitaire}
                      placeholder="2200"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View
                    style={[
                      styles.invoiceTdCell,
                      { flex: 1.6, borderRightWidth: 0, backgroundColor: '#DCFCE7' },
                    ]}
                  >
                    <Text
                      style={styles.invoiceLiveTotalCellText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {formatNumber(liveFactureTotal)} F
                    </Text>
                  </View>
                </View>

                {/* ZONE STATUT (PAYÉ / LIVRÉ NON PAYÉ), CACHET ROND OFFICIEL & SIGNATURES */}
                <View style={styles.invoiceBodyCanvas}>
                  {/* Sélecteur de Tampon Statut : PAYE ou LIVRE NON PAYE */}
                  <View style={styles.stampChoiceRow}>
                    <TouchableOpacity
                      style={[
                        styles.stampChoiceBtn,
                        statutFacture === 'Payé' && styles.stampChoiceBtnActive,
                      ]}
                      onPress={() => setStatutFacture('Payé')}
                    >
                      <View style={{ alignItems: 'center', transform: [{ rotate: '-10deg' }] }}>
                        <View
                          style={{
                            width: 44,
                            height: 2.5,
                            backgroundColor: '#1D4ED8',
                            marginBottom: 2,
                          }}
                        />
                        <Text style={styles.stampPayeVisual}>PAYE</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.stampChoiceBtn,
                        statutFacture === 'Non Payé' && styles.stampChoiceBtnActive,
                      ]}
                      onPress={() => setStatutFacture('Non Payé')}
                    >
                      <View style={styles.stampNonPayeVisualBox}>
                        <Text style={styles.stampNonPayeVisualText}>LIVRE NON PAYE</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Cachet Rond Officiel TERA AGRO-SUARL + Signatures Admin & Gérant */}
                  <View style={styles.stampsAndSignaturesArea}>
                    {/* Signature Gérant */}
                    <View style={styles.sigColumnBox}>
                      <Text style={styles.sigColumnRoleTitle}>Signature Gérant</Text>
                      {signataireGerantNom || signatureGerant ? (
                        <View style={styles.sigPreviewPill}>
                          <Text style={styles.sigCursiveText}>
                            {signataireGerantNom || 'COLY'}
                          </Text>
                          {signatureGerant?.paths?.length > 0 && (
                            <Text style={styles.sigDrawnBadge}>✓ Signature tracée</Text>
                          )}
                        </View>
                      ) : (
                        <Text style={styles.sigEmptyText}>Non signée</Text>
                      )}
                      <TouchableOpacity
                        style={styles.sigOpenPadBtn}
                        onPress={() => {
                          setShowSigPadRole(showSigPadRole === 'gerant' ? null : 'gerant');
                          setTempSigPaths(signatureGerant?.paths || []);
                          if (!signataireGerantNom) {
                            setSignataireGerantNom(
                              user?.role === 'gerant' ? user?.nom || 'COLY' : 'COLY'
                            );
                          }
                        }}
                      >
                        <Ionicons name="pencil" size={13} color="#1D4ED8" />
                        <Text style={styles.sigOpenPadBtnText}>Signer (Gérant)</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Cachet Rond Bleu Officiel TERA AGRO-SUARL identique à l'original */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setCachetFacture(!cachetFacture)}
                      style={[
                        styles.roundOfficialCachetWrap,
                        !cachetFacture && { opacity: 0.25 },
                      ]}
                    >
                      <Image
                        source={{ uri: CACHET_IMAGE_DATA_URI }}
                        style={styles.roundOfficialCachetImg}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    {/* Signature Administrateur */}
                    <View style={styles.sigColumnBox}>
                      <Text style={styles.sigColumnRoleTitle}>Signature Admin</Text>
                      {signataireAdminNom || signatureAdmin ? (
                        <View style={styles.sigPreviewPill}>
                          <Text style={styles.sigCursiveText}>
                            {signataireAdminNom || 'Admin'}
                          </Text>
                          {signatureAdmin?.paths?.length > 0 && (
                            <Text style={styles.sigDrawnBadge}>✓ Signature tracée</Text>
                          )}
                        </View>
                      ) : (
                        <Text style={styles.sigEmptyText}>Non signée</Text>
                      )}
                      <TouchableOpacity
                        style={styles.sigOpenPadBtn}
                        onPress={() => {
                          setShowSigPadRole(showSigPadRole === 'admin' ? null : 'admin');
                          setTempSigPaths(signatureAdmin?.paths || []);
                          if (!signataireAdminNom) {
                            setSignataireAdminNom(
                              user?.role === 'admin' ? user?.nom || 'Administrateur' : 'Administrateur'
                            );
                          }
                        }}
                      >
                        <Ionicons name="pencil" size={13} color="#1D4ED8" />
                        <Text style={styles.sigOpenPadBtnText}>Signer (Admin)</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Pavé tactile de dessin de signature (si ouvert pour Gérant ou Admin) */}
                  {showSigPadRole && (
                    <View style={styles.sigDrawerBox}>
                      <View style={styles.sigDrawerHeader}>
                        <Text style={styles.sigDrawerTitle}>
                          ✍️ Signature {showSigPadRole === 'admin' ? 'Administrateur' : 'Gérant'}
                        </Text>
                        <TouchableOpacity onPress={() => setTempSigPaths([])}>
                          <Text style={styles.sigClearText}>Effacer</Text>
                        </TouchableOpacity>
                      </View>

                      <TextInput
                        style={styles.sigSignerNameInput}
                        placeholder="Nom du signataire"
                        value={
                          showSigPadRole === 'admin' ? signataireAdminNom : signataireGerantNom
                        }
                        onChangeText={
                          showSigPadRole === 'admin'
                            ? setSignataireAdminNom
                            : setSignataireGerantNom
                        }
                      />

                      <SignaturePad paths={tempSigPaths} onChangePaths={setTempSigPaths} />

                      <TouchableOpacity
                        style={styles.sigConfirmBtn}
                        onPress={() => handleApplySignature(showSigPadRole)}
                      >
                        <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" />
                        <Text style={styles.sigConfirmBtnText}>Valider la signature</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* LIGNE TOTAL EN BAS DU TABLEAU */}
                <View style={styles.invoiceTableFooterTotal}>
                  <Text style={styles.invoiceTotalLabel}>TOTAL</Text>
                  <Text style={styles.invoiceTotalValue}>
                    {formatNumber(liveFactureTotal)} F
                  </Text>
                </View>
              </View>

              {/* ARRÊTÉE LA PRÉSENTE FACTURE À LA SOMME DE : (en lettres automatique) */}
              <View style={styles.arreteSommeBox}>
                <Text style={styles.arreteSommeLabel}>
                  Arrêtée la présente facture à la somme de :{' '}
                </Text>
                <Text style={styles.arreteSommeValue}>
                  {liveSommeEnLettres} francs CFA
                </Text>
              </View>

              {/* BOUTONS D'ENREGISTREMENT */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#78716C' }]}
                  onPress={() => {
                    setModalVisible(false);
                    setEditingFacture(null);
                  }}
                >
                  <Text style={styles.modalBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.secondary, flex: 1.5 }]}
                  onPress={handleSaveFacture}
                >
                  <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.modalBtnText}>
                    {editingFacture ? 'Enregistrer les modifications' : 'Valider la Facture'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODALE D'APERÇU PLEIN ÉCRAN & TÉLÉCHARGEMENT PDF DE LA FACTURE ÉLECTRONIQUE */}
      <Modal
        visible={!!previewInvoice}
        animationType="slide"
        onRequestClose={() => setPreviewInvoice(null)}
      >
        <View style={styles.previewModalContainer}>
          <View style={styles.previewModalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewModalTitle}>
                Facture N° {formatInvoiceNumberPad(previewInvoice?.numeroFacture)}
              </Text>
              <Text style={styles.previewModalSub} numberOfLines={1}>
                TERA AGRO - SUARL • {previewInvoice?.client}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.previewTopBtnGreen}
              disabled={downloadingPdf}
              onPress={async () => {
                if (!previewInvoice) return;
                setDownloadingPdf(true);
                try {
                  await downloadElectronicInvoicePdf(previewInvoice);
                } finally {
                  setDownloadingPdf(false);
                }
              }}
            >
              {downloadingPdf ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.previewTopBtnText}>PDF</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.previewTopBtnBlue}
              onPress={async () => {
                if (previewInvoice) await printElectronicInvoice(previewInvoice);
              }}
            >
              <Ionicons name="print-outline" size={16} color="#FFFFFF" />
              <Text style={styles.previewTopBtnText}>Imprimer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.previewTopBtnEdit}
              onPress={() => {
                const target = previewInvoice;
                setPreviewInvoice(null);
                if (target) openEditFactureModal(target);
              }}
            >
              <Ionicons name="create-outline" size={18} color="#78350F" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.previewTopBtnClose}
              onPress={() => setPreviewInvoice(null)}
            >
              <Ionicons name="close" size={22} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>

          {previewInvoice &&
            (Platform.OS === 'web' ? (
              React.createElement('iframe', {
                srcDoc: generateElectronicInvoiceHtml(previewInvoice, { showToolbar: true }),
                style: { flex: 1, width: '100%', height: '100%', border: 'none', backgroundColor: '#E7E0D3' },
              })
            ) : (
              <WebView
                originWhitelist={['*']}
                source={{
                  html: generateElectronicInvoiceHtml(previewInvoice, { showToolbar: true }),
                }}
                onMessage={async (event) => {
                  const msg = String(event?.nativeEvent?.data || '');
                  if (msg === 'DOWNLOAD_INVOICE_PDF') {
                    await downloadElectronicInvoicePdf(previewInvoice);
                  } else if (msg === 'PRINT_INVOICE_PDF') {
                    await printElectronicInvoice(previewInvoice);
                  }
                }}
                javaScriptEnabled={true}
                style={{ flex: 1, backgroundColor: '#E7E0D3' }}
              />
            ))}
        </View>
      </Modal>

      {/* Modale Modification de Commande Client */}
      <Modal visible={orderEditModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollInner}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Modifier la Commande</Text>
                <TouchableOpacity onPress={() => setOrderEditModal(false)}>
                  <Ionicons name="close-circle" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nom du Client * (max 25 caractères)</Text>
              <TextInput
                style={styles.input}
                maxLength={25}
                value={orderClientNom}
                onChangeText={(txt) => setOrderClientNom(txt.slice(0, 25))}
              />

              <Text style={styles.label}>Téléphone (9 chiffres)</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={9}
                value={orderClientTel}
                onChangeText={(txt) => setOrderClientTel(txt.replace(/[^0-9]/g, '').slice(0, 9))}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Quantité (tablettes) *</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={orderQuantite}
                    onChangeText={setOrderQuantite}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Prix Unitaire (FCFA)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={orderPrixUnitaire}
                    onChangeText={setOrderPrixUnitaire}
                  />
                </View>
              </View>

              <Text style={styles.label}>Adresse / Lieu (max 25 caractères)</Text>
              <TextInput
                style={styles.input}
                maxLength={25}
                value={orderAdresse}
                onChangeText={(txt) => setOrderAdresse(txt.slice(0, 25))}
              />

              <Text style={styles.label}>Note</Text>
              <TextInput
                style={styles.input}
                value={orderNote}
                onChangeText={setOrderNote}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#78716C' }]}
                  onPress={() => setOrderEditModal(false)}
                >
                  <Text style={styles.modalBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                  onPress={handleSaveOrderEdit}
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
  scrollContent: { padding: 14, paddingBottom: 32 },
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
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  summaryHero: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  summaryLabel: {
    color: '#FDE68A',
    fontSize: 10.5,
    fontWeight: '800',
  },
  summaryVal: {
    fontSize: 16.5,
    fontWeight: '900',
    marginTop: 4,
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
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderNum: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  orderMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  orderDetailsBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  orderQtyText: {
    fontSize: 13.5,
    color: COLORS.textPrimary,
  },
  orderAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  orderNote: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#78350F',
    marginTop: 4,
  },
  orderActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  factureTopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    backgroundColor: '#EFECE6',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryDark,
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  newFactureBtn: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  newFactureBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  factureCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  factureClient: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  factureNumBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1E3A8A',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  factureDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  factureTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  cachetMiniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cachetMiniPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  factureActionsRight: {
    alignItems: 'flex-end',
    gap: 7,
  },
  blueStampBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    transform: [{ rotate: '-4deg' }],
  },
  blueStampPaye: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#1D4ED8',
    backgroundColor: '#EFF6FF',
  },
  blueStampNonPaye: {
    borderWidth: 2,
    borderColor: '#1D4ED8',
    borderRadius: 5,
    backgroundColor: '#EFF6FF',
  },
  blueStampText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  factureEditDeleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  iconPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  iconPreviewBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  iconSignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  iconSignBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  iconEditBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  iconDeleteBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  // --- STYLES DE LA FEUILLE DE FACTURE ÉLECTRONIQUE TERA AGRO - SUARL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'center',
    padding: 10,
  },
  modalScrollInner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  electronicSheetCard: {
    backgroundColor: COLORS.background,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.large,
  },
  sheetTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  sheetTopBarTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  officialHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primaryLight,
    gap: 10,
    ...SHADOWS.small,
  },
  officialLogoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialInvoiceLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  officialHeaderTextCol: {
    flex: 1,
  },
  officialCompanyName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  officialBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  officialPoulaillerPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  officialPoulaillerPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 0.4,
  },
  officialNineaPill: {
    backgroundColor: 'rgba(254, 243, 199, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.4)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  officialNineaPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FEF3C7',
  },
  officialAddress: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FDE68A',
    marginTop: 5,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  invoiceNumWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  invoiceNumLabel: {
    fontSize: 11.5,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  invoiceNumControlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 9,
    paddingHorizontal: 3,
    height: 38,
  },
  invoiceNumStepBtn: {
    width: 24,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceNumInput: {
    minWidth: 54,
    height: 38,
    paddingHorizontal: 6,
    paddingVertical: 0,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  invoiceDateWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  invoiceDateLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  invoiceDateInput: {
    width: 98,
    height: 38,
    backgroundColor: '#FAF7F2',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 0,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  invoiceClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: COLORS.cardBorder,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    gap: 6,
  },
  invoiceClientLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  invoiceClientInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 6,
    paddingVertical: 0,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  invoiceTableOuter: {
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  invoiceTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.cardBorder,
  },
  invoiceTh: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.cardBorder,
  },
  invoiceTableRowInput: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.cardBorder,
    minHeight: 46,
    backgroundColor: '#FFFFFF',
  },
  invoiceTdCell: {
    borderRightWidth: 1,
    borderRightColor: COLORS.cardBorder,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  invoiceCellInput: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    height: 42,
    includeFontPadding: false,
  },
  invoiceLiveTotalCellText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.secondary,
    textAlign: 'right',
    paddingRight: 4,
  },
  invoiceBodyCanvas: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FFFDF7',
    justifyContent: 'space-between',
  },
  stampChoiceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginVertical: 6,
  },
  stampChoiceBtn: {
    padding: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    opacity: 0.4,
  },
  stampChoiceBtnActive: {
    opacity: 1,
    backgroundColor: 'rgba(219, 234, 254, 0.55)',
    borderColor: '#93C5FD',
  },
  stampPayeVisual: {
    color: '#1D4ED8',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 2,
    paddingHorizontal: 8,
  },
  stampNonPayeVisualBox: {
    borderWidth: 2.5,
    borderColor: '#1D4ED8',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '-9deg' }],
  },
  stampNonPayeVisualText: {
    color: '#1D4ED8',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  stampsAndSignaturesArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 6,
  },
  sigColumnBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sigColumnRoleTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 3,
  },
  sigPreviewPill: {
    alignItems: 'center',
    marginVertical: 2,
  },
  sigCursiveText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  sigDrawnBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  sigEmptyText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    marginVertical: 4,
  },
  sigOpenPadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    marginTop: 4,
  },
  sigOpenPadBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  roundOfficialCachetWrap: {
    width: 122,
    height: 122,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundOfficialCachetImg: {
    width: 122,
    height: 122,
  },
  sigDrawerBox: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  sigDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sigDrawerTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  sigClearText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.danger,
  },
  sigSignerNameInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  sigPadContainer: {
    height: 95,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#60A5FA',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sigPadHint: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  sigConfirmBtn: {
    marginTop: 8,
    backgroundColor: '#1D4ED8',
    height: 38,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sigConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  invoiceTableFooterTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  invoiceTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FEF3C7',
    letterSpacing: 0.8,
  },
  invoiceTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  arreteSommeBox: {
    marginTop: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  arreteSommeLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  arreteSommeValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2,
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: '#E7E0D3',
    paddingTop: Platform.OS === 'android' ? 24 : 44,
  },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 6,
  },
  previewModalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  previewModalSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  previewTopBtnGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    gap: 4,
  },
  previewTopBtnBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    gap: 4,
  },
  previewTopBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  previewTopBtnEdit: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  previewTopBtnClose: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F5EFE6',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
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
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  priceConfigBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  priceConfigLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350F',
  },
  priceEditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  priceEditPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78350F',
  },
  priceQuickInput: {
    width: 85,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D97706',
    borderRadius: 9,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '900',
    color: '#78350F',
  },
  priceSaveBtn: {
    backgroundColor: COLORS.secondary,
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
