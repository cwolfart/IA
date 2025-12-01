"use client";

import { ProjectCard } from "@/components/dashboard/project-card";
import { VisualTimeline } from "@/components/dashboard/visual-timeline";
import { GlassCard } from "@/components/ui/glass-card";
import { Bell, Plus, Search, Settings } from "lucide-react";

// Mock Data
const PROJECTS = [
    {
        id: 1,
        title: "Modern Villa - Dubai",
        status: "In Progress",
        image: "https://images.unsplash.com/photo-1600596542815-2495db98dada?q=80&w=2088&auto=format&fit=crop",
        date: "Dec 12, 2025",
        progress: 65,
    },
    {
        id: 2,
        title: "Tech Office HQ",
        status: "Review",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
        date: "Nov 28, 2025",
        progress: 90,
    },
    {
        id: 3,
        title: "Luxury Apartment",
        status: "Draft",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
        date: "Jan 05, 2026",
        progress: 10,
    },
];

const ACTIVE_STAGES = [
    { id: 1, name: "Briefing & Concept", status: "completed" as const },
    { id: 2, name: "3D Modeling", status: "completed" as const },
    { id: 3, name: "Texturing & Lighting", status: "current" as const },
    { id: 4, name: "Draft Render Review", status: "pending" as const },
    { id: 5, name: "Final Polish", status: "pending" as const },
];

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background font-[family-name:var(--font-outfit)] flex">
            {/* Sidebar (Simplified) */}
            <aside className="w-20 lg:w-64 border-r border-white/10 flex flex-col p-4 hidden md:flex">
                <div className="h-12 w-12 bg-white rounded-full mb-8 mx-auto lg:mx-0" />
                <nav className="space-y-4 flex-1">
                    {['Projects', 'Messages', 'Finances', 'Settings'].map((item) => (
                        <button key={item} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                            {item}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, Carlos</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <button className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 flex items-center gap-2">
                            <Plus className="w-5 h-5" /> New Project
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Projects Grid */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white">Active Projects</h2>
                            <button className="text-sm text-muted-foreground hover:text-white">View All</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {PROJECTS.map((project) => (
                                <ProjectCard key={project.id} {...project} />
                            ))}
                        </div>
                    </div>

                    {/* Active Project Timeline */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-semibold text-white">Current Focus</h2>
                        <GlassCard className="h-full">
                            <div className="mb-6">
                                <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">
                                    On Track
                                </span>
                                <h3 className="text-lg font-bold text-white mt-2">Modern Villa - Dubai</h3>
                                <p className="text-sm text-muted-foreground">Due in 5 days</p>
                            </div>
                            <VisualTimeline stages={ACTIVE_STAGES} />
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
