import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface TimelineProps {
    stages: { id: number; name: string; status: "completed" | "current" | "pending" }[];
}

export function VisualTimeline({ stages }: TimelineProps) {
    return (
        <div className="relative">
            {/* Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

            <div className="space-y-8">
                {stages.map((stage, index) => (
                    <div key={stage.id} className="relative flex gap-6 items-start group">
                        {/* Dot */}
                        <div
                            className={cn(
                                "relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                                stage.status === "completed" && "border-green-500 text-green-500",
                                stage.status === "current" && "border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]",
                                stage.status === "pending" && "border-white/10 text-muted-foreground"
                            )}
                        >
                            {stage.status === "completed" && <CheckCircle2 className="w-6 h-6" />}
                            {stage.status === "current" && <Clock className="w-6 h-6 animate-pulse" />}
                            {stage.status === "pending" && <Circle className="w-6 h-6" />}
                        </div>

                        {/* Content */}
                        <GlassCard
                            className={cn(
                                "flex-1 p-4 transition-all duration-300",
                                stage.status === "current" ? "bg-white/5 border-white/20" : "opacity-70"
                            )}
                        >
                            <h4 className={cn("font-semibold text-lg", stage.status === "current" ? "text-white" : "text-muted-foreground")}>
                                {stage.name}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                {stage.status === "completed" ? "Completed" : stage.status === "current" ? "In Progress" : "Waiting"}
                            </p>
                        </GlassCard>
                    </div>
                ))}
            </div>
        </div>
    );
}
