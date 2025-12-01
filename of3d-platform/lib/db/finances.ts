import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    updateDoc,
    doc
} from "firebase/firestore";
import { Invoice, InvoiceStatus } from "@/lib/types/schema";

const COLLECTION = "invoices";

export async function createInvoice(data: Omit<Invoice, "id" | "createdAt" | "updatedAt">) {
    if (!db) throw new Error("Firestore not initialized");

    const now = Date.now();
    const invoiceData = {
        ...data,
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION), invoiceData);
    return { id: docRef.id, ...invoiceData };
}

export async function getUserInvoices(userId: string) {
    if (!db) return [];

    const q = query(
        collection(db, COLLECTION),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    if (!db) throw new Error("Firestore not initialized");

    const docRef = doc(db, COLLECTION, invoiceId);
    await updateDoc(docRef, {
        status,
        updatedAt: Date.now()
    });
}
