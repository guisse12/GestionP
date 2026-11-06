import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout, { getRoleLabel, getRoleColor } from '../components/NavigationLayout';
import { COLORS, SHADOWS } from '../theme/colors';
import {
  getCachedUser,
  getCachedUsers,
  getCurrentUser,
  getAllUsers,
  adminUpdateUser,
  adminCreateUser,
  adminDeleteUser,
} from '../services/authService';

export default function AdminUsersScreen({ navigation }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [usersList, setUsersList] = useState(() => getCachedUsers() || []);

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employe');
  const [poste, setPoste] = useState('');
  const [adresse, setAdresse] = useState('');
  const [statut, setStatut] = useState('valide');

  const loadData = async () => {
    const current = await getCurrentUser();
    if (!current || current.role !== 'admin') {
      Alert.alert('Accès réservé', "Page réservée à l'Administrateur.");
      navigation.replace('Dashboard');
      return;
    }
    setUser(current);
    const all = await getAllUsers();
    setUsersList([...all]);
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const handleValidateUser = async (targetUser, newStatut) => {
    const res = await adminUpdateUser(targetUser.id, { statut: newStatut });
    if (res.success) {
      setUsersList([...(res.users || [])]);
    }
  };

  const openModal = (target = null) => {
    if (target) {
      setEditId(target.id);
      setNom(target.nom || '');
      setTelephone(target.telephone || '');
      setPassword(target.password || '');
      setRole(target.role || 'employe');
      setPoste(target.poste || '');
      setAdresse(target.adresse || '');
      setStatut(target.statut || 'valide');
    } else {
      setEditId(null);
      setNom('');
      setTelephone('');
      setPassword('123456');
      setRole('employe');
      setPoste('Employé');
      setAdresse('GestionP');
      setStatut('valide');
    }
    setModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!nom.trim() || !telephone.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Nom, téléphone et mot de passe sont obligatoires.');
      return;
    }

    if (editId) {
      const res = await adminUpdateUser(editId, {
        nom: nom.trim(),
        telephone: telephone.trim(),
        password: password.trim(),
        role,
        poste: poste.trim(),
        adresse: adresse.trim(),
        statut,
      });
      if (!res.success) {
        Alert.alert('Erreur', res.error);
        return;
      }
      setUsersList([...(res.users || [])]);
      setModalVisible(false);
      Alert.alert('Modifié', `Le compte de ${nom.trim()} a été mis à jour.`);
    } else {
      const res = await adminCreateUser({
        nom: nom.trim(),
        telephone: telephone.trim(),
        password: password.trim(),
        role,
        poste: poste.trim(),
        adresse: adresse.trim(),
      });
      if (!res.success) {
        Alert.alert('Erreur', res.error);
        return;
      }
      setUsersList([...(res.users || [])]);
      setModalVisible(false);
      Alert.alert('Créé', `Le compte de ${nom.trim()} a été ajouté.`);
    }
  };

  const executeDeleteUser = async (targetUser) => {
    if (!targetUser) return;
    const res = await adminDeleteUser(targetUser.id);
    if (res.success) {
      setUsersList([...(res.users || [])]);
      setDeleteConfirmUser(null);
      setModalVisible(false);
    }
  };

  const pendingList = usersList.filter((u) => u.statut === 'en_attente');
  const activeList = usersList.filter((u) => u.statut !== 'en_attente');

  return (
    <NavigationLayout
      user={user}
      activeTab="AdminUsers"
      title="Utilisateurs"
      navigation={navigation}
      pendingUsersCount={pendingList.length}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topHeaderRow}>
          <Text style={styles.sectionTitle}>
            Demandes en attente ({pendingList.length})
          </Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => openModal(null)}>
            <Ionicons name="person-add" size={17} color="#FFFFFF" />
            <Text style={styles.createBtnText}>+ Créer</Text>
          </TouchableOpacity>
        </View>

        {pendingList.length === 0 ? (
          <View style={styles.noPendingBox}>
            <Ionicons name="checkmark-done-circle" size={20} color={COLORS.secondary} />
            <Text style={styles.noPendingText}>Aucune demande en attente</Text>
          </View>
        ) : (
          pendingList.map((u, index) => (
            <View key={`pending_${u.id}_${index}`} style={styles.pendingCard}>
              <View style={styles.userRowTop}>
                <View style={styles.avatarPending}>
                  <Ionicons name="time" size={22} color="#B45309" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{u.nom}</Text>
                  <Text style={styles.userMeta}>
                    📞 {u.telephone} • {getRoleLabel(u.role)}
                  </Text>
                </View>
              </View>

              <View style={styles.pendingBtnRow}>
                <TouchableOpacity
                  style={[styles.pendingBtn, { backgroundColor: COLORS.secondary }]}
                  onPress={() => handleValidateUser(u, 'valide')}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.pendingBtnText}>Valider</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pendingBtn, { backgroundColor: COLORS.danger }]}
                  onPress={() => setDeleteConfirmUser(u)}
                >
                  <Ionicons name="trash" size={18} color="#FFFFFF" />
                  <Text style={styles.pendingBtnText}>Supprimer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pendingBtn, { backgroundColor: COLORS.primary, flex: 0.5 }]}
                  onPress={() => openModal(u)}
                >
                  <Ionicons name="create" size={17} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 18, marginBottom: 10 }]}>
          Comptes ({activeList.length})
        </Text>

        {activeList.map((u, index) => (
          <View key={`active_${u.id}_${index}`} style={styles.userCard}>
            <View style={styles.userRowTop}>
              <View style={[styles.avatarCircle, { backgroundColor: getRoleColor(u.role) }]}>
                <Text style={styles.avatarLetter}>{(u.nom || 'U').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.userName}>{u.nom}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(u.role) }]}>
                    <Text style={styles.roleBadgeText}>{getRoleLabel(u.role)}</Text>
                  </View>
                  {u.statut === 'refuse' && (
                    <View style={[styles.roleBadge, { backgroundColor: COLORS.danger }]}>
                      <Text style={styles.roleBadgeText}>Bloqué</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userMeta}>
                  📞 {u.telephone} • 🔑 {u.password}
                </Text>
              </View>
            </View>

            <View style={styles.cardBottomActions}>
              <TouchableOpacity style={styles.editUserBtn} onPress={() => openModal(u)}>
                <Ionicons name="create-outline" size={17} color={COLORS.primaryDark} />
                <Text style={styles.editUserBtnText}>Modifier</Text>
              </TouchableOpacity>

              {u.id !== user?.id && (
                <TouchableOpacity
                  style={styles.deleteUserBtn}
                  onPress={() => setDeleteConfirmUser(u)}
                >
                  <Ionicons name="trash-outline" size={17} color={COLORS.danger} />
                  <Text style={styles.deleteUserBtnText}>Supprimer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal de création / modification d'un compte */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editId ? `Modifier : ${nom}` : 'Nouvel Utilisateur'}
            </Text>

            <Text style={styles.label}>Nom complet *</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setNom} />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Téléphone *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={telephone}
                  onChangeText={setTelephone}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Mot de passe *</Text>
                <TextInput style={styles.input} value={password} onChangeText={setPassword} />
              </View>
            </View>

            <Text style={styles.label}>Poste / Fonction</Text>
            <TextInput
              style={styles.input}
              value={poste}
              onChangeText={setPoste}
              placeholder="Ex: Responsable Boxe 1, Gérant, Client..."
            />

            <Text style={styles.label}>Rôle</Text>
            <View style={styles.roleChoicesRow}>
              {['admin', 'gerant', 'employe', 'client'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleChoiceBtn,
                    role === r && { backgroundColor: getRoleColor(r) },
                  ]}
                  onPress={() => setRole(r)}
                >
                  <Text
                    style={[
                      styles.roleChoiceText,
                      role === r && { color: '#FFFFFF' },
                    ]}
                  >
                    {r === 'admin'
                      ? 'Admin'
                      : r === 'gerant'
                      ? 'Gérant'
                      : r === 'employe'
                      ? 'Employé'
                      : 'Client'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Statut</Text>
            <View style={styles.roleChoicesRow}>
              {[
                { k: 'valide', l: 'Actif' },
                { k: 'en_attente', l: 'En attente' },
                { k: 'refuse', l: 'Bloqué' },
              ].map((st) => (
                <TouchableOpacity
                  key={st.k}
                  style={[
                    styles.roleChoiceBtn,
                    statut === st.k && { backgroundColor: COLORS.primaryDark },
                  ]}
                  onPress={() => setStatut(st.k)}
                >
                  <Text
                    style={[
                      styles.roleChoiceText,
                      statut === st.k && { color: '#FFFFFF' },
                    ]}
                  >
                    {st.l}
                  </Text>
                </TouchableOpacity>
              ))}
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
                onPress={handleSaveUser}
              >
                <Text style={styles.modalBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmation de suppression directe et fiable */}
      <Modal visible={!!deleteConfirmUser} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.deleteWarningCircle}>
                <Ionicons name="trash" size={28} color={COLORS.danger} />
              </View>
              <Text style={styles.modalTitle}>Supprimer ce compte ?</Text>
              <Text style={styles.deleteConfirmSub}>
                {deleteConfirmUser?.nom} ({deleteConfirmUser?.telephone})
              </Text>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#78716C' }]}
                onPress={() => setDeleteConfirmUser(null)}
              >
                <Text style={styles.modalBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.danger }]}
                onPress={() => executeDeleteUser(deleteConfirmUser)}
              >
                <Text style={styles.modalBtnText}>Oui, Supprimer</Text>
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
  topHeaderRow: {
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
  createBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 5,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  noPendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  noPendingText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#14532D',
  },
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  userRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPending: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  userName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  userMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  pendingBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  pendingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 5,
  },
  pendingBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  cardBottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  editUserBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    height: 38,
    borderRadius: 10,
    gap: 6,
  },
  editUserBtnText: {
    color: COLORS.primaryDark,
    fontWeight: '800',
    fontSize: 13,
  },
  deleteUserBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteUserBtnText: {
    color: COLORS.danger,
    fontWeight: '800',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  deleteWarningCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  deleteConfirmSub: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  roleChoicesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  roleChoiceBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#EFECE6',
    alignItems: 'center',
  },
  roleChoiceText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
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
