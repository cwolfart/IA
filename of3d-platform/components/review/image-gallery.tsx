"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Image from "next/image";

interface ImageGalleryProps {
    images: string[];
    activeImage: string | null;
    onSelect: (image: string) => void;
    onUploadClick: () => void;
}

export function ImageGallery({ images, activeImage, onSelect, onUploadClick }: ImageGalleryProps) {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 z-40 overflow-x-auto max-w-[90vw]">
            {images.map((img, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(img)}
                    className={cn(
                        "relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                        activeImage === img ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                >
                    <Image
                        src={img}
                        alt={`View ${index + 1}`}
                        fill
                        className="object-cover"
                    />
                </button>
            ))}

            <button
                onClick={onUploadClick}
                className="w-12 h-12 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                title="Add View"
            >
                <Plus className="w-5 h-5 text-white" />
            </button>
        </div>
    );
}
