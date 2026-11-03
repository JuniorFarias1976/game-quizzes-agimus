import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppAdminSettings, PlayerRegistration, LeaderboardEntry } from '../types/game';
import { DEFAULT_ADMIN_SETTINGS, saveAdminSettings } from '../utils/adminStorage';
import { INITIAL_LEADERBOARD } from '../utils/leaderboard';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'global_config';
const REGISTRATIONS_COLLECTION = 'registrations';
const LEADERBOARD_COLLECTION = 'leaderboard';

const LOCAL_REGISTRATIONS_KEY = 'neuroreflex_local_registrations_v1';

// -------------------------------------------------------------
// SETTINGS SYNC (Real-time multi-device cloud synchronization)
// -------------------------------------------------------------

export function subscribeToCloudSettings(
  onUpdate: (settings: AppAdminSettings) => void
): () => void {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data() as Partial<AppAdminSettings>;
          const merged: AppAdminSettings = {
            ...DEFAULT_ADMIN_SETTINGS,
            ...cloudData,
            endGameImage: {
              ...DEFAULT_ADMIN_SETTINGS.endGameImage,
              ...(cloudData.endGameImage || {}),
            },
            branding: {
              ...DEFAULT_ADMIN_SETTINGS.branding,
              ...(cloudData.branding || {}),
            },
            logo: {
              ...DEFAULT_ADMIN_SETTINGS.logo,
              ...(cloudData.logo || {}),
            },
            registration: {
              ...DEFAULT_ADMIN_SETTINGS.registration,
              ...(cloudData.registration || {}),
            },
          };
          saveAdminSettings(merged);
          onUpdate(merged);
        } else {
          // Initialize cloud config with defaults
          saveAdminSettingsToCloud(DEFAULT_ADMIN_SETTINGS).catch(() => {});
        }
      },
      (error) => {
        console.warn('Firestore settings snapshot error, using local data:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not subscribe to cloud settings:', err);
    return () => {};
  }
}

export async function saveAdminSettingsToCloud(settings: AppAdminSettings): Promise<void> {
  saveAdminSettings(settings);
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not save settings to cloud (offline fallback active):', err);
  }
}

// -------------------------------------------------------------
// PLAYER REGISTRATIONS (Leads collection before starting game)
// -------------------------------------------------------------

export function getLocalRegistrations(): PlayerRegistration[] {
  try {
    const raw = localStorage.getItem(LOCAL_REGISTRATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalRegistrations(regs: PlayerRegistration[]): void {
  try {
    localStorage.setItem(LOCAL_REGISTRATIONS_KEY, JSON.stringify(regs));
  } catch {}
}

export async function saveRegistration(reg: PlayerRegistration): Promise<void> {
  // Always update local cache immediately
  const localList = getLocalRegistrations();
  const existingIdx = localList.findIndex((r) => r.id === reg.id);
  const updatedLocal = existingIdx >= 0 
    ? localList.map((r, i) => (i === existingIdx ? reg : r)) 
    : [reg, ...localList];
  saveLocalRegistrations(updatedLocal);

  // Sync to Firestore cloud
  try {
    const docRef = doc(db, REGISTRATIONS_COLLECTION, reg.id);
    await setDoc(docRef, reg);
  } catch (err) {
    console.warn('Could not sync registration to Firestore (saved locally):', err);
  }
}

export async function loadAllRegistrations(): Promise<PlayerRegistration[]> {
  try {
    const collRef = collection(db, REGISTRATIONS_COLLECTION);
    const snap = await getDocs(collRef);
    if (!snap.empty) {
      const items: PlayerRegistration[] = [];
      snap.forEach((d) => items.push(d.data() as PlayerRegistration));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveLocalRegistrations(items);
      return items;
    }
  } catch (err) {
    console.warn('Could not fetch registrations from Firestore, using local:', err);
  }
  return getLocalRegistrations();
}

export async function deleteRegistration(id: string): Promise<void> {
  const localList = getLocalRegistrations().filter((r) => r.id !== id);
  saveLocalRegistrations(localList);
  try {
    await deleteDoc(doc(db, REGISTRATIONS_COLLECTION, id));
  } catch {}
}

export async function clearAllRegistrations(): Promise<void> {
  saveLocalRegistrations([]);
  try {
    const collRef = collection(db, REGISTRATIONS_COLLECTION);
    const snap = await getDocs(collRef);
    const promises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch {}
}

// -------------------------------------------------------------
// LEADERBOARD CLOUD SYNC
// -------------------------------------------------------------

export function subscribeToCloudLeaderboard(
  onUpdate: (entries: LeaderboardEntry[]) => void
): () => void {
  try {
    const collRef = collection(db, LEADERBOARD_COLLECTION);
    const q = query(collRef, limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudEntries: LeaderboardEntry[] = [];
          snapshot.forEach((d) => {
            cloudEntries.push({ ...d.data(), id: d.id } as LeaderboardEntry);
          });
          cloudEntries.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.averageReactionMs - b.averageReactionMs;
          });
          onUpdate(cloudEntries);
        }
      },
      (error) => {
        console.warn('Leaderboard cloud subscription error, using local fallback:', error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
}

export async function submitLeaderboardCloud(entry: LeaderboardEntry): Promise<void> {
  try {
    const docRef = doc(db, LEADERBOARD_COLLECTION, entry.id);
    await setDoc(docRef, entry);
  } catch (err) {
    console.warn('Could not save score to cloud:', err);
  }
}

export async function deleteLeaderboardEntryCloud(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, LEADERBOARD_COLLECTION, id));
  } catch {}
}

export async function clearAllLeaderboardCloud(): Promise<void> {
  try {
    const collRef = collection(db, LEADERBOARD_COLLECTION);
    const snap = await getDocs(collRef);
    const promises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch {}
}
