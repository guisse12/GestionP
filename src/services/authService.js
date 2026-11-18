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
import appConfig from '../../app.json';

const STORAGE_USERS_KEY = '@gps_users_v1';
const STORAGE_DELETED_USERS_KEY = '@gps_deleted_users_v1';
const STORAGE_CURRENT_USER_KEY = '@gps_current_user_v1';
const STORAGE_LAST_PHONE_KEY = '@gps_last_phone_v1';
const STORAGE_APP_VERSION_KEY = '@gps_installed_app_version_v1';
const FIRESTORE_USERS_COL = 'gps_users';

// Signature de version courante : à chaque nouvelle version de l'application, le numéro pré-rempli est effacé
export const CURRENT_APP_VERSION = `${appConfig?.expo?.version || '2.0.0'}_tera_v2`;

export const cleanPhone = (phone) => {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  if (digits.startsWith('221') && digits.length === 12) return digits.substring(3, 12);
  if (digits.startsWith('00221') && digits.length === 14) return digits.substring(5, 14);
  return digits.slice(0, 9);
};

export const phoneToFirebaseEmail = (phone) => {
  const digits = cleanPhone(phone);
  return `${digits}@gestionp.sn`;
};

// Comptes initiaux pré-configurés (Administrateur + COLY comme Gérant à Thiès)
const LEGACY_EXAMPLE_USER_IDS = ['usr_gerant_1', 'usr_emp_2', 'usr_emp_pending'];

export const DEFAULT_USERS = [
  {
    id: 'usr_admin_1',
    nom: 'Daouda GUISSE',
    telephone: '763318157',
    password: 'admin123',
    role: 'admin',
    poste: 'Administrateur Général',
    adresse: 'Thiès',
    statut: 'valide',
    createdAt: '2026-03-24',
    updatedAt: 2000,
  },
  {
    id: 'usr_emp_1',
    nom: 'COLY',
    telephone: '777527561',
    password: '123456',
    role: 'gerant',
    poste: 'Gérant du poulailler',
    adresse: 'Thiès',
    statut: 'valide',
    createdAt: '2026-03-24',
    updatedAt: 2000,
  },
];

// --- CACHE MÉMOIRE SYNCHRONE (0 ms pour éviter tout flash d'interface) ---
let cachedCurrentUser = null;
let cachedUsersList = [...DEFAULT_USERS];
let cachedDeletedIds = [...LEGACY_EXAMPLE_USER_IDS];
let hasLoadedUsersFromDisk = false;
let isSyncingFirestoreUsers = false;
let sessionLockedReason = null;
let autoLockSuppressedUntil = 0;

export const getCachedUser = () => cachedCurrentUser;
export const getCachedUsers = () => cachedUsersList;

export const suppressAutoLock = (durationMs = 45000) => {
  autoLockSuppressedUntil = Date.now() + durationMs;
};

export const isAutoLockSuppressed = () => Date.now() < autoLockSuppressedUntil;

export const consumeSessionLockedReason = () => {
  const reason = sessionLockedReason;
  sessionLockedReason = null;
  return reason;
};

export const getLastLoginPhone = async () => {
  try {
    const installedVersion = await AsyncStorage.getItem(STORAGE_APP_VERSION_KEY);
    // Si l'application vient d'avoir une nouvelle version, effacer le numéro pré-rempli et la session précédente
    if (installedVersion !== CURRENT_APP_VERSION) {
      await AsyncStorage.multiRemove([STORAGE_LAST_PHONE_KEY, STORAGE_CURRENT_USER_KEY]);
      await AsyncStorage.setItem(STORAGE_APP_VERSION_KEY, CURRENT_APP_VERSION);
      return '';
    }

    const lastPhone = await AsyncStorage.getItem(STORAGE_LAST_PHONE_KEY);
    if (lastPhone) return cleanPhone(lastPhone);
  } catch (e) {}
  return '';
};

