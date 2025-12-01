"use client";

import { useEffect, useState } from "react";
import { Project } from "@/lib/types/schema";
import { getAvailableProjects, assignProjectToDesigner } from "@/lib/db/projects";
import { useAuth } from "@/components/auth-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { Loader2, ArrowRight } from "lucide-react";

interface AvailableProjectsListProps {
    onClaim: () => void;
}

export function AvailableProjectsList({ onClaim }: AvailableProjectsListProps) {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await getAvailableProjects();
            setProjects(data);
        } catch (error) {
            console.error("Error loading available projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (projectId: string) => {
        if (!user) return;
        setClaimingId(projectId);
        try {
            await assignProjectToDesigner(projectId, user.uid);
            await loadProjects(); // Refresh local list
            onClaim(); // Notify parent to refresh assigned list
        } catch (error) {
            console.error("Error claiming project:", error);
        } finally {
            setClaimingId(null);
        }
    };

    if (loading) {
        return <div className="text-muted-foreground text-sm">Loading available projects...</div>;
    }

    if (projects.length === 0) {
        return (
            <div className="text-muted-foreground text-sm p-4 border border-white/10 rounded-lg bg-white/5">
                No new projects available at the moment.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
                <GlassCard key={project.id} className="flex justify-between items-center p-4">
                    <div>
                        <h3 className="text-white font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description || "No description"}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{project.status}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleClaim(project.id)}
                        disabled={!!claimingId}
                        className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {claimingId === project.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Claim <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </GlassCard>
            ))}
        </div>
    );
}
