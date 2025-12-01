import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc
} from "firebase/firestore";
import { Project } from "@/lib/types/schema";

import { initializeProjectStages } from "@/lib/db/stages";

const COLLECTION = "projects";

export async function createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">) {
    if (!db) throw new Error("Firestore not initialized");
    const now = Date.now();
    const projectData = {
        ...data,
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION), projectData);

    // Initialize default stages
    await initializeProjectStages(docRef.id);

    return { id: docRef.id, ...projectData };
}

export async function getProject(id: string): Promise<Project | null> {
    if (!db) return null;
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Project;
    }
    return null;
}

import { Role } from "@/lib/types/schema";

export async function getUserProjects(userId: string, role: Role) {
    if (!db) return [];
    let q;

    if (role === "ADMIN") {
        q = query(collection(db, COLLECTION));
    } else {
        const field = role === "CLIENT" ? "clientId" : "designerId";
        q = query(collection(db, COLLECTION), where(field, "==", userId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function getAvailableProjects() {
    if (!db) return [];
    // In a real app, we would use a more specific query or a composite index
    // For now, fetching all and filtering is safest for prototype
    const q = query(collection(db, COLLECTION));
    const snapshot = await getDocs(q);

    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Project))
        .filter(p => !p.designerId);
}

export async function assignProjectToDesigner(projectId: string, designerId: string) {
    if (!db) throw new Error("Firestore not initialized");
    const projectRef = doc(db, COLLECTION, projectId);
    await updateDoc(projectRef, {
        designerId,
        status: "MATCHING", // Or IN_PROGRESS depending on workflow
        updatedAt: Date.now()
    });
}

export async function updateProject(projectId: string, data: Partial<Project>) {
    if (!db) throw new Error("Firestore not initialized");
    const docRef = doc(db, COLLECTION, projectId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now()
    });
}
