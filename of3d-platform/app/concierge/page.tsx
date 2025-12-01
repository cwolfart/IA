"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Upload, Loader2, X, FileIcon } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { createProject } from "@/lib/db/projects";
import { uploadProjectFile } from "@/lib/storage";
import { useRouter } from "next/navigation";

const STEPS = [
    { id: 1, title: "Project Type", description: "What are we building?" },
    { id: 2, title: "Details", description: "Scale and complexity" },
    { id: 3, title: "Assets", description: "Upload your files" },
    { id: 4, title: "Review", description: "Confirm details" },
];

export default function ConciergePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        type: "",
        title: "",
        description: "",
        files: [] as File[],
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFormData(prev => ({
                ...prev,
                files: [...prev.files, ...newFiles]
            }));
        }
    };

    const removeFile = (index: number) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const handleNext = async () => {
        if (currentStep === 4) {
            await handleSubmit();
        } else {
            setCurrentStep(prev => Math.min(4, prev + 1));
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            // 1. Create Project first to get ID
            const projectData = {
                title: formData.title || `${formData.type} Project`,
                description: formData.description,
                status: "DRAFT" as const,
                clientId: user.uid,
            };

            const newProject = await createProject(projectData);

            // 2. Upload Files if any
            if (formData.files.length > 0) {
                const uploadPromises = formData.files.map(file =>
                    uploadProjectFile(file, newProject.id)
                );

                await Promise.all(uploadPromises);
                // Note: In a real app we might update the project with file references here
            }

            router.push("/dashboard");
        } catch (error) {
            console.error("Error creating project:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                        onClick={() => setFormData({ ...formData, type })}
                                        className={cn(
                                            "h-40 rounded-xl border bg-white/5 transition-all flex flex-col items-center justify-center gap-4 group",
                                            formData.type === type
                                                ? "border-white bg-white/10"
                                                : "border-white/10 hover:bg-white/10 hover:border-white/30"
                                        )}
                                    >
                                        <span className="text-xl font-medium group-hover:scale-105 transition-transform">
                                            {type}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Project Details</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Project Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                        placeholder="e.g. Modern Villa in Dubai"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full h-32 bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
                                        placeholder="Describe the scope, style, and specific requirements..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="h-full flex flex-col">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5 p-12 cursor-pointer hover:bg-white/10 transition-colors"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    onChange={handleFileSelect}
                                />
                                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-medium mb-2">Drop your CAD/BIM files here</h3>
                                <p className="text-muted-foreground text-center max-w-sm mb-6">
                                    Support for .DWG, .RVT, .SKP, and .PDF. Max file size 500MB.
                                </p>
                                <button className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                                    Browse Files
                                </button>
                            </div>

                            {formData.files.length > 0 && (
                                <div className="mt-6 space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Selected Files</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {formData.files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded bg-white/10">
                                                        <FileIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{file.name}</p>
                                                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-muted-foreground hover:text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Review & Submit</h2>
                            <div className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Type</span>
                                        <span className="font-medium">{formData.type}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Title</span>
                                        <span className="font-medium">{formData.title || "Untitled"}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-sm text-muted-foreground block mb-1">Description</span>
                                        <p className="text-sm leading-relaxed text-gray-300">{formData.description || "No description provided."}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-sm text-muted-foreground block mb-1">Files</span>
                                        <p className="text-sm font-medium">{formData.files.length} file(s) attached</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Footer */}
                <div className="flex justify-between mt-8 pt-8 border-t border-white/10">
                    <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1 || isSubmitting}
                        className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting || (currentStep === 1 && !formData.type)}
                        className="px-6 py-2 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                            </>
                        ) : (
                            <>
                                {currentStep === 4 ? "Submit Project" : "Continue"}
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}
