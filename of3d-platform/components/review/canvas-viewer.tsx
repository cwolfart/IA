"use client";

import { cn } from "@/lib/utils";
import { Minus, Plus, Undo2 } from "lucide-react";
import { useRef, useState } from "react";

interface CanvasViewerProps {
    imageUrl: string;
    children?: React.ReactNode; // For pins
    onPinClick?: (x: number, y: number) => void;
}

export function CanvasViewer({ imageUrl, children, onPinClick }: CanvasViewerProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag if middle mouse or spacebar held (simulated here by just dragging background)
        // For this demo, we'll allow dragging anywhere that isn't a pin
        if ((e.target as HTMLElement).closest('.pin-marker')) return;

        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.5, scale + delta), 4);
        setScale(newScale);
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (isDragging || (e.target as HTMLElement).closest('.pin-marker')) return;

        if (onPinClick && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Calculate relative coordinates (0-100%)
            const x = ((e.clientX - rect.left - position.x) / (rect.width * scale)) * 100;
            const y = ((e.clientY - rect.top - position.y) / (rect.height * scale)) * 100;

            if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
                onPinClick(x, y);
            }
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#050505] select-none group">
            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.5))} className="p-2 hover:bg-white/10 rounded-full text-white">
                    <Minus className="w-5 h-5" />
                </button>
                <span className="flex items-center px-2 text-sm font-mono text-white min-w-[3ch]">
                    {Math.round(scale * 100)}%
                </span>
                <button onClick={() => setScale(s => Math.min(4, s + 0.5))} className="p-2 hover:bg-white/10 rounded-full text-white">
                    <Plus className="w-5 h-5" />
                </button>
                <div className="w-px bg-white/10 mx-1" />
                <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }} className="p-2 hover:bg-white/10 rounded-full text-white">
                    <Undo2 className="w-5 h-5" />
                </button>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onClick={handleCanvasClick}
            >
                <div
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    }}
                    className="relative shadow-2xl"
                >
                    <img
                        src={imageUrl}
                        alt="Review Canvas"
                        className="max-w-none pointer-events-none"
                        draggable={false}
                    />
                    {/* Pins Overlay */}
                    <div className="absolute inset-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
