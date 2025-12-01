import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    getDocs,
    writeBatch
} from "firebase/firestore";
import { Notification } from "@/lib/types/schema";

const COLLECTION = "notifications";

export async function createNotification(data: Omit<Notification, "id" | "createdAt" | "read">) {
    if (!db) throw new Error("Firestore not initialized");

    await addDoc(collection(db, COLLECTION), {
        ...data,
        read: false,
        createdAt: Date.now()
    });
}

export function subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    if (!db) return () => { };

    const q = query(
        collection(db, COLLECTION),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        callback(notifications);
    });
}

export async function markAllAsRead(userId: string) {
    if (!db) return;

    const q = query(
        collection(db, COLLECTION),
        where("userId", "==", userId),
        where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(d => {
        batch.update(doc(db, COLLECTION, d.id), { read: true });
    });

    await batch.commit();
}
