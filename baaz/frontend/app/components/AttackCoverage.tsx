"use client";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

interface AttackResult {
    attack_type: string;
    success: boolean;
    severity: string;
}

interface AttackCoverageProps {
    vulnerabilities: AttackResult[];
    totalProbes: number;
}

const CATEGORIES = [
    { key: "prompt_injection", label: "Prompt Injection", color: "#a855f7", bg: "rgba(168,85,247,0.15)" },
    { key: "jailbreaking", label: "Jailbreaking", color: "#ff6b35", bg: "rgba(255,107,53,0.15)" },
    { key: "data_extraction", label: "Data Extraction", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
    { key: "privilege_escalation", label: "Priv. Escalation", color: "#ff4757", bg: "rgba(255,71,87,0.15)" },
];

const PROBES_PER_CAT = 5;

export default function AttackCoverage({ vulnerabilities, totalProbes }: AttackCoverageProps) {
    if (totalProbes === 0) return null;

    // Count successes per category from the full vuln list (all 20 probes)
    const stats = CATEGORIES.map((cat) => {
        const catVulns = vulnerabilities.filter((v) => v.attack_type === cat.key);
        const succeeded = catVulns.filter((v) => v.success).length;
        return { ...cat, succeeded, failed: PROBES_PER_CAT - succeeded, total: PROBES_PER_CAT };
    });

    return (
        <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-5">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-text-primary">Attack Coverage</h3>
                <span className="ml-auto text-[10px] font-mono text-text-muted">{totalProbes} probes total</span>
            </div>

            <div className="space-y-3">
                {stats.map((cat, i) => {
                    const pct = (cat.succeeded / cat.total) * 100;
                    return (
                        <div key={cat.key}>
                            {/* Label row */}
                            <div className="flex items-center justify-between mb-1.5 text-xs">
                                <span className="font-semibold text-text-secondary">{cat.label}</span>
                                <span className="font-mono" style={{ color: cat.succeeded > 0 ? cat.color : "#6b7280" }}>
                                    {cat.succeeded}/{cat.total} succeeded
                                </span>
                            </div>

                            {/* Bar track */}
                            <div className="relative h-5 rounded-lg overflow-hidden bg-background flex">
                                {/* Individual probe slots */}
                                {Array.from({ length: cat.total }).map((_, idx) => {
                                    const hit = idx < cat.succeeded;
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scaleY: 0 }}
                                            animate={{ opacity: 1, scaleY: 1 }}
                                            transition={{ delay: i * 0.08 + idx * 0.04, duration: 0.3 }}
                                            className="flex-1 mx-0.5 rounded-sm"
                                            style={{
                                                background: hit ? cat.color : "rgba(255,255,255,0.06)",
                                                boxShadow: hit ? `0 0 6px ${cat.color}66` : "none",
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/40 text-[10px] font-mono text-text-muted">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-white/20 inline-block" /> Defended
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-accent-red inline-block" /> Breached
                </span>
            </div>
        </div>
    );
}
