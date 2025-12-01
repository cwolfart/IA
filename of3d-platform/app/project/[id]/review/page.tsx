"use client";

import { CanvasViewer } from "@/components/review/canvas-viewer";
import { CommentPin } from "@/components/review/comment-pin";
import { VersionSlider } from "@/components/review/version-slider";
import { ImageGallery } from "@/components/review/image-gallery";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, MessageSquare, Send, X, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createComment, subscribeToProjectComments, resolveComment } from "@/lib/db/reviews";
import { getProject, updateProject } from "@/lib/db/projects";
import { getProjectStages, updateStage, advanceStage } from "@/lib/db/stages";
import { createNotification } from "@/lib/db/notifications";
import { uploadProjectFile } from "@/lib/storage";
import { Review, Project, ProjectStage } from "@/lib/types/schema";

export default function ReviewPage() {
    const params = useParams();
    const projectId = params.id as string;
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [project, setProject] = useState<Project | null>(null);
    const [stages, setStages] = useState<ProjectStage[]>([]);
    const [currentStage, setCurrentStage] = useState<ProjectStage | null>(null);
    const [previousStage, setPreviousStage] = useState<ProjectStage | null>(null);
    const [comments, setComments] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const [newPin, setNewPin] = useState<{ x: number; y: number } | null>(null);
    const [newCommentText, setNewCommentText] = useState("");
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Temporary state to hold the uploaded image URL for this session
    // In a real app, this would be stored in the Project or ProjectStage document
    const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId) return;

        // Load project data
        const fetchProject = async () => {
            try {
                const projectData = await getProject(projectId);
                setProject(projectData);

                const stagesData = await getProjectStages(projectId);
                setStages(stagesData);

                // Find current stage
                const active = stagesData.find(s => s.status === 'IN_PROGRESS' || s.status === 'REVIEW')
                    || stagesData.find(s => s.status === 'PENDING')
                    || stagesData[stagesData.length - 1];

                setCurrentStage(active || null);

                // Find previous stage for comparison
                if (active && active.stageNumber > 1) {
                    const prev = stagesData.find(s => s.stageNumber === active.stageNumber - 1);
                    setPreviousStage(prev || null);
                }

                if (active?.assetsUrl) {
                    setActiveImageUrl(active.assetsUrl);
                } else if (projectData?.imageUrl) {
                    setActiveImageUrl(projectData.imageUrl);
                }
            } catch (error) {
                console.error("Error loading project:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProject();

        // Subscribe to comments
        const unsubscribe = subscribeToProjectComments(projectId, (newComments) => {
            setComments(newComments);
        });

        return () => unsubscribe();
    }, [projectId]);

    const handlePinClick = (x: number, y: number) => {
        setNewPin({ x, y });
        setSelectedCommentId(null);
    };

    const handleSaveComment = async () => {
        if (!newPin || !newCommentText.trim() || !user) return;
        setIsSubmitting(true);

        try {
            const newComment = await createComment({
                projectId,
                x: newPin.x,
                y: newPin.y,
                text: newCommentText,
                authorId: user.uid,
                resolved: false,
                stageId: currentStage?.id || "default-stage",
            });

            setNewPin(null);
            setNewCommentText("");
            setSelectedCommentId(newComment.id);
        } catch (error) {
            console.error("Error saving comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolve = async (commentId: string, currentStatus: boolean) => {
        try {
            await resolveComment(commentId, !currentStatus);
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    const handleApproveStage = async () => {
        if (!currentStage) return;
        try {
            await advanceStage(currentStage.id);
            window.location.reload();
        } catch (error) {
            console.error("Error approving stage:", error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsUploading(true);
        try {
            const result = await uploadProjectFile(file, projectId);
            setActiveImageUrl(result.url);

            // Update stage with new image URL
            if (currentStage) {
                const updatedImages = [...(currentStage.images || []), result.url];

                await updateStage(currentStage.id, {
                    assetsUrl: result.url, // Set as active/latest
                    images: updatedImages,
                    status: 'REVIEW'
                });

                setStages(prev => prev.map(s => s.id === currentStage.id ? {
                    ...s,
                    assetsUrl: result.url,
                    images: updatedImages,
                    status: 'REVIEW'
                } : s));

                setCurrentStage(prev => prev ? {
                    ...prev,
                    assetsUrl: result.url,
                    images: updatedImages,
                    status: 'REVIEW'
                } : null);
            } else {
                // Fallback for projects without stages
                await updateProject(projectId, { imageUrl: result.url });
                setProject(prev => prev ? { ...prev, imageUrl: result.url } : null);
            }

            // Notify Client (if user is designer)
            if (user && project && user.role === 'DESIGNER') {
                await createNotification({
                    userId: project.clientId,
                    title: "New Render Uploaded",
                    message: `A new render is available for review in ${currentStage?.name || 'Project'}`,
                    type: "INFO",
                    link: `/project/${projectId}/review`
                });
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-black overflow-hidden font-[family-name:var(--font-outfit)]">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md z-50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-white font-semibold">{project?.title || "Project Review"}</h1>
                        <p className="text-xs text-muted-foreground">{currentStage?.name || "Loading..."} • {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {activeImageUrl && previousStage?.assetsUrl && (
                        <button
                            onClick={() => setIsCompareMode(!isCompareMode)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                isCompareMode
                                    ? "bg-white text-black hover:bg-gray-200"
                                    : "bg-white/10 text-white hover:bg-white/20"
                            )}
                        >
                            {isCompareMode ? "Exit Compare" : `Compare with ${previousStage.name}`}
                        </button>
                    )}
                    <button
                        onClick={handleApproveStage}
                        disabled={!currentStage || currentStage.status === 'APPROVED'}
                        className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check className="w-4 h-4" /> Approve Stage
                    </button>
                </div>
            </header>

            {/* Main Area */}
            <div className="flex-1 flex relative">
                {/* Canvas */}
                <div className="flex-1 relative bg-[#050505]">
                    {!activeImageUrl ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                            <div className="max-w-md w-full text-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-2">No Render Uploaded</h2>
                                    <p className="text-muted-foreground">Upload a render to start the review process.</p>
                                </div>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-white/10 rounded-xl bg-white/5 p-8 cursor-pointer hover:bg-white/10 transition-all group"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            <span className="text-sm text-muted-foreground">Uploading render...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-white transition-colors" />
                                            <span className="text-sm font-medium text-white">Click to upload render</span>
                                            <span className="text-xs text-muted-foreground">JPG, PNG up to 20MB</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : isCompareMode && previousStage?.assetsUrl && activeImageUrl ? (
                        <VersionSlider
                            beforeImage={previousStage.assetsUrl}
                            afterImage={activeImageUrl}
                            beforeLabel={previousStage.name}
                            afterLabel={currentStage?.name || "Current"}
                        />
                    ) : (
                        <CanvasViewer imageUrl={activeImageUrl} onPinClick={handlePinClick}>
                            {comments.map((comment, index) => (
                                <CommentPin
                                    key={comment.id}
                                    x={comment.x}
                                    y={comment.y}
                                    number={index + 1}
                                    isSelected={selectedCommentId === comment.id}
                                    onClick={() => {
                                        setSelectedCommentId(comment.id);
                                        setNewPin(null);
                                    }}
                                />
                            ))}
                            {newPin && (
                                <CommentPin
                                    x={newPin.x}
                                    y={newPin.y}
                                    number={comments.length + 1}
                                    isNew
                                    isSelected
                                />
                            )}
                        </CanvasViewer>
                    )}

                    {/* Image Gallery */}
                    {currentStage && (currentStage.images?.length || 0) > 0 && !isCompareMode && (
                        <ImageGallery
                            images={currentStage.images || []}
                            activeImage={activeImageUrl}
                            onSelect={setActiveImageUrl}
                            onUploadClick={() => fileInputRef.current?.click()}
                        />
                    )}
                </div>

                {/* Sidebar (Comments) */}
                <div className="w-80 border-l border-white/10 bg-[#0a0a0a] flex flex-col">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Comments ({comments.length})
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* New Comment Form */}
                        {newPin && (
                            <GlassCard className="bg-blue-500/10 border-blue-500/30 animate-in slide-in-from-right-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-blue-400">New Comment #{comments.length + 1}</span>
                                    <button onClick={() => setNewPin(null)} className="text-muted-foreground hover:text-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                <textarea
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Type your feedback..."
                                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveComment}
                                    disabled={isSubmitting}
                                    className="mt-2 w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-md hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                    Post Comment
                                </button>
                            </GlassCard>
                        )}

                        {/* Comment List */}
                        {comments.length === 0 && !newPin && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No comments yet. <br /> Click on the image to add one.
                            </div>
                        )}

                        {comments.map((comment, index) => (
                            <div
                                key={comment.id}
                                onClick={() => setSelectedCommentId(comment.id)}
                                className={cn(
                                    "p-3 rounded-lg border transition-all cursor-pointer group",
                                    selectedCommentId === comment.id
                                        ? "bg-white/10 border-white/30"
                                        : "bg-transparent border-white/5 hover:bg-white/5"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[10px] flex items-center justify-center font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="text-xs font-medium text-gray-300">User</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleResolve(comment.id, comment.resolved);
                                        }}
                                        className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded transition-colors",
                                            comment.resolved
                                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                                : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                        )}
                                    >
                                        {comment.resolved ? "Resolved" : "Resolve"}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-300 pl-7">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
