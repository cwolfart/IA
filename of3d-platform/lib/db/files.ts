import { db } from "@/lib/firebase";
import { ProjectFile } from "@/lib/types/schema";
import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    where
} from "firebase/firestore";

const COLLECTION = "files";

export async function uploadFileRecord(data: Omit<ProjectFile, "id" | "createdAt">) {
    if (!db) throw new Error("Firestore not initialized");

    // Get current version count for this file name/project to increment version
    // For simplicity, we'll just use timestamp as version or auto-increment if we query first.
    // Let's query for existing files with same name in project to determine version.
    const q = query(
        collection(db, COLLECTION),
        where("projectId", "==", data.projectId),
        where("name", "==", data.name),
        orderBy("version", "desc")
    );

    const snapshot = await getDocs(q);
    let version = 1;
    if (!snapshot.empty) {
        const latest = snapshot.docs[0].data() as ProjectFile;
        version = latest.version + 1;
    }

    const fileData = {
        ...data,
        version,
        createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), fileData);
    return { id: docRef.id, ...fileData };
}

export async function getProjectFiles(projectId: string) {
    if (!db) return [];

    const q = query(
        collection(db, COLLECTION),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectFile));
}
