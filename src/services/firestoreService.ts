import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export async function getAll<T>(collectionName: string): Promise<(T & { id: string })[]> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
  } catch (error) {
    console.error(`Failed to fetch documents from ${collectionName}`, error);
    throw error;
  }
}

export async function addItem<T extends object>(collectionName: string, data: T): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), data as Record<string, unknown>);
    return docRef.id;
  } catch (error) {
    console.error(`Failed to add document to ${collectionName}`, error);
    throw error;
  }
}

export async function updateItem<T extends object>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
  try {
    await updateDoc(doc(db, collectionName, id), data as Record<string, unknown>);
  } catch (error) {
    console.error(`Failed to update document ${id} in ${collectionName}`, error);
    throw error;
  }
}

export async function deleteItem(collectionName: string, id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error(`Failed to delete document ${id} from ${collectionName}`, error);
    throw error;
  }
}
