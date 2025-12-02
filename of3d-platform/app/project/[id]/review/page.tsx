"use client";

import { CanvasViewer } from "@/components/review/canvas-viewer";
import { CommentPin } from "@/components/review/comment-pin";
import { VersionSlider } from "@/components/review/version-slider";
import { ImageGallery } from "@/components/review/image-gallery";
import { ChatPanel } from "@/components/chat/chat-panel";
import { FilesPanel } from "@/components/files/files-panel";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, MessageSquare, Send, X, Loader2, Upload, Image as ImageIcon, Menu } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createComment, subscribeToProjectComments, resolveComment } from "@/lib/db/reviews";
import { getProject, updateProject } from "@/lib/db/projects";
import { getProjectStages, updateStage, advanceStage } from "@/lib/db/stages";
import { createNotification } from "@/lib/db/notifications";
import { sendNotificationEmail } from "@/app/actions";
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
    const [activeTab, setActiveTab] = useState<'comments' | 'chat' | 'files'>('comments');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

                // Send Email
                await sendNotificationEmail(
                    project.clientId,
                    "New Render Available",
                    `A new render has been uploaded for stage "${currentStage?.name || 'Project'}". Check it out now!`,
                    `/project/${projectId}/review`
                );
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
        <div className="h-screen flex flex-col bg-background overflow-hidden font-[family-name:var(--font-outfit)]">
            {/* Header */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full text-white transition-all duration-300 hover:scale-105">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-white font-semibold tracking-tight">{project?.title || "Project Review"}</h1>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            {currentStage?.name || "Loading..."}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-full text-white transition-all duration-300 md:hidden"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    {activeImageUrl && previousStage?.assetsUrl && (
                        <button
                            onClick={() => setIsCompareMode(!isCompareMode)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hidden md:block",
                                isCompareMode
                                    ? "bg-white text-black hover:bg-gray-200 shadow-lg"
                                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                            )}
                        >
                            {isCompareMode ? "Exit Compare" : `Compare with ${previousStage.name}`}
                        </button>
                    )}
                    <button
                        onClick={handleApproveStage}
                        disabled={!currentStage || currentStage.status === 'APPROVED'}
                        className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        <Check className="w-4 h-4" /> <span className="hidden md:inline">Approve Stage</span>
                    </button>
                </div>
            </header>

            {/* Main Area */}
            <div className="flex-1 flex relative">
                {/* Canvas */}
                <div className="flex-1 relative bg-[#050505] animate-in fade-in duration-700">
                    {!activeImageUrl ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                            <div className="max-w-md w-full text-center space-y-6">
                                <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
                                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">No Render Uploaded</h2>
                                    <p className="text-muted-foreground">Upload a render to start the review process.</p>
                                </div>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-white/10 rounded-2xl bg-white/5 p-10 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group duration-300"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            <span className="text-sm text-muted-foreground">Uploading render...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-white block mb-1">Click to upload render</span>
                                                <span className="text-xs text-muted-foreground">JPG, PNG up to 20MB</span>
                                            </div>
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

                {/* Sidebar (Comments/Chat) */}
                <div className={cn(
                    "w-full md:w-96 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-40 shadow-2xl transition-all duration-300",
                    "fixed md:relative inset-y-0 right-0 top-16 md:top-0",
                    isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
                )}>
                    <div className="flex border-b border-white/5 p-1">
                        {['comments', 'chat', 'files'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-lg",
                                    activeTab === tab
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'files' ? (
                        <FilesPanel projectId={projectId} />
                    ) : activeTab === 'chat' ? (
                        <ChatPanel projectId={projectId} />
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* New Comment Form */}
                            {newPin && (
                                <GlassCard className="bg-blue-500/10 border-blue-500/30 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-blue-400 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                            New Comment #{comments.length + 1}
                                        </span>
                                        <button onClick={() => setNewPin(null)} className="text-muted-foreground hover:text-white transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <textarea
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        placeholder="Type your feedback..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500/50 min-h-[100px] resize-none placeholder:text-white/20"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveComment}
                                        disabled={isSubmitting}
                                        className="mt-3 w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-blue-500/20"
                                    >
                                        {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                        Post Comment
                                    </button>
                                </GlassCard>
                            )}

                            {/* Comment List */}
                            {comments.length === 0 && !newPin && (
                                <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 opacity-50" />
                                    </div>
                                    <p>No comments yet.<br />Click on the image to add one.</p>
                                </div>
                            )}

                            {comments.map((comment, index) => (
                                <div
                                    key={comment.id}
                                    onClick={() => setSelectedCommentId(comment.id)}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden",
                                        selectedCommentId === comment.id
                                            ? "bg-white/10 border-white/20 shadow-lg"
                                            : "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold shadow-inner",
                                                selectedCommentId === comment.id ? "bg-white text-black" : "bg-white/10 text-white"
                                            )}>
                                                {index + 1}
                                            </span>
                                            <span className="text-xs font-bold text-gray-300">User</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleResolve(comment.id, comment.resolved);
                                            }}
                                            className={cn(
                                                "text-[10px] px-2 py-1 rounded-full transition-all font-medium border",
                                                comment.resolved
                                                    ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                                    : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            {comment.resolved ? "Resolved" : "Resolve"}
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-300 pl-9 leading-relaxed">{comment.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
