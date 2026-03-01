"use client";
import { useState } from "react";
import { Search, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HealthCheck from "./HealthCheck";

interface ScanInputProps {
    onScanStart: (scanId: string) => void;
    isScanning: boolean;
}

const EXAMPLE_ENDPOINTS = [
    "http://localhost:8001/chat",
    "https://your-ai-api.com/v1/chat",
    "https://api.openai.com/v1/chat/completions",
];

export default function ScanInput({ onScanStart, isScanning }: ScanInputProps) {
    const [endpoint, setEndpoint] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleScan = async () => {
        setError("");
        const url = endpoint.trim();
        if (!url) {
            setError("Please enter a target AI endpoint URL.");
            return;
        }
        try {
            new URL(url);
        } catch {
            setError("Invalid URL format. Example: http://localhost:8001/chat");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ endpoint: url }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Failed to start scan");
            }
            const data = await res.json();
            onScanStart(data.scan_id);
        } catch (e: any) {
            setError(e.message || "Cannot reach Baaz backend. Make sure it's running on port 8000.");
        } finally {
            setLoading(false);
        }
    };

    const busy = loading || isScanning;

    return (
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2 mb-5">
                <Search className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-text-primary">Target AI Endpoint</h2>
                <span className="ml-auto chip">20 Attack Probes</span>
            </div>

            <div className="flex gap-3 flex-col sm:flex-row">
                <div className="flex-1 relative">
                    <input
                        type="url"
                        value={endpoint}
                        onChange={(e) => { setEndpoint(e.target.value); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && !busy && handleScan()}
                        placeholder="https://your-ai-app.com/api/chat"
                        disabled={busy}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-text-primary placeholder-text-muted font-mono text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                    />
                    {busy && (
                        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                            <div className="scan-line" />
                        </div>
                    )}
                </div>

                <motion.button
                    onClick={handleScan}
                    disabled={busy}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg glow-blue sm:min-w-[160px]"
                >
                    {busy ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Scanning...</span>
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            <span>Launch Scan</span>
                        </>
                    )}
                </motion.button>
            </div>

            {/* Health check indicator */}
            <HealthCheck url={endpoint} />
            <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-text-muted text-xs font-mono">Try:</span>
                {EXAMPLE_ENDPOINTS.map((ex) => (
                    <button
                        key={ex}
                        onClick={() => !busy && setEndpoint(ex)}
                        className="text-xs font-mono text-text-secondary hover:text-primary transition-colors underline underline-offset-2"
                    >
                        {ex}
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 flex items-center gap-2 text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-4 py-3">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info footer */}
            <div className="mt-5 pt-4 border-t border-border/40 flex flex-wrap gap-4 text-xs text-text-muted font-mono">
                <span className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-primary" />Prompt Injection (5)</span>
                <span className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-accent-orange" />Jailbreaking (5)</span>
                <span className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-accent-yellow" />Data Extraction (5)</span>
                <span className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-accent-red" />Privilege Escalation (5)</span>
            </div>
        </div>
    );
}
