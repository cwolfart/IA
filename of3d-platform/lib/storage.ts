import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadProjectFile(file: File, projectId: string) {
    if (!storage) throw new Error("Storage not initialized");

    const storageRef = ref(storage, `projects/${projectId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
        name: file.name,
        url: downloadURL,
        path: snapshot.ref.fullPath
    };
}
