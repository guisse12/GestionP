import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const STORAGE_USERS_KEY = '@gps_users_v1';
const STORAGE_DELETED_USERS_KEY = '@gps_deleted_users_v1';
const STORAGE_CURRENT_USER_KEY = '@gps_current_user_v1';
const FIRESTORE_USERS_COL = 'gps_users';

export const cleanPhone = (phone) => {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  if (digits.startsWith('221') && digits.length === 12) return digits.substring(3);
  if (digits.startsWith('00221') && digits.length === 14) return digits.substring(5);
  return digits;
};

export const phoneToFirebaseEmail = (phone) => {
  const digits = cleanPhone(phone);
  return `${digits}@gestionp.sn`;
};

// Comptes initiaux pré-configurés (basés sur GestionP.xlsx)
export const DEFAULT_USERS = [
  {
    id: 'usr_admin_1',
    nom: 'Daouda GUISSE',
    telephone: '763318157',
    password: 'admin123',
    role: 'admin',
    poste: 'Administrateur Général',
    adresse: 'GestionP - Direction',
    statut: 'valide',
    createdAt: '2026-03-24',
    updatedAt: 1000,
  },
  {
    id: 'usr_gerant_1',
    nom: 'Omar GUISSE',
    telephone: '770000002',
    password: '123456',
    role: 'gerant',
    poste: "Chef d'équipe / Gérant",
    adresse: 'GestionP - Site Principal',
    statut: 'valide',
    createdAt: '2026-03-24',
    updatedAt: 1000,
  },
  {
    id: 'usr_emp_1',
    nom: 'COLY',
    telephone: '770000003',
    password: '123456',
    role: 'employe',
    poste: 'Responsable Boxe 1',
    adresse: 'GestionP - Boxe 1',
    statut: 'valide',
    createdAt: '2026-03-24',
    updatedAt: 1000,
  },
  {
    id: 'usr_emp_2',
    nom: 'Siradio CISSE',
    telephone: '770000004',
    password: '123456',
    role: 'employe',
    poste: 'Responsable Boxe 2',
    adresse: 'GestionP - Boxe 2',
    statut: 'valide',
    createdAt: '2026-03-24',
    updatedAt: 1000,
  },
  {
    id: 'usr_emp_pending',
    nom: 'BALDE',
    telephone: '770000006',
    password: '123456',
    role: 'employe',
    poste: 'Magasinier & Suivi Stock',
    adresse: 'GestionP - Stockage',
    statut: 'en_attente',
    createdAt: '2026-11-04',
    updatedAt: 1000,
  },
  {
    id: 'usr_client_1',
    nom: 'OMAR SARR',
    telephone: '770000005',
    password: '123456',
    role: 'client',
    poste: 'Client Grossiste',
    adresse: 'Thiès / Dakar',
    statut: 'valide',
    createdAt: '2026-06-20',
    updatedAt: 1000,
  },
  {
    id: 'usr_client_2',
    nom: 'BARA BEYE',
    telephone: '770000007',
    password: '123456',
    role: 'client',
    poste: 'Client Distributeur',
    adresse: 'Thiès',
    statut: 'valide',
    createdAt: '2026-07-05',
    updatedAt: 1000,
  },
];

// --- CACHE MÉMOIRE SYNCHRONE (0 ms pour éviter tout flash d'interface) ---
let cachedCurrentUser = null;
let cachedUsersList = [...DEFAULT_USERS];
let cachedDeletedIds = [];
let hasLoadedUsersFromDisk = false;
let isSyncingFirestoreUsers = false;

export const getCachedUser = () => cachedCurrentUser;
export const getCachedUsers = () => cachedUsersList;

// Garantit qu'aucun doublon d'ID ou de téléphone n'existe jamais et exclut les comptes supprimés
const deduplicateUsers = (usersArray, deletedIds = []) => {
  const deletedSet = new Set(deletedIds);
  const byId = new Map();

  for (const rawUser of usersArray || []) {
    if (!rawUser || !rawUser.id || rawUser.deleted || deletedSet.has(rawUser.id)) {
      continue;
    }
    const existing = byId.get(rawUser.id);
    if (!existing || (Number(rawUser.updatedAt) || 0) >= (Number(existing.updatedAt) || 0)) {
      byId.set(rawUser.id, {
        ...existing,
        ...rawUser,
        telephone: cleanPhone(rawUser.telephone),
      });
    }
  }

  return Array.from(byId.values());
};

