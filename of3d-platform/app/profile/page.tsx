"use client";

import { useAuth } from "@/components/auth-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { updateUser } from "@/lib/db/users";
import { ArrowLeft, Camera, Loader2, Save, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user?.displayName) {
            setDisplayName(user.displayName);
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setMessage(null);

        try {
            await updateUser(user.uid, { displayName });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <p>Please log in to view this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black font-[family-name:var(--font-outfit)] p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                </div>

                <GlassCard className="p-8 space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 overflow-hidden group cursor-pointer">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-10 h-10 text-muted-foreground" />
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-white font-medium">{user.email}</p>
                            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Role</label>
                            <input
                                type="text"
                                value={user.role}
                                disabled
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-muted-foreground cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">Contact support to change your role.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Member Since</label>
                            <div className="text-white px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                                {new Date(user.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Changes
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
