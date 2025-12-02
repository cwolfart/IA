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
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                        No messages yet. Start the conversation!
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                        <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[80%] rounded-lg p-3 text-sm",
                                isMe ? "bg-blue-600 text-white" : "bg-white/10 text-gray-200"
                            )}>
                                <p>{msg.text}</p>
                                <p className="text-[10px] opacity-50 mt-1 text-right">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isSending || !newMessage.trim()}
                        className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
