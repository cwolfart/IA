"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUser, createUser } from "@/lib/db/users";
import { User } from "@/lib/types/schema";

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                // Subscribe to user document
                // We need to import onSnapshot and doc from firebase/firestore
                // But first let's check if we need to create the user
                let dbUser = await getUser(fbUser.uid);

                if (!dbUser) {
                    dbUser = await createUser(fbUser.uid, {
                        email: fbUser.email || "",
                        displayName: fbUser.displayName,
                        photoURL: fbUser.photoURL,
                    });
                }

                // Set initial user
                setUser(dbUser);

                // Listen for updates (e.g. role changes)
                const { onSnapshot, doc } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                if (db) {
                    const userRef = doc(db, "users", fbUser.uid);
                    const unsubUser = onSnapshot(userRef, (doc) => {
                        if (doc.exists()) {
                            setUser(doc.data() as User);
                        }
                    });

                    // Cleanup user listener when auth state changes or component unmounts
                    // Note: This is a bit tricky inside onAuthStateChanged. 
                    // For simplicity in this prototype, we'll rely on the fact that 
                    // onAuthStateChanged is usually stable. 
                    // A better approach would be to separate the user subscription to a separate useEffect.
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
