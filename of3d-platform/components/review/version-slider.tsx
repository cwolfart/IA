"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { MoveHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VersionSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
}

export function VersionSlider({
    beforeImage,
    afterImage,
    beforeLabel = "Version 1",
    afterLabel = "Version 2"
}: VersionSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (event: MouseEvent | TouchEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const position = ((x - rect.left) / rect.width) * 100;

        setSliderPosition(Math.min(Math.max(position, 0), 100));
    };

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div className="relative w-full h-full overflow-hidden select-none group" ref={containerRef}>
            {/* After Image (Background) */}
            <img
                src={afterImage}
                alt={afterLabel}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
            />

            {/* Before Image (Clipped) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
            >
                <img
                    src={beforeImage}
                    alt={beforeLabel}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: 'none' }} // Counter-scale to keep image static
                    draggable={false}
                />
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-shadow"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                    <MoveHorizontal className="w-4 h-4" />
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 z-10">
                <GlassCard className="px-3 py-1 text-xs font-bold bg-black/50 border-white/20 text-white">
                    {beforeLabel}
                </GlassCard>
            </div>
            <div className="absolute top-4 right-4 z-10">
                <GlassCard className="px-3 py-1 text-xs font-bold bg-black/50 border-white/20 text-white">
                    {afterLabel}
                </GlassCard>
            </div>
        </div>
    );
}
