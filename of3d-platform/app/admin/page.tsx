"use client";

import { useAuth } from "@/components/auth-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { getAllProjects } from "@/lib/db/projects";
import { getAllUsers } from "@/lib/db/users";
import { Project, User } from "@/lib/types/schema";
import { cn } from "@/lib/utils";
import { ArrowLeft, Briefcase, LayoutDashboard, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users');

    useEffect(() => {
        async function fetchData() {
            if (user && user.role === 'ADMIN') {
                try {
                    const [usersData, projectsData] = await Promise.all([
                        getAllUsers(),
                        getAllProjects()
                    ]);
                    setUsers(usersData);
                    setProjects(projectsData);
                } catch (error) {
                    console.error("Failed to fetch admin data:", error);
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading) {
                setLoading(false);
            }
        }

        fetchData();
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
                <p className="text-xl font-bold">Access Denied</p>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                <Link href="/dashboard">
                    <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                        Return to Dashboard
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black font-[family-name:var(--font-outfit)] p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                            <p className="text-muted-foreground">Platform Overview</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={cn(
                            "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                            activeTab === 'users' ? "border-white text-white" : "border-transparent text-muted-foreground hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Users ({users.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={cn(
                            "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                            activeTab === 'projects' ? "border-white text-white" : "border-transparent text-muted-foreground hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Projects ({projects.length})
                        </div>
                    </button>
                </div>

                {/* Content */}
                <GlassCard className="overflow-hidden">
                    {activeTab === 'users' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-white">
                                <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Joined</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {users.map((u) => (
                                        <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                        {u.photoURL ? (
                                                            <img src={u.photoURL} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-xs">{u.displayName?.[0] || u.email[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{u.displayName || "No Name"}</p>
                                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-medium",
                                                    u.role === 'ADMIN' ? "bg-red-500/20 text-red-400" :
                                                        u.role === 'DESIGNER' ? "bg-blue-500/20 text-blue-400" :
                                                            "bg-green-500/20 text-green-400"
                                                )}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-white hover:underline">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-white">
                                <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Project</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Designer</th>
                                        <th className="px-6 py-4">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {projects.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium">{p.title}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full bg-white/10 text-xs">
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{p.clientId}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{p.designerId || "-"}</td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
