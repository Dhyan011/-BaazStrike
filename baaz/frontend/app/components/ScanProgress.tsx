"use client";
import { motion } from "framer-motion";

interface ScanProgressProps {
    totalProbes: number;   // how many have fired so far
    maxProbes?: number;    // total expected (default 20)
    isScanning: boolean;
}

const CATEGORY_SEGMENTS = [
    { label: "Prompt Inj.", count: 5, color: "#a855f7" },
    { label: "Jailbreak", count: 5, color: "#ff6b35" },
    { label: "Data Extr.", count: 5, color: "#fbbf24" },
    { label: "Priv. Esc.", count: 5, color: "#ff4757" },
];

export default function ScanProgress({
    totalProbes,
    maxProbes = 20,
    isScanning,
}: ScanProgressProps) {
    if (!isScanning && totalProbes === 0) return null;

    const pct = Math.min(100, (totalProbes / maxProbes) * 100);

    return (
        <div className="glass-card rounded-xl px-5 py-4 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                    {isScanning && (
                        <span className="relative flex h-2 w-2">
                            <span className="ping-ring absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                    )}
                    <span className="text-text-secondary font-semibold uppercase tracking-widest text-[10px]">
                        Attack Progress
                    </span>
                </div>
                <span className="text-text-primary font-bold">
                    {totalProbes} <span className="text-text-muted font-normal">/ {maxProbes} probes</span>
                </span>
            </div>

            {/* Segmented progress bar */}
            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-background">
                {CATEGORY_SEGMENTS.map((seg, i) => {
                    const segStart = CATEGORY_SEGMENTS.slice(0, i).reduce((s, c) => s + c.count, 0);
                    const segEnd = segStart + seg.count;
                    // How many of this segment's probes have been fired?
                    const fired = Math.min(seg.count, Math.max(0, totalProbes - segStart));
                    const segPct = (fired / seg.count) * 100;

                    return (
                        <div
                            key={seg.label}
                            className="flex-1 rounded-full bg-white/5 overflow-hidden"
                            title={seg.label}
                        >
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: seg.color }}
                                initial={{ width: "0%" }}
                                animate={{ width: `${segPct}%` }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Category labels */}
            <div className="flex gap-1">
                {CATEGORY_SEGMENTS.map((seg) => (
                    <div key={seg.label} className="flex-1 flex items-center gap-1">
                        <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: seg.color }}
                        />
                        <span className="text-[9px] font-mono text-text-muted truncate">{seg.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
