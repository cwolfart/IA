import { GlassCard } from "@/components/ui/glass-card";
import { ArrowUpRight, Calendar, MoreVertical } from "lucide-react";
import Image from "next/image";

interface ProjectCardProps {
    title: string;
    status: string;
    image: string;
    date: string;
    progress: number;
}

export function ProjectCard({ title, status, image, date, progress }: ProjectCardProps) {
    return (
        <GlassCard hoverEffect className="p-0 overflow-hidden group">
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="absolute top-4 right-4">
                    <button className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-md">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="inline-block px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-xs font-medium text-white mb-2 border border-white/10">
                                {status}
                            </span>
                            <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform cursor-pointer">
                        View <ArrowUpRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-white font-medium">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
