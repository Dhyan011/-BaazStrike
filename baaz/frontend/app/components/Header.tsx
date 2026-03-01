"use client";
import { ShieldAlert, Zap, Activity } from "lucide-react";

export default function Header() {
    return (
        <header className="relative border-b border-border/50 bg-surface/60 backdrop-blur-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-xl bg-primary/10 glow-blue" />
                        <ShieldAlert className="w-6 h-6 text-primary relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-text-primary">
                            Baaz<span className="text-primary">.</span>
                        </h1>
                        <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest leading-none">
                            AI Security Scanner
                        </p>
                    </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20">
                        <span className="relative flex h-2 w-2">
                            <span className="ping-ring absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                        </span>
                        <span className="text-accent-green text-xs font-semibold font-mono">Systems Online</span>
                    </div>

                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        <span className="text-primary text-xs font-semibold font-mono">Groq LLM Judge</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20">
                        <Activity className="w-3.5 h-3.5 text-accent-purple" />
                        <span className="text-accent-purple text-xs font-semibold font-mono">20 Probes</span>
                    </div>
                </div>
            </div>

            {/* Animated gradient border bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </header>
    );
}