const loadDeletedIds = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_DELETED_USERS_KEY);
    if (raw) {
      cachedDeletedIds = JSON.parse(raw);
    }
  } catch (e) {}
  return cachedDeletedIds;
};

// Synchronisation Firestore non-bloquante en arrière-plan (fusion par ID unique)
const syncUsersWithFirestoreInBackground = async () => {
  if (isSyncingFirestoreUsers) return;
  isSyncingFirestoreUsers = true;
  try {
    const deletedIds = await loadDeletedIds();
    const snap = await getDocs(collection(db, FIRESTORE_USERS_COL));
    if (!snap.empty) {
      const cloudUsers = [];
      const cloudDeletedIds = [...deletedIds];

      snap.forEach((d) => {
        const u = d.data();
        const docId = d.id;
        if (u && u.deleted) {
          if (!cloudDeletedIds.includes(docId)) cloudDeletedIds.push(docId);
        } else if (u && (u.telephone || u.nom)) {
          cloudUsers.push({ ...u, id: u.id || docId });
        }
      });

      cachedDeletedIds = cloudDeletedIds;
      await AsyncStorage.setItem(STORAGE_DELETED_USERS_KEY, JSON.stringify(cloudDeletedIds));

      // Fusionner par ID : DEFAULT_USERS -> local -> cloud (le plus récent updatedAt gagne)
      const combined = [...DEFAULT_USERS, ...cachedUsersList, ...cloudUsers];
      const mergedList = deduplicateUsers(combined, cloudDeletedIds);

      cachedUsersList = mergedList;
      await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(mergedList));

      if (cachedCurrentUser) {
        const updatedMe = mergedList.find((u) => u.id === cachedCurrentUser.id);
        if (updatedMe) {
          cachedCurrentUser = updatedMe;
          await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedMe));
        }
      }
    } else {
      for (const u of cachedUsersList) {
        setDoc(doc(db, FIRESTORE_USERS_COL, u.id), u).catch(() => {});
      }
    }
  } catch (e) {
    // Hors-ligne : ignorer silencieusement
  } finally {
    isSyncingFirestoreUsers = false;
  }
};

// Récupérer tous les utilisateurs rapidement (local immédiat + sync cloud en arrière-plan)
export const getAllUsers = async () => {
  const deletedIds = await loadDeletedIds();

  if (!hasLoadedUsersFromDisk) {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        cachedUsersList = deduplicateUsers(parsed, deletedIds);
      } else {
        cachedUsersList = deduplicateUsers(DEFAULT_USERS, deletedIds);
      }
      hasLoadedUsersFromDisk = true;
      await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cachedUsersList));
    } catch (e) {
      cachedUsersList = deduplicateUsers(DEFAULT_USERS, deletedIds);
      hasLoadedUsersFromDisk = true;
    }
  } else {
    cachedUsersList = deduplicateUsers(cachedUsersList, deletedIds);
  }

  // Lancer la synchronisation cloud sans bloquer l'affichage
  syncUsersWithFirestoreInBackground();

  return cachedUsersList;
};

const saveUsersList = async (users, updatedUser = null) => {
  const cleanList = deduplicateUsers(users, cachedDeletedIds);
  cachedUsersList = cleanList;
  hasLoadedUsersFromDisk = true;
  await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cleanList));
  if (updatedUser && updatedUser.id) {
    setDoc(doc(db, FIRESTORE_USERS_COL, updatedUser.id), updatedUser, { merge: true }).catch(() => {});
  }
  return cleanList;
};

