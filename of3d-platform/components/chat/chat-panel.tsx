"use client";

import { useAuth } from "@/components/auth-provider";
import { sendMessage, subscribeToMessages } from "@/lib/db/chat";
import { Message } from "@/lib/types/schema";
import { cn } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatPanelProps {
    projectId: string;
}

export function ChatPanel({ projectId }: ChatPanelProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeToMessages(projectId, (data) => {
            setMessages(data);
            // Scroll to bottom on new message
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        });
        return () => unsubscribe();
    }, [projectId]);

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return;
        setIsSending(true);
        try {
            await sendMessage(projectId, user.uid, newMessage);
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-12 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <Send className="w-4 h-4 opacity-50" />
                        </div>
                        <p>No messages yet.<br />Start the conversation!</p>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                        <div key={msg.id} className={cn("flex animate-in slide-in-from-bottom-2 duration-300", isMe ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm",
                                isMe
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white/10 text-gray-200 rounded-bl-none border border-white/5"
                            )}>
                                <p className="leading-relaxed">{msg.text}</p>
                                <p className={cn(
                                    "text-[10px] mt-1.5 text-right",
                                    isMe ? "text-blue-200" : "text-gray-500"
                                )}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>
            <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
                <div className="flex gap-3 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isSending || !newMessage.trim()}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all disabled:opacity-50 disabled:hover:bg-blue-600 hover:scale-105 shadow-lg shadow-blue-500/20"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
