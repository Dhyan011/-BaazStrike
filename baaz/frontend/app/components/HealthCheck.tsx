"use client";
import { useEffect, useState, useCallback } from "react";
import { Loader2, CheckCircle2, XCircle, Wifi } from "lucide-react";

interface HealthCheckProps {
    url: string;
}

type Status = "idle" | "checking" | "ok" | "error";

export default function HealthCheck({ url }: HealthCheckProps) {
    const [status, setStatus] = useState<Status>("idle");
    const [latency, setLatency] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    const check = useCallback(async (target: string) => {
        if (!target) { setStatus("idle"); return; }
        try { new URL(target); } catch { setStatus("idle"); return; }

        setStatus("checking");
        setLatency(null);
        setErrorMsg("");
        try {
            const res = await fetch(
                `http://localhost:8000/ping?url=${encodeURIComponent(target)}`
            );
            const data = await res.json();
            if (data.reachable) {
                setStatus("ok");
                setLatency(data.latency_ms);
            } else {
                setStatus("error");
                setErrorMsg(data.error?.slice(0, 60) || "Unreachable");
            }
        } catch {
            setStatus("error");
            setErrorMsg("Baaz backend not running");
        }
    }, []);

    // Debounce: wait 700ms after last url change
    useEffect(() => {
        if (!url) { setStatus("idle"); return; }
        const t = setTimeout(() => check(url), 700);
        return () => clearTimeout(t);
    }, [url, check]);

    if (status === "idle") return null;

    return (
        <div className="flex items-center gap-2 mt-2.5 text-xs font-mono">
            {status === "checking" && (
                <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span className="text-text-muted">Checking connectivity...</span>
                </>
            )}
            {status === "ok" && (
                <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                    <span className="text-accent-green">Reachable</span>
                    <span className="text-text-muted">· {latency}ms</span>
                </>
            )}
            {status === "error" && (
                <>
                    <XCircle className="w-3.5 h-3.5 text-accent-red" />
                    <span className="text-accent-red">Unreachable</span>
                    <span className="text-text-muted ml-1 truncate max-w-[240px]">· {errorMsg}</span>
                </>
            )}
        </div>
    );
}
