import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  query, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppAdminSettings, PlayerRegistration, LeaderboardEntry } from '../types/game';
import { DEFAULT_ADMIN_SETTINGS, saveAdminSettings, loadAdminSettings } from '../utils/adminStorage';
import { compressImageDataUrl } from '../utils/imageOptimizer';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'global_config';
const REGISTRATIONS_COLLECTION = 'registrations';
const LEADERBOARD_COLLECTION = 'leaderboard';

const LOCAL_REGISTRATIONS_KEY = 'neuroreflex_local_registrations_v1';

// -------------------------------------------------------------
// SETTINGS SANITIZER (Ensures document stays well within 1MB Firestore limit)
// -------------------------------------------------------------

async function sanitizeSettingsForCloud(settings: AppAdminSettings): Promise<AppAdminSettings> {
  const sanitized = { ...settings };

  // 1. Sanitize target images
  if (sanitized.customTargetImage) {
    const targetImg = { ...sanitized.customTargetImage };
    if (targetImg.imageUrl && targetImg.imageUrl.startsWith('data:')) {
      targetImg.imageUrl = await compressImageDataUrl(targetImg.imageUrl, {
        maxWidth: 320,
        maxHeight: 320,
        quality: 0.82,
        mimeType: 'image/webp',
      });
    }

    if (Array.isArray(targetImg.images) && targetImg.images.length > 0) {
      // Limit to max 10 target images and compress each
      const compressedList: string[] = [];
      const imagesSlice = targetImg.images.slice(0, 10);
      for (const img of imagesSlice) {
        if (img.startsWith('data:')) {
          const comp = await compressImageDataUrl(img, {
            maxWidth: 320,
            maxHeight: 320,
            quality: 0.82,
            mimeType: 'image/webp',
          });
          compressedList.push(comp);
        } else {
          compressedList.push(img);
        }
      }
      targetImg.images = compressedList;
    }
    sanitized.customTargetImage = targetImg;
  }

  // 2. Sanitize logo
  if (sanitized.logo?.logoUrl && sanitized.logo.logoUrl.startsWith('data:')) {
    sanitized.logo = {
      ...sanitized.logo,
      logoUrl: await compressImageDataUrl(sanitized.logo.logoUrl, {
        maxWidth: 400,
        maxHeight: 180,
        quality: 0.85,
        mimeType: 'image/webp',
      }),
    };
  }

  // 3. Sanitize background image
  if (sanitized.branding?.backgroundImageUrl && sanitized.branding.backgroundImageUrl.startsWith('data:')) {
    sanitized.branding = {
      ...sanitized.branding,
      backgroundImageUrl: await compressImageDataUrl(sanitized.branding.backgroundImageUrl, {
        maxWidth: 1280,
        maxHeight: 800,
        quality: 0.75,
        mimeType: 'image/webp',
      }),
    };
  }

  // 4. Sanitize end game banner
  if (sanitized.endGameImage?.imageUrl && sanitized.endGameImage.imageUrl.startsWith('data:')) {
    sanitized.endGameImage = {
      ...sanitized.endGameImage,
      imageUrl: await compressImageDataUrl(sanitized.endGameImage.imageUrl, {
        maxWidth: 640,
        maxHeight: 480,
        quality: 0.8,
        mimeType: 'image/webp',
      }),
    };
  }

  return sanitized;
}

// -------------------------------------------------------------
// SETTINGS SYNC (Real-time multi-device cloud synchronization)
// -------------------------------------------------------------

function mergeCloudSettings(cloudData: Partial<AppAdminSettings>): AppAdminSettings {
  const cloudBranding = (cloudData.branding || {}) as Partial<AppAdminSettings['branding']>;
  const validHex = (val: unknown, fallback: string) => {
    if (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val)) return val;
    if (typeof val === 'string' && /^#[0-9a-fA-F]{3}$/.test(val)) return val;
    return fallback;
  };

  const defaultHeaderBg = DEFAULT_ADMIN_SETTINGS.branding.headerBackgroundColor || '#060a14';

  return {
    ...DEFAULT_ADMIN_SETTINGS,
    ...cloudData,
    passwordHash: cloudData.passwordHash || DEFAULT_ADMIN_SETTINGS.passwordHash,
    lockEntireAppWithPassword: Boolean(cloudData.lockEntireAppWithPassword),
    customTargetImage: {
      ...DEFAULT_ADMIN_SETTINGS.customTargetImage,
      ...(cloudData.customTargetImage || {}),
      customBorderColor: validHex(cloudData.customTargetImage?.customBorderColor, DEFAULT_ADMIN_SETTINGS.customTargetImage.customBorderColor),
      images: Array.isArray(cloudData.customTargetImage?.images)
        ? cloudData.customTargetImage.images
        : cloudData.customTargetImage?.imageUrl
        ? [cloudData.customTargetImage.imageUrl]
        : [],
    },
    endGameImage: {
      ...DEFAULT_ADMIN_SETTINGS.endGameImage,
      ...(cloudData.endGameImage || {}),
    },
    branding: {
      ...DEFAULT_ADMIN_SETTINGS.branding,
      ...cloudBranding,
      primaryColor: validHex(cloudBranding.primaryColor, DEFAULT_ADMIN_SETTINGS.branding.primaryColor),
      secondaryColor: validHex(cloudBranding.secondaryColor, DEFAULT_ADMIN_SETTINGS.branding.secondaryColor),
      backgroundColor: validHex(cloudBranding.backgroundColor, DEFAULT_ADMIN_SETTINGS.branding.backgroundColor),
      headerBackgroundColor: validHex(cloudBranding.headerBackgroundColor, defaultHeaderBg),
      headerStyle: cloudBranding.headerStyle || DEFAULT_ADMIN_SETTINGS.branding.headerStyle,
      backgroundPattern: cloudBranding.backgroundPattern || DEFAULT_ADMIN_SETTINGS.branding.backgroundPattern,
      backgroundImageOpacity: typeof cloudBranding.backgroundImageOpacity === 'number' ? cloudBranding.backgroundImageOpacity : DEFAULT_ADMIN_SETTINGS.branding.backgroundImageOpacity,
    },
    logo: {
      ...DEFAULT_ADMIN_SETTINGS.logo,
      ...(cloudData.logo || {}),
    },
    registration: {
      ...DEFAULT_ADMIN_SETTINGS.registration,
      ...(cloudData.registration || {}),
    },
    customLevelConfigs: cloudData.customLevelConfigs || {},
  };
}

/**
 * Direct fetch from Firestore on app launch to guarantee immediate sync
 * in any new browser before onSnapshot triggers.
 */
export async function fetchCloudSettings(): Promise<AppAdminSettings | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const merged = mergeCloudSettings(snap.data() as Partial<AppAdminSettings>);
      saveAdminSettings(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Initial fetch from Firestore failed, falling back to local storage:', err);
  }
  return null;
}

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
          const merged = mergeCloudSettings(cloudData);
          saveAdminSettings(merged);
          onUpdate(merged);
        } else {
          // If cloud document doesn't exist yet, seed it with current local settings
          const currentLocal = loadAdminSettings();
          saveAdminSettingsToCloud(currentLocal).catch(() => {});
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

export async function saveAdminSettingsToCloud(
  settings: AppAdminSettings
): Promise<{ success: boolean; error?: string }> {
  // Always update local storage cache immediately
  saveAdminSettings(settings);
  try {
    const sanitized = await sanitizeSettingsForCloud(settings);
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Could not save settings to cloud:', err);
    return { success: false, error: errorMsg };
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
