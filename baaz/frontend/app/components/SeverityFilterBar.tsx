"use client";
import { motion } from "framer-motion";

export type SeverityFilter = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface SeverityFilterBarProps {
    active: SeverityFilter;
    onChange: (f: SeverityFilter) => void;
    counts: Record<string, number>;
}

const FILTERS: { key: SeverityFilter; label: string; color: string; bg: string; border: string }[] = [
    { key: "ALL", label: "All", color: "text-text-primary", bg: "bg-white/10", border: "border-white/20" },
    { key: "CRITICAL", label: "Critical", color: "text-accent-red", bg: "bg-accent-red/15", border: "border-accent-red/30" },
    { key: "HIGH", label: "High", color: "text-accent-orange", bg: "bg-accent-orange/15", border: "border-accent-orange/30" },
    { key: "MEDIUM", label: "Medium", color: "text-accent-yellow", bg: "bg-accent-yellow/15", border: "border-accent-yellow/30" },
    { key: "LOW", label: "Low", color: "text-accent-green", bg: "bg-accent-green/15", border: "border-accent-green/30" },
];

export default function SeverityFilterBar({ active, onChange, counts }: SeverityFilterBarProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
                const isActive = active === f.key;
                const count = f.key === "ALL"
                    ? Object.values(counts).reduce((a, b) => a + b, 0)
                    : (counts[f.key] ?? 0);

                return (
                    <motion.button
                        key={f.key}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onChange(f.key)}
                        className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono
              border transition-all
              ${isActive ? `${f.bg} ${f.border} ${f.color}` : "bg-transparent border-border text-text-muted hover:border-border/80"}
            `}
                    >
                        <span>{f.label}</span>
                        <span className={`
              text-[10px] px-1.5 py-0.5 rounded-full
              ${isActive ? "bg-white/10" : "bg-white/5"}
            `}>
                            {count}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
