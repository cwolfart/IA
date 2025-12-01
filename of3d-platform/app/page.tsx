import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, Box, Layers, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-outfit)]">
      <main className="flex flex-col gap-8 items-center sm:items-start max-w-4xl w-full">
        <div className="w-full text-center sm:text-left mb-8">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            OF3D Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            The premium marketplace for architectural visualization. Connect with the world's top 1% of 3D artists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <GlassCard hoverEffect className="flex flex-col gap-4">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Premium Talent</h3>
            <p className="text-sm text-muted-foreground">Access certified OF3D Academy graduates.</p>
          </GlassCard>

          <GlassCard hoverEffect className="flex flex-col gap-4">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Live Review</h3>
            <p className="text-sm text-muted-foreground">Real-time visual feedback on your renders.</p>
          </GlassCard>

          <GlassCard hoverEffect className="flex flex-col gap-4">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Fast Turnaround</h3>
            <p className="text-sm text-muted-foreground">AI-powered matching for speed.</p>
          </GlassCard>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <Link
            href="/login"
            className="rounded-full bg-foreground text-background px-8 py-3 text-sm font-medium hover:bg-[#383838] hover:text-white transition-colors flex items-center gap-2"
          >
            Start Project <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-white/20 px-8 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </main>
    </div>
  );
}
