"use client";
import { motion } from "framer-motion";
import { ShieldX, AlertTriangle, AlertCircle, Info, CheckCircle, Activity } from "lucide-react";

interface ScanSummary {
    total_vulnerabilities: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    risk_score: number;
    total_probes: number;
}

interface SummaryCardsProps {
    summary: ScanSummary | null;
}

const cards = [
    {
        key: "critical",
        label: "Critical",
        icon: ShieldX,
        color: "text-accent-red",
        bg: "bg-accent-red/10",
        border: "border-accent-red/20",
        glow: "glow-red",
    },
    {
        key: "high",
        label: "High",
        icon: AlertTriangle,
        color: "text-accent-orange",
        bg: "bg-accent-orange/10",
        border: "border-accent-orange/20",
        glow: "",
    },
    {
        key: "medium",
        label: "Medium",
        icon: AlertCircle,
        color: "text-accent-yellow",
        bg: "bg-accent-yellow/10",
        border: "border-accent-yellow/20",
        glow: "",
    },
    {
        key: "low",
        label: "Low",
        icon: Info,
        color: "text-accent-green",
        bg: "bg-accent-green/10",
        border: "border-accent-green/20",
        glow: "glow-green",
    },
    {
        key: "total_vulnerabilities",
        label: "Total Vulns",
        icon: Activity,
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
        glow: "glow-blue",
    },
    {
        key: "total_probes",
        label: "Probes Fired",
        icon: CheckCircle,
        color: "text-accent-purple",
        bg: "bg-accent-purple/10",
        border: "border-accent-purple/20",
        glow: "",
    },
];

export default function SummaryCards({ summary }: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {cards.map((card, i) => {
                const Icon = card.icon;
                const value = summary ? (summary as any)[card.key] : "—";
                return (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className={`glass-card rounded-xl p-4 border ${card.border} ${summary ? card.glow : ""} flex flex-col items-center gap-2 text-center`}
                    >
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <Icon className={`w-4 h-4 ${card.color}`} />
                        </div>
                        <div className={`text-2xl font-black font-mono ${card.color}`}>
                            {value}
                        </div>
                        <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest leading-tight">
                            {card.label}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
