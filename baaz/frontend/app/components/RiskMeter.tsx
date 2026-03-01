"use client";
import { motion } from "framer-motion";

interface RiskMeterProps {
    score: number; // 0-100
}

function getRiskLabel(score: number): { label: string; color: string; textColor: string } {
    if (score >= 75) return { label: "CRITICAL RISK", color: "#ff4757", textColor: "text-accent-red" };
    if (score >= 50) return { label: "HIGH RISK", color: "#ff6b35", textColor: "text-accent-orange" };
    if (score >= 25) return { label: "MEDIUM RISK", color: "#fbbf24", textColor: "text-accent-yellow" };
    if (score > 0) return { label: "LOW RISK", color: "#22c55e", textColor: "text-accent-green" };
    return { label: "SECURE", color: "#4f8cff", textColor: "text-primary" };
}

export default function RiskMeter({ score }: RiskMeterProps) {
    const clamped = Math.max(0, Math.min(100, score));
    const { label, color, textColor } = getRiskLabel(clamped);

    // SVG arc parameters
    const cx = 110;
    const cy = 110;
    const r = 80;
    const startAngle = -200;
    const endAngle = 20;
    const totalAngle = endAngle - startAngle; // 220 degrees
    const progressAngle = (clamped / 100) * totalAngle;

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const describeArc = (start: number, end: number) => {
        const s = {
            x: cx + r * Math.cos(toRad(start)),
            y: cy + r * Math.sin(toRad(start)),
        };
        const e = {
            x: cx + r * Math.cos(toRad(end)),
            y: cy + r * Math.sin(toRad(end)),
        };
        const large = end - start > 180 ? 1 : 0;
        return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
    };

    const trackPath = describeArc(startAngle, endAngle);
    const progressPath = describeArc(startAngle, startAngle + progressAngle);

    return (
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Risk Score</h3>

            <div className="relative w-[220px] h-[140px]">
                <svg viewBox="0 0 220 140" className="w-full h-full overflow-visible">
                    {/* Track */}
                    <path
                        d={trackPath}
                        fill="none"
                        stroke="rgba(30,42,61,0.8)"
                        strokeWidth="14"
                        strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <motion.path
                        d={progressPath}
                        fill="none"
                        stroke={color}
                        strokeWidth="14"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                        style={{
                            filter: `drop-shadow(0 0 8px ${color}88)`,
                        }}
                    />

                    {/* Tick marks */}
                    {[0, 25, 50, 75, 100].map((tick) => {
                        const angle = startAngle + (tick / 100) * totalAngle;
                        const innerR = r - 10;
                        const outerR = r + 4;
                        const x1 = cx + innerR * Math.cos(toRad(angle));
                        const y1 = cy + innerR * Math.sin(toRad(angle));
                        const x2 = cx + outerR * Math.cos(toRad(angle));
                        const y2 = cy + outerR * Math.sin(toRad(angle));
                        return (
                            <line
                                key={tick}
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>

                {/* Center score */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                    <motion.span
                        className={`text-5xl font-black font-mono leading-none ${textColor}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {clamped}
                    </motion.span>
                    <span className="text-[10px] text-text-muted font-mono mt-0.5">/ 100</span>
                </div>
            </div>

            {/* Label */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`mt-3 px-4 py-1.5 rounded-full text-xs font-black font-mono tracking-widest ${textColor}`}
                style={{ background: `${color}18`, border: `1px solid ${color}33` }}
            >
                {label}
            </motion.div>

            {/* Scale labels */}
            <div className="flex justify-between w-full mt-3 px-2">
                <span className="text-[10px] font-mono text-accent-green">0 SAFE</span>
                <span className="text-[10px] font-mono text-accent-yellow">50 MED</span>
                <span className="text-[10px] font-mono text-accent-red">100 CRIT</span>
            </div>
        </div>
    );
}
