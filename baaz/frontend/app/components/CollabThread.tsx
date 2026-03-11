"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Comment {
    author: string;
    body: string;
    timestamp: string;
}

interface CollabThreadProps {
    attackType: string;
}

export default function CollabThread({ attackType }: CollabThreadProps) {
    const { userEmail } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8000/comments/${attackType}`)
            .then(res => res.json())
            .then(data => setComments(data))
            .catch(console.error);
    }, [attackType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !userEmail) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`http://localhost:8000/comments/${attackType}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author: userEmail, body: newComment })
            });

            if (res.ok) {
                const savedComment = await res.json();
                setComments(prev => [...prev, savedComment]);
                setNewComment("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    function timeAgo(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "m ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " min ago";
        return Math.floor(seconds) + " sec ago";
    }

    return (
        <div className="mt-5 border border-border/50 rounded-lg bg-surface/30 overflow-hidden">
            <div className="bg-surface/50 px-4 py-2 border-b border-border/50 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-text-muted" />
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Student Discussion</span>
            </div>

            <div className="p-4 space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                {comments.length === 0 ? (
                    <p className="text-center text-xs text-text-muted italic py-4">No discussions yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((c, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <span className="text-sm font-semibold text-text-primary">{c.author.split('@')[0]}</span>
                                    <span className="text-[10px] text-text-muted font-mono">{timeAgo(c.timestamp)}</span>
                                </div>
                                <p className="text-sm text-text-secondary leading-relaxed bg-background/50 px-3 py-2 rounded-lg border border-border/30 inline-block">
                                    {c.body}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-3 bg-surface border-t border-border/50 flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share how you mitigated this..."
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50"
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-background p-2 rounded-lg transition-colors shrink-0"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