// Connexion ultra-rapide par Numéro de Téléphone + Mot de Passe
export const loginWithPhoneAndPassword = async (telephoneInput, passwordInput) => {
  const tel = cleanPhone(telephoneInput);
  const pwd = String(passwordInput || '').trim();

  if (!tel || tel.length < 8) {
    return {
      success: false,
      error: 'Veuillez saisir un numéro de téléphone valide.',
    };
  }
  if (!pwd) {
    return {
      success: false,
      error: 'Veuillez saisir votre mot de passe.',
    };
  }

  const users = await getAllUsers();
  let user = users.find((u) => cleanPhone(u.telephone) === tel);

  if (!user && tel === '770000001') {
    user = users.find((u) => u.role === 'admin');
  }

  if (!user) {
    return {
      success: false,
      error: 'Aucun compte trouvé avec ce numéro de téléphone.',
    };
  }

  if (user.password !== pwd) {
    return {
      success: false,
      error: 'Mot de passe incorrect.',
    };
  }

  if (user.statut === 'en_attente') {
    return {
      success: false,
      pendingValidation: true,
      error: "Votre demande de compte est en attente de validation par l'Administrateur.",
    };
  }

  if (user.statut === 'refuse' || user.statut === 'bloque') {
    return {
      success: false,
      error: "Votre compte a été désactivé par l'Administrateur.",
    };
  }

  cachedCurrentUser = user;
  await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));

  // Connexion Firebase Auth en arrière-plan sans bloquer l'utilisateur
  const email = phoneToFirebaseEmail(user.telephone);
  signInWithEmailAndPassword(auth, email, pwd.length >= 6 ? pwd : pwd + '_gps123').catch(() => {});

  return {
    success: true,
    user,
  };
};

// Inscription d'un nouvel utilisateur
export const registerWithPhoneAndPassword = async ({
  nom,
  telephone,
  password,
  role = 'client',
  poste = '',
  adresse = '',
}) => {
  const tel = cleanPhone(telephone);
  const cleanNom = String(nom || '').trim();
  const pwd = String(password || '').trim();

  if (!cleanNom) {
    return { success: false, error: 'Veuillez renseigner votre nom complet.' };
  }
  if (!tel || tel.length < 8) {
    return { success: false, error: 'Veuillez renseigner un numéro de téléphone valide.' };
  }
  if (!pwd || pwd.length < 4) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 4 caractères.' };
  }

  const users = await getAllUsers();
  const existing = users.find((u) => cleanPhone(u.telephone) === tel);
  if (existing) {
    return {
      success: false,
      error: 'Ce numéro de téléphone est déjà associé à un compte existant.',
    };
  }

  const isClient = role === 'client';
  const statut = isClient ? 'valide' : 'en_attente';

  const newUser = {
    id: 'usr_' + Date.now(),
    nom: cleanNom,
    telephone: tel,
    password: pwd,
    role,
    poste:
      poste ||
      (role === 'gerant'
        ? "Chef d'équipe / Gérant"
        : role === 'employe'
        ? 'Employé'
        : 'Client'),
    adresse: String(adresse || '').trim() || 'Sénégal',
    statut,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: Date.now(),
  };

  const updatedUsers = [newUser, ...users];
  await saveUsersList(updatedUsers, newUser);

  const email = phoneToFirebaseEmail(tel);
  createUserWithEmailAndPassword(auth, email, pwd.length >= 6 ? pwd : pwd + '_gps123').catch(() => {});

  if (isClient) {
    cachedCurrentUser = newUser;
    await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
  }

  return {
    success: true,
    user: newUser,
    requiresValidation: !isClient,
  };
};

// Récupérer l'utilisateur connecté (Instantané si en cache mémoire)
export const getCurrentUser = async () => {
  if (cachedCurrentUser) {
    return cachedCurrentUser;
  }
  try {
    const raw = await AsyncStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    cachedCurrentUser = saved;
    return saved;
  } catch (e) {
    return null;
  }
};

// Déconnexion
export const logoutUser = async () => {
  cachedCurrentUser = null;
  signOut(auth).catch(() => {});
  await AsyncStorage.removeItem(STORAGE_CURRENT_USER_KEY);
};

