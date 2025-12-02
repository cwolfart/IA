import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false }: GlassCardProps) {
    return (
        <div
            className={cn(
                "glass rounded-2xl p-6 transition-all duration-500 relative overflow-hidden group",
                hoverEffect && "glass-hover cursor-pointer hover:-translate-y-1",
                className
            )}
        >
            {/* Subtle Gradient Border Effect */}
            <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />

            {/* Inner Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
