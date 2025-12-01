import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    orderBy,
    onSnapshot
} from "firebase/firestore";
import { Review } from "@/lib/types/schema";
import { createNotification } from "@/lib/db/notifications";
import { getProject } from "@/lib/db/projects";
import { sendNotificationEmail } from "@/app/actions";

const COLLECTION = "reviews";

export async function createComment(data: Omit<Review, "id" | "createdAt" | "updatedAt">) {
    if (!db) throw new Error("Firestore not initialized");
    const now = Date.now();
    const commentData = {
        ...data,
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION), commentData);

    // Send notification
    try {
        const project = await getProject(data.projectId);
        if (project) {
            const isClient = data.authorId === project.clientId;
            const recipientId = isClient ? project.designerId : project.clientId;

            if (recipientId) {
                await createNotification({
                    userId: recipientId,
                    title: "New Comment",
                    message: `New comment on ${project.title}`,
                    type: "INFO",
                    link: `/project/${project.id}/review`
                });

                // Send Email
                await sendNotificationEmail(
                    recipientId,
                    "New Comment on OF3D",
                    `You have a new comment on project "${project.title}".`,
                    `/project/${project.id}/review`
                );
            }
        }
    } catch (error) {
        console.error("Failed to send notification:", error);
    }

    return { id: docRef.id, ...commentData };
}

export async function getProjectComments(projectId: string) {
    if (!db) return [];
    const q = query(
        collection(db, COLLECTION),
        where("projectId", "==", projectId),
        orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
}

export async function resolveComment(commentId: string, resolved: boolean) {
    if (!db) throw new Error("Firestore not initialized");
    const docRef = doc(db, COLLECTION, commentId);
    await updateDoc(docRef, {
        resolved,
        updatedAt: Date.now()
    });
}

export function subscribeToProjectComments(projectId: string, callback: (comments: Review[]) => void) {
    if (!db) return () => { };

    const q = query(
        collection(db, COLLECTION),
        where("projectId", "==", projectId),
        orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        callback(comments);
    });
}