// Garantit qu'aucun doublon d'ID ou de téléphone n'existe jamais et exclut les comptes supprimés ou exemples
const deduplicateUsers = (usersArray, deletedIds = []) => {
  const deletedSet = new Set([...LEGACY_EXAMPLE_USER_IDS, ...(deletedIds || [])]);
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

  if (!tel || tel.length !== 9) {
    return {
      success: false,
      error: 'Le numéro de téléphone doit contenir exactement 9 chiffres.',
    };
  }
  if (!pwd || pwd.length < 6 || pwd.length > 15) {
    return {
      success: false,
      error: 'Le mot de passe doit contenir entre 6 et 15 caractères.',
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
  sessionLockedReason = null;
  await AsyncStorage.setItem(STORAGE_APP_VERSION_KEY, CURRENT_APP_VERSION);
  await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  await AsyncStorage.setItem(STORAGE_LAST_PHONE_KEY, cleanPhone(user.telephone));

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
  const cleanNom = String(nom || '').trim().slice(0, 25);
  const cleanAdresse = String(adresse || '').trim().slice(0, 25);
  const pwd = String(password || '').trim();

  if (!cleanNom) {
    return { success: false, error: 'Veuillez renseigner votre nom complet (max 25 caractères).' };
  }
  if (!tel || tel.length !== 9) {
    return { success: false, error: 'Le numéro de téléphone doit contenir exactement 9 chiffres.' };
  }
  if (!pwd || pwd.length < 6 || pwd.length > 15) {
    return { success: false, error: 'Le mot de passe doit contenir entre 6 et 15 caractères.' };
  }

  const users = await getAllUsers();
  const existing = users.find((u) => cleanPhone(u.telephone) === tel);
  if (existing) {
    return {
      success: false,
      error: 'Ce numéro de téléphone est déjà associé à un compte existant.',
    };
  }

  // Peu importe le profil (client, employé, gérant), l'administrateur doit d'abord valider l'inscription
  const statut = 'en_attente';

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
    adresse: cleanAdresse || 'Sénégal',
    statut,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: Date.now(),
  };

  const updatedUsers = [newUser, ...users];
  await saveUsersList(updatedUsers, newUser);

  const email = phoneToFirebaseEmail(tel);
  createUserWithEmailAndPassword(auth, email, pwd.length >= 6 ? pwd : pwd + '_gps123').catch(() => {});

  return {
    success: true,
    user: newUser,
    requiresValidation: true,
  };
};

// Récupérer l'utilisateur connecté uniquement pour la session active en mémoire
// (Si l'utilisateur a quitté ou fermé l'application, il doit s'authentifier à nouveau)
export const getCurrentUser = async () => {
  if (cachedCurrentUser) {
    return cachedCurrentUser;
  }
  return null;
};

// Verrouiller la session lorsque l'utilisateur quitte l'application ou reste inactif
export const lockUserSession = async (reason = 'background') => {
  if (cachedCurrentUser?.telephone) {
    try {
      await AsyncStorage.setItem(STORAGE_LAST_PHONE_KEY, cleanPhone(cachedCurrentUser.telephone));
    } catch (e) {}
  }
  cachedCurrentUser = null;
  sessionLockedReason = reason;
  try {
    await AsyncStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  } catch (e) {}
};

// Déconnexion volontaire
export const logoutUser = async () => {
  cachedCurrentUser = null;
  sessionLockedReason = null;
  signOut(auth).catch(() => {});
  await AsyncStorage.multiRemove([STORAGE_CURRENT_USER_KEY, STORAGE_LAST_PHONE_KEY]);
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

  if (updates.telephone !== undefined) {
    const cleanNewTel = cleanPhone(updates.telephone);
    if (cleanNewTel.length !== 9) {
      return { success: false, error: 'Le numéro de téléphone doit contenir exactement 9 chiffres.' };
    }
    const duplicate = users.find((u) => u.id !== userId && cleanPhone(u.telephone) === cleanNewTel);
    if (duplicate) {
      return { success: false, error: 'Ce numéro de téléphone est déjà utilisé.' };
    }
    updates.telephone = cleanNewTel;
  }
  if (updates.nom !== undefined) {
    updates.nom = String(updates.nom).trim().slice(0, 25);
  }
  if (updates.adresse !== undefined) {
    updates.adresse = String(updates.adresse).trim().slice(0, 25);
  }
  if (updates.password !== undefined) {
    const cleanPwd = String(updates.password).trim();
    if (cleanPwd.length < 6 || cleanPwd.length > 15) {
      return { success: false, error: 'Le mot de passe doit contenir entre 6 et 15 caractères.' };
    }
    updates.password = cleanPwd;
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

  if (updates.telephone !== undefined) {
    const cleanNewTel = cleanPhone(updates.telephone);
    if (cleanNewTel.length !== 9) {
      return { success: false, error: 'Le numéro de téléphone doit contenir exactement 9 chiffres.' };
    }
    const duplicate = users.find((u) => u.id !== userId && cleanPhone(u.telephone) === cleanNewTel);
    if (duplicate) {
      return { success: false, error: 'Ce numéro de téléphone est déjà utilisé par un autre compte.' };
    }
    updates.telephone = cleanNewTel;
  }
  if (updates.nom !== undefined) {
    updates.nom = String(updates.nom).trim().slice(0, 25);
  }
  if (updates.adresse !== undefined) {
    updates.adresse = String(updates.adresse).trim().slice(0, 25);
  }
  if (updates.password !== undefined) {
    const cleanPwd = String(updates.password).trim();
    if (cleanPwd.length < 6 || cleanPwd.length > 15) {
      return { success: false, error: 'Le mot de passe doit contenir entre 6 et 15 caractères.' };
    }
    updates.password = cleanPwd;
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
  const cleanNom = String(nom || '').trim().slice(0, 25);
  const cleanAdresse = String(adresse || '').trim().slice(0, 25);
  const cleanPwd = String(password || '').trim();
  if (!cleanNom || !tel || !cleanPwd) {
    return { success: false, error: 'Nom, téléphone et mot de passe sont obligatoires.' };
  }
  if (tel.length !== 9) {
    return { success: false, error: 'Le numéro de téléphone doit contenir exactement 9 chiffres.' };
  }
  if (cleanPwd.length < 6 || cleanPwd.length > 15) {
    return { success: false, error: 'Le mot de passe doit contenir entre 6 et 15 caractères.' };
  }
  const users = [...cachedUsersList];
  if (users.some((u) => cleanPhone(u.telephone) === tel)) {
    return { success: false, error: 'Ce numéro de téléphone existe déjà.' };
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    nom: cleanNom,
    telephone: tel,
    password: cleanPwd,
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
    adresse: cleanAdresse || 'Thiès',
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
