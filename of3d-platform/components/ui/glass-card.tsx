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
                "glass rounded-xl p-6 transition-all duration-300",
                hoverEffect && "glass-hover cursor-pointer hover:-translate-y-1 hover:shadow-lg",
                className
            )}
        >
            {children}
        </div>
    );
}
