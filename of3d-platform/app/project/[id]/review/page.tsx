"use client";

import { CanvasViewer } from "@/components/review/canvas-viewer";
import { CommentPin } from "@/components/review/comment-pin";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, MessageSquare, Send, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock Data
const MOCK_IMAGE = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop";

interface Comment {
    id: number;
    x: number;
    y: number;
    text: string;
    author: string;
    resolved: boolean;
}

export default function ReviewPage() {
    const [comments, setComments] = useState<Comment[]>([
        { id: 1, x: 30, y: 40, text: "Can we make this texture darker?", author: "Client", resolved: false },
        { id: 2, x: 60, y: 20, text: "Lighting looks great here!", author: "Designer", resolved: true },
    ]);
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
    const [newPin, setNewPin] = useState<{ x: number; y: number } | null>(null);
    const [newCommentText, setNewCommentText] = useState("");

    const handlePinClick = (x: number, y: number) => {
        setNewPin({ x, y });
        setSelectedCommentId(null);
    };

    const handleSaveComment = () => {
        if (!newPin || !newCommentText.trim()) return;

        const newComment: Comment = {
            id: comments.length + 1,
            x: newPin.x,
            y: newPin.y,
            text: newCommentText,
            author: "Me",
            resolved: false,
        };

        setComments([...comments, newComment]);
        setNewPin(null);
        setNewCommentText("");
        setSelectedCommentId(newComment.id);
    };

    const selectedComment = comments.find(c => c.id === selectedCommentId);

    return (
        <div className="h-screen flex flex-col bg-black overflow-hidden font-[family-name:var(--font-outfit)]">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md z-50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-white font-semibold">Luxury Apartment - View 01</h1>
                        <p className="text-xs text-muted-foreground">V2 • Posted 2 hours ago</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                        Compare V1
                    </button>
                    <button className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <Check className="w-4 h-4" /> Approve Stage
                    </button>
                </div>
            </header>

            {/* Main Area */}
            <div className="flex-1 flex relative">
                {/* Canvas */}
                <div className="flex-1 relative">
                    <CanvasViewer imageUrl={MOCK_IMAGE} onPinClick={handlePinClick}>
                        {comments.map((comment) => (
                            <CommentPin
                                key={comment.id}
                                x={comment.x}
                                y={comment.y}
                                number={comment.id}
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
                                    className="mt-2 w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-md hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send className="w-3 h-3" /> Post Comment
                                </button>
                            </GlassCard>
                        )}

                        {/* Comment List */}
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                onClick={() => setSelectedCommentId(comment.id)}
                                className={cn(
                                    "p-3 rounded-lg border transition-all cursor-pointer",
                                    selectedCommentId === comment.id
                                        ? "bg-white/10 border-white/30"
                                        : "bg-transparent border-white/5 hover:bg-white/5"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[10px] flex items-center justify-center font-bold">
                                            {comment.id}
                                        </span>
                                        <span className="text-xs font-medium text-gray-300">{comment.author}</span>
                                    </div>
                                    {comment.resolved && (
                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Resolved</span>
                                    )}
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