// Modifier son propre profil
export const updateUserProfile = async (userId, updates) => {
  if (!hasLoadedUsersFromDisk) {
    await getAllUsers();
  }
  const users = [...cachedUsersList];
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return { success: false, error: 'Utilisateur introuvable.' };
  }

  if (updates.telephone) {
    const cleanNewTel = cleanPhone(updates.telephone);
    const duplicate = users.find((u) => u.id !== userId && cleanPhone(u.telephone) === cleanNewTel);
    if (duplicate) {
      return { success: false, error: 'Ce numéro de téléphone est déjà utilisé.' };
    }
    updates.telephone = cleanNewTel;
  }

  const updatedUser = {
    ...users[idx],
    ...updates,
    updatedAt: Date.now(),
  };
  users[idx] = updatedUser;
  const savedList = await saveUsersList(users, updatedUser);

  if (cachedCurrentUser && cachedCurrentUser.id === userId) {
    cachedCurrentUser = updatedUser;
    await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }

  return { success: true, user: updatedUser, users: savedList };
};

// Fonctions Administrateur : Modifier un compte (instantané et persistant)
export const adminUpdateUser = async (userId, updates) => {
  if (!hasLoadedUsersFromDisk) {
    await getAllUsers();
  }
  const users = [...cachedUsersList];
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return { success: false, error: 'Utilisateur introuvable.' };
  }

  if (updates.telephone) {
    const cleanNewTel = cleanPhone(updates.telephone);
    const duplicate = users.find((u) => u.id !== userId && cleanPhone(u.telephone) === cleanNewTel);
    if (duplicate) {
      return { success: false, error: 'Ce numéro de téléphone est déjà utilisé par un autre compte.' };
    }
    updates.telephone = cleanNewTel;
  }

  const updatedUser = {
    ...users[idx],
    ...updates,
    updatedAt: Date.now(),
  };
  users[idx] = updatedUser;
  const savedList = await saveUsersList(users, updatedUser);

  if (cachedCurrentUser && cachedCurrentUser.id === userId) {
    cachedCurrentUser = updatedUser;
    await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }

  return { success: true, user: updatedUser, users: savedList };
};

// Créer un compte depuis l'espace Administrateur
export const adminCreateUser = async ({ nom, telephone, password, role, poste, adresse }) => {
  if (!hasLoadedUsersFromDisk) {
    await getAllUsers();
  }
  const tel = cleanPhone(telephone);
  if (!nom || !tel || !password) {
    return { success: false, error: 'Nom, téléphone et mot de passe sont obligatoires.' };
  }
  const users = [...cachedUsersList];
  if (users.some((u) => cleanPhone(u.telephone) === tel)) {
    return { success: false, error: 'Ce numéro de téléphone existe déjà.' };
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    nom: String(nom).trim(),
    telephone: tel,
    password: String(password).trim(),
    role: role || 'employe',
    poste:
      poste ||
      (role === 'admin'
        ? 'Administrateur'
        : role === 'gerant'
        ? "Chef d'équipe"
        : role === 'client'
        ? 'Client'
        : 'Employé'),
    adresse: adresse || 'GestionP',
    statut: 'valide',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: Date.now(),
  };

  const updatedUsers = [newUser, ...users];
  const savedList = await saveUsersList(updatedUsers, newUser);
  return { success: true, user: newUser, users: savedList };
};

// Supprimer définitivement un compte depuis l'espace Administrateur
export const adminDeleteUser = async (userId) => {
  if (!hasLoadedUsersFromDisk) {
    await getAllUsers();
  }
  await loadDeletedIds();
  if (!cachedDeletedIds.includes(userId)) {
    cachedDeletedIds = [...cachedDeletedIds, userId];
    await AsyncStorage.setItem(STORAGE_DELETED_USERS_KEY, JSON.stringify(cachedDeletedIds));
  }

  const filtered = cachedUsersList.filter((u) => u.id !== userId);
  cachedUsersList = filtered;
  await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(filtered));

  // Marquer comme supprimé dans Firestore pour qu'il ne revienne jamais lors de la synchro
  setDoc(
    doc(db, FIRESTORE_USERS_COL, userId),
    { id: userId, deleted: true, updatedAt: Date.now() },
    { merge: true }
  ).catch(() => {});

  return { success: true, users: filtered };
};
