"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Wifi, WifiOff, CheckCircle2, XCircle } from "lucide-react";

interface FeedEvent {
    type: "probe" | "complete" | "error";
    probe?: number;
    attack_type?: string;
    success?: boolean;
    severity?: string;
    exposed?: string;
    payload_preview?: string;
    message?: string;
}

interface LiveFeedProps {
    events: FeedEvent[];
    isScanning: boolean;
    scanId: string | null;
}

const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: "text-accent-red",
    HIGH: "text-accent-orange",
    MEDIUM: "text-accent-yellow",
    LOW: "text-accent-green",
    NONE: "text-text-muted",
};

const ATTACK_ICONS: Record<string, string> = {
    prompt_injection: "💉",
    jailbreaking: "🔓",
    data_extraction: "📤",
    privilege_escalation: "⬆️",
};

export default function LiveFeed({ events, isScanning, scanId }: LiveFeedProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [events.length]);

    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[420px]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-surface/80">
                <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-text-primary font-mono">Live Attack Feed</span>
                </div>
                <div className="flex items-center gap-2">
                    {isScanning ? (
                        <span className="flex items-center gap-1.5 text-xs font-mono text-accent-green">
                            <span className="relative flex h-2 w-2">
                                <span className="ping-ring absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                            </span>
                            SCANNING
                        </span>
                    ) : events.length > 0 ? (
                        <span className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                            COMPLETED
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
                            <WifiOff className="w-3.5 h-3.5" />
                            IDLE
                        </span>
                    )}
                    {scanId && (
                        <span className="text-[10px] font-mono text-text-muted">
                            {scanId.slice(0, 8)}...
                        </span>
                    )}
                </div>
            </div>

            {/* Feed content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-xs">
                {events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted gap-3">
                        <Wifi className="w-10 h-10 opacity-20" />
                        <p className="text-center opacity-50">
                            Enter an AI endpoint and launch a scan<br />to see live attack results here.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {events.map((evt, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="feed-entry"
                            >
                                {evt.type === "probe" && (
                                    <div className="flex items-start gap-2.5 hover:bg-white/[0.02] rounded-lg px-2 py-1.5 transition-colors">
                                        <span className="text-text-muted shrink-0 w-6 text-right">{evt.probe}</span>
                                        <span className="shrink-0">{ATTACK_ICONS[evt.attack_type || ""] || "🎯"}</span>
                                        <span className={`shrink-0 font-semibold ${evt.success ? (SEVERITY_COLORS[evt.severity || "NONE"]) : "text-text-muted"}`}>
                                            [{evt.severity}]
                                        </span>
                                        <span className="text-text-secondary break-all">
                                            {evt.payload_preview}
                                            {evt.success && evt.exposed && evt.exposed !== "None" && (
                                                <span className={`ml-1.5 ${SEVERITY_COLORS[evt.severity || "NONE"]}`}>
                                                    → {evt.exposed}
                                                </span>
                                            )}
                                        </span>
                                        <span className="ml-auto shrink-0">
                                            {evt.success ? (
                                                <XCircle className="w-3.5 h-3.5 text-accent-red" />
                                            ) : (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-text-muted" />
                                            )}
                                        </span>
                                    </div>
                                )}
                                {evt.type === "complete" && (
                                    <div className="text-accent-green font-bold px-2 py-2 border-t border-accent-green/20 mt-1">
                                        ✓ Scan complete — {evt.probe} probes fired
                                    </div>
                                )}
                                {evt.type === "error" && (
                                    <div className="text-accent-red px-2 py-2 border-t border-accent-red/20 mt-1">
                                        ✗ Error: {evt.message}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
