"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Upload } from "lucide-react";
import { useState } from "react";

const STEPS = [
    { id: 1, title: "Project Type", description: "What are we building?" },
    { id: 2, title: "Details", description: "Scale and complexity" },
    { id: 3, title: "Assets", description: "Upload your files" },
    { id: 4, title: "Review", description: "Confirm details" },
];

export default function ConciergePage() {
    const [currentStep, setCurrentStep] = useState(1);

    return (
        <div className="min-h-screen flex flex-col items-center p-8 font-[family-name:var(--font-outfit)]">
            {/* Progress Header */}
            <div className="w-full max-w-4xl mb-12">
                <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 h-0.5 w-full bg-white/10 -z-10" />
                    {STEPS.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-4">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                    currentStep >= step.id
                                        ? "bg-white border-white text-black"
                                        : "bg-black border-white/20 text-muted-foreground"
                                )}
                            >
                                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    currentStep >= step.id ? "text-white" : "text-muted-foreground"
                                )}
                            >
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <GlassCard className="w-full max-w-4xl min-h-[500px] flex flex-col">
                <div className="flex-1">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">What type of project is this?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {["Residential", "Commercial", "Interior"].map((type) => (
                                    <button
                                        key={type}
                                        className="h-40 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all flex flex-col items-center justify-center gap-4 group"
                                    >
                                        <span className="text-xl font-medium group-hover:scale-105 transition-transform">
                                            {type}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Placeholder for other steps */}
                    {currentStep === 3 && (
                        <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-white/10 rounded-xl bg-white/5 p-12">
                            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-medium mb-2">Drop your CAD/BIM files here</h3>
                            <p className="text-muted-foreground text-center max-w-sm">
                                Support for .DWG, .RVT, .SKP, and .PDF. Max file size 500MB.
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigation Footer */}
                <div className="flex justify-between mt-8 pt-8 border-t border-white/10">
                    <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                        className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                        className="px-6 py-2 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        {currentStep === 4 ? "Submit Project" : "Continue"}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}
