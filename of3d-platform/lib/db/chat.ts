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
    arrayUnion
} from "firebase/firestore";
import { Message } from "@/lib/types/schema";

const COLLECTION = "messages";

export async function sendMessage(projectId: string, senderId: string, text: string) {
    if (!db) throw new Error("Firestore not initialized");

    const messageData: Omit<Message, "id"> = {
        projectId,
        senderId,
        text,
        createdAt: Date.now(),
        readBy: [senderId]
    };

    await addDoc(collection(db, COLLECTION), messageData);
}

export function subscribeToMessages(projectId: string, callback: (messages: Message[]) => void) {
    if (!db) return () => { };

    const q = query(
        collection(db, COLLECTION),
        where("projectId", "==", projectId),
        orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        callback(messages);
    });
}

export async function markMessageAsRead(messageId: string, userId: string) {
    if (!db) return;
    const messageRef = doc(db, COLLECTION, messageId);
    await updateDoc(messageRef, {
        readBy: arrayUnion(userId)
    });
}
