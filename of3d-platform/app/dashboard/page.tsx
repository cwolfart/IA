"use client";

import { ProjectCard } from "@/components/dashboard/project-card";
import { VisualTimeline } from "@/components/dashboard/visual-timeline";
import { AvailableProjectsList } from "@/components/dashboard/available-projects-list";
import { GlassCard } from "@/components/ui/glass-card";
import { Bell, Plus, Search } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { auth } from "@/lib/firebase";
import { getUserProjects } from "@/lib/db/projects";
import { useEffect, useState } from "react";
import { Project, ProjectStage, Notification } from "@/lib/types/schema";
import { getProjectStages } from "@/lib/db/stages";
import { subscribeToNotifications, markAllAsRead } from "@/lib/db/notifications";
import Link from "next/link";
import { cn } from "@/lib/utils";



import { MobileNav } from "@/components/dashboard/mobile-nav";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [activeProjectStages, setActiveProjectStages] = useState<ProjectStage[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        async function fetchProjects() {
            if (user) {
                try {
                    const data = await getUserProjects(user.uid, user.role);
                    setProjects(data);

                    // Load stages for the first project (Current Focus)
                    if (data.length > 0) {
                        const firstProject = data[0];
                        setActiveProject(firstProject);
                        const stages = await getProjectStages(firstProject.id);
                        setActiveProjectStages(stages);
                    }
                } catch (error) {
                    console.error("Failed to fetch projects:", error);
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading) {
                setLoading(false);
            }
        }

        fetchProjects();

        // Subscribe to notifications
        let unsubscribeNotifications: () => void;
        if (user) {
            unsubscribeNotifications = subscribeToNotifications(user.uid, (data) => {
                setNotifications(data);
            });
        }

        return () => {
            if (unsubscribeNotifications) unsubscribeNotifications();
        };
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-[family-name:var(--font-outfit)] flex overflow-hidden">
            {/* Background Ambient Light */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Sidebar (Simplified) */}
            <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col p-4 hidden md:flex z-10 bg-black/20 backdrop-blur-sm">
                <div className="h-12 w-12 bg-white rounded-xl mb-8 mx-auto lg:mx-0 shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                <nav className="space-y-2 flex-1">
                    {['Projects', 'Messages'].map((item) => (
                        <button key={item} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all duration-300 group flex items-center gap-3">
                            <span className="w-1 h-1 rounded-full bg-transparent group-hover:bg-white transition-colors" />
                            {item}
                        </button>
                    ))}
                    <Link href="/finances">
                        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all duration-300 group flex items-center gap-3">
                            <span className="w-1 h-1 rounded-full bg-transparent group-hover:bg-white transition-colors" />
                            Finances
                        </button>
                    </Link>
                    <Link href="/profile">
                        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all duration-300 group flex items-center gap-3">
                            <span className="w-1 h-1 rounded-full bg-transparent group-hover:bg-white transition-colors" />
                            Settings
                        </button>
                    </Link>
                    {user?.role === 'ADMIN' && (
                        <Link href="/admin">
                            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-300 group flex items-center gap-3">
                                <span className="w-1 h-1 rounded-full bg-transparent group-hover:bg-red-400 transition-colors" />
                                Admin Panel
                            </button>
                        </Link>
                    )}
                    <button
                        onClick={() => auth.signOut().then(() => window.location.href = '/login')}
                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-300 mt-auto flex items-center gap-3"
                    >
                        <span className="w-1 h-1 rounded-full bg-transparent hover:bg-red-400 transition-colors" />
                        Sign Out
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto relative z-10">
                {/* Header */}
                <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-4">
                        <MobileNav />
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
                            <p className="text-muted-foreground mt-1">Welcome back, {user?.displayName || 'User'}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300 hover:scale-105">
                            <Search className="w-5 h-5" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications && unreadCount > 0 && user) {
                                        markAllAsRead(user.uid);
                                    }
                                }}
                                className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white relative transition-all duration-300 hover:scale-105"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-96 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <GlassCard className="max-h-96 overflow-y-auto border-white/10 shadow-2xl">
                                        <h3 className="text-sm font-semibold text-white mb-4">Notifications</h3>
                                        <div className="space-y-3">
                                            {notifications.length === 0 ? (
                                                <p className="text-xs text-muted-foreground text-center py-4">No new notifications</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className={cn("p-4 rounded-xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10", !n.read && "border-l-2 border-l-blue-500")}>
                                                        <p className="text-sm text-white font-medium">{n.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                                                        <p className="text-[10px] text-muted-foreground mt-2 text-right">{new Date(n.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </GlassCard>
                                </div>
                            )}
                        </div>
                        {user?.role === 'CLIENT' && (
                            <Link href="/concierge">
                                <button className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    <Plus className="w-5 h-5" /> New Project
                                </button>
                            </Link>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Projects Grid */}
                    <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white">
                                {user?.role === 'DESIGNER' ? 'My Projects' : 'Active Projects'}
                            </h2>
                            <button className="text-sm text-muted-foreground hover:text-white transition-colors">View All</button>
                        </div>

                        {projects.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                <p className="text-muted-foreground mb-6">
                                    {user?.role === 'DESIGNER'
                                        ? "No projects assigned yet."
                                        : "No projects found."}
                                </p>
                                {user?.role === 'CLIENT' && (
                                    <Link href="/concierge">
                                        <button className="px-6 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition-all hover:scale-105">
                                            Create your first project
                                        </button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projects.map((project) => (
                                    <Link key={project.id} href={`/project/${project.id}/review`} className="block group">
                                        <ProjectCard
                                            title={project.title}
                                            status={project.currentStageName || project.status}
                                            image={project.imageUrl || "https://images.unsplash.com/photo-1600596542815-2495db98dada?q=80&w=2088&auto=format&fit=crop"}
                                            date={new Date(project.createdAt).toLocaleDateString()}
                                            progress={project.progress || 0}
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Designer: Available Projects to Claim */}
                        {user?.role === 'DESIGNER' && (
                            <div className="mt-12 space-y-6">
                                <h2 className="text-xl font-semibold text-white">Available Projects</h2>
                                <AvailableProjectsList onClaim={async () => {
                                    // Refresh projects list
                                    if (user) {
                                        const data = await getUserProjects(user.uid, user.role);
                                        setProjects(data);
                                    }
                                }} />
                            </div>
                        )}
                    </div>

                    {/* Active Project Timeline */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <h2 className="text-xl font-semibold text-white">Current Focus</h2>
                        <GlassCard className="h-full border-white/10" hoverEffect>
                            {activeProject ? (
                                <>
                                    <div className="mb-8">
                                        <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                                            IN PROGRESS
                                        </span>
                                        <h3 className="text-2xl font-bold text-white mt-4">{activeProject.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {activeProject.currentStageName || "Iniciando..."}
                                        </p>
                                    </div>
                                    <VisualTimeline stages={activeProjectStages.map(s => ({
                                        id: s.stageNumber,
                                        name: s.name,
                                        status: s.status === 'APPROVED' ? 'completed' :
                                            (s.status === 'IN_PROGRESS' || s.status === 'REVIEW') ? 'current' : 'pending'
                                    }))} />
                                </>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    No active project at the moment.
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </div>
                {/* Dev Tool: Role Switcher */}
                <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-xl border border-white/10 backdrop-blur-md z-50 shadow-2xl">
                    <p className="text-xs text-muted-foreground mb-2 font-mono">DEV TOOLS</p>
                    <div className="flex items-center gap-3">
                        <span className="text-xs">Role: <span className="font-bold text-blue-400">{user?.role}</span></span>
                        <button
                            onClick={async () => {
                                if (!user) return;
                                const newRole = user.role === 'CLIENT' ? 'DESIGNER' : 'CLIENT';
                                try {
                                    const { updateUser } = await import("@/lib/db/users");
                                    await updateUser(user.uid, { role: newRole });
                                    window.location.reload();
                                } catch (e) {
                                    console.error(e);
                                }
                            }}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors font-medium"
                        >
                            Switch to {user?.role === 'CLIENT' ? 'DESIGNER' : 'CLIENT'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
