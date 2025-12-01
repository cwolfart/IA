import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { User } from "@/lib/types/schema";

const COLLECTION = "users";

export async function createUser(uid: string, data: Partial<User>) {
    if (!db) throw new Error("Firestore not initialized");
    const userRef = doc(db, COLLECTION, uid);
    const now = Date.now();

    const newUser: User = {
        uid,
        email: data.email || "",
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        role: data.role || "CLIENT",
        createdAt: now,
        updatedAt: now,
        ...data,
    };

    await setDoc(userRef, newUser, { merge: true });
    return newUser;
}

export async function getUser(uid: string): Promise<User | null> {
    if (!db) return null;
    const userRef = doc(db, COLLECTION, uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
        return snapshot.data() as User;
    }
    return null;
}

export async function updateUser(uid: string, data: Partial<User>) {
    if (!db) throw new Error("Firestore not initialized");
    const userRef = doc(db, COLLECTION, uid);
    await updateDoc(userRef, {
        ...data,
        updatedAt: Date.now(),
    });
}

export async function getAllUsers() {
    if (!db) return [];
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(doc => doc.data() as User);
}
