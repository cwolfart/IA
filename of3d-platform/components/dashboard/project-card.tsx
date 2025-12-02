import { GlassCard } from "@/components/ui/glass-card";
import { ArrowUpRight, Calendar, MoreVertical } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface ProjectCardProps {
    title: string;
    status: string;
    image: string;
    date: string;
    progress: number;
}

export function ProjectCard({ title, status, image, date, progress }: ProjectCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <GlassCard hoverEffect className="p-0 overflow-hidden group h-full flex flex-col">
                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-md border border-white/10">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white mb-2 border border-white/10 shadow-sm">
                                    {status}
                                </span>
                                <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">{title}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-5 flex-1 flex flex-col justify-end bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">{date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform cursor-pointer font-medium text-xs uppercase tracking-wide">
                            View Project <ArrowUpRight className="w-3 h-3" />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase tracking-wider font-medium">
                            <span className="text-muted-foreground">Completion</span>
                            <span className="text-white">{progress}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
