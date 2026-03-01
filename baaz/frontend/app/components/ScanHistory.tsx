"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronRight, Loader2, Clock, ExternalLink } from "lucide-react";

interface HistoryScan {
    id: string;
    endpoint: string;
    status: string;
    total_probes: number;
    vulnerabilities: string; // JSON string
    created_at: string;
}

interface ScanHistoryProps {
    onLoadScan: (scanId: string) => void;
    activeScanId: string | null;
}

const STATUS_COLORS: Record<string, string> = {
    completed: "text-accent-green",
    running: "text-primary",
    failed: "text-accent-red",
};

function countVulns(raw: string) {
    try {
        const arr = JSON.parse(raw);
        return arr.filter((v: any) => v.success).length;
    } catch { return 0; }
}

function shortTime(iso: string) {
    try {
        const d = new Date(iso.replace(" ", "T") + "Z"); // sqlite stores no TZ
        return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
}

export default function ScanHistory({ onLoadScan, activeScanId }: ScanHistoryProps) {
    const [scans, setScans] = useState<HistoryScan[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchScans = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/scans");
            if (res.ok) setScans(await res.json());
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchScans(); }, []); // load on mount
    // Refresh whenever open panel
    useEffect(() => { if (open) fetchScans(); }, [open]);

    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            {/* Toggle header */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-text-primary">Scan History</span>
                    {scans.length > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {scans.length}
                        </span>
                    )}
                </div>
                <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border/40 divide-y divide-border/30 max-h-72 overflow-y-auto">
                            {loading && (
                                <div className="flex items-center justify-center gap-2 py-6 text-text-muted text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                                </div>
                            )}
                            {!loading && scans.length === 0 && (
                                <p className="text-center text-text-muted text-sm py-6">No scans yet.</p>
                            )}
                            {scans.map((scan) => {
                                const vulnCount = countVulns(scan.vulnerabilities);
                                const isActive = scan.id === activeScanId;
                                return (
                                    <button
                                        key={scan.id}
                                        onClick={() => onLoadScan(scan.id)}
                                        className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white/[0.03] transition-colors ${isActive ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                                    >
                                        {/* Status dot */}
                                        <span className={`text-xs font-mono font-bold ${STATUS_COLORS[scan.status] ?? "text-text-muted"}`}>
                                            {scan.status === "running" ? "⟳" : scan.status === "completed" ? "✓" : "✗"}
                                        </span>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-text-primary font-mono truncate">{scan.endpoint}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Clock className="w-3 h-3 text-text-muted" />
                                                <span className="text-[10px] text-text-muted">{shortTime(scan.created_at)}</span>
                                                <span className="text-[10px] text-text-muted">·</span>
                                                <span className={`text-[10px] font-bold ${vulnCount > 0 ? "text-accent-red" : "text-accent-green"}`}>
                                                    {vulnCount} vulns
                                                </span>
                                            </div>
                                        </div>

                                        <ExternalLink className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
