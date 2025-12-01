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
    writeBatch,
    getDoc
} from "firebase/firestore";
import { ProjectStage, StageStatus } from "@/lib/types/schema";
import { createNotification } from "@/lib/db/notifications";
import { getProject } from "@/lib/db/projects";
import { sendNotificationEmail } from "@/app/actions";

const COLLECTION = "stages";

export const DEFAULT_STAGES = [
    "Briefing & Concept",
    "3D Modeling",
    "Texturing & Lighting",
    "Draft Render Review",
    "Final Polish"
];

export async function initializeProjectStages(projectId: string) {
    if (!db) throw new Error("Firestore not initialized");

    const batch = writeBatch(db);
    const now = Date.now();

    DEFAULT_STAGES.forEach((name, index) => {
        const stageRef = doc(collection(db, COLLECTION));
        const stageData: Omit<ProjectStage, "id"> = {
            projectId,
            stageNumber: index + 1,
            name,
            status: index === 0 ? 'IN_PROGRESS' : 'PENDING',
            createdAt: now,
            updatedAt: now,
        };
        batch.set(stageRef, stageData);
    });

    await batch.commit();
}

export async function getProjectStages(projectId: string) {
    if (!db) return [];
    const q = query(
        collection(db, COLLECTION),
        where("projectId", "==", projectId),
        orderBy("stageNumber", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectStage));
}

export async function updateStage(stageId: string, data: Partial<ProjectStage>) {
    if (!db) throw new Error("Firestore not initialized");
    const docRef = doc(db, COLLECTION, stageId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now()
    });
}

export async function advanceStage(currentStageId: string) {
    if (!db) throw new Error("Firestore not initialized");

    // 1. Get current stage
    const currentStageRef = doc(db, COLLECTION, currentStageId);
    const currentStageSnap = await getDoc(currentStageRef);
    if (!currentStageSnap.exists()) throw new Error("Stage not found");
    const currentStage = { id: currentStageSnap.id, ...currentStageSnap.data() } as ProjectStage;

    // 2. Get all stages to find next one and calculate progress
    const stages = await getProjectStages(currentStage.projectId);
    const sortedStages = stages.sort((a, b) => a.stageNumber - b.stageNumber);

    const currentIndex = sortedStages.findIndex(s => s.id === currentStageId);
    if (currentIndex === -1) throw new Error("Stage not found in project");

    const batch = writeBatch(db);

    // Approve current
    batch.update(currentStageRef, { status: 'APPROVED', updatedAt: Date.now() });

    // Activate next
    let nextStageName = "Completed";
    if (currentIndex < sortedStages.length - 1) {
        const nextStage = sortedStages[currentIndex + 1];
        const nextStageRef = doc(db, COLLECTION, nextStage.id);
        batch.update(nextStageRef, { status: 'IN_PROGRESS', updatedAt: Date.now() });
        nextStageName = nextStage.name;
    }

    // Update Project
    // Count currently approved + the one we are approving now
    const previouslyApproved = sortedStages.filter(s => s.status === 'APPROVED' && s.id !== currentStageId).length;
    const completedCount = previouslyApproved + 1;
    const progress = Math.round((completedCount / sortedStages.length) * 100);

    const projectRef = doc(db, "projects", currentStage.projectId);
    batch.update(projectRef, {
        progress,
        currentStageName: nextStageName,
        updatedAt: Date.now()
    });

    await batch.commit();

    // Notify Designer
    try {
        const project = await getProject(currentStage.projectId);
        if (project && project.designerId) {
            await createNotification({
                userId: project.designerId,
                title: "Stage Approved",
                message: `${currentStage.name} has been approved!`,
                type: "SUCCESS",
                link: `/project/${project.id}/review`
            });

            // Send Email
            await sendNotificationEmail(
                project.designerId,
                "Stage Approved!",
                `Great news! The stage "${currentStage.name}" has been approved by the client.`,
                `/project/${project.id}/review`
            );
        }
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
}
