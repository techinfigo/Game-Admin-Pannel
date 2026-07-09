import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SiteSettings } from "../types";

const SETTINGS_DOC_REF = doc(db, "settings", "site");

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const snapshot = await getDoc(SETTINGS_DOC_REF);
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as SiteSettings;
}

export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  await setDoc(SETTINGS_DOC_REF, data, { merge: true });
}
