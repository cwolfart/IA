"use client";

import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface CommentPinProps {
    x: number;
    y: number;
    number: number;
    isNew?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
}

export function CommentPin({ x, y, number, isNew, isSelected, onClick }: CommentPinProps) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
            className={cn(
                "pin-marker absolute -translate-x-1/2 -translate-y-1/2 group transition-transform hover:scale-110 z-10",
                isSelected ? "z-20 scale-125" : ""
            )}
            style={{ left: `${x}%`, top: `${y}%` }}
        >
            <div className={cn(
                "relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 transition-colors",
                isNew ? "bg-blue-500 border-blue-200 text-white animate-bounce" :
                    isSelected ? "bg-white border-white text-black" : "bg-black/60 border-white/50 text-white backdrop-blur-sm"
            )}>
                <span className="text-xs font-bold">{number}</span>

                {/* Tooltip/Icon on hover */}
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    Click to view
                </div>
            </div>

            {/* Pulse effect for new comments */}
            {isNew && (
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75 -z-10" />
            )}
        </button>
    );
}
