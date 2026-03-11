"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, GraduationCap, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginOverlay() {
    const { userEmail, login, isLoading } = useAuth();
    const [emailInput, setEmailInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If still loading token from local storage or already logged in, do not render overlay
    if (isLoading || userEmail) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!emailInput) return;

        setIsSubmitting(true);
        try {
            await login(emailInput);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {!userEmail && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
                >
                    <div className="absolute inset-0 bg-grid-white/[0.02]" />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="relative w-full max-w-md p-8 glass-card border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20"
                    >
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent-cyan/20 blur-3xl rounded-full pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                                    <GraduationCap className="w-8 h-8 text-primary" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-center text-text-primary mb-2">College Access Only</h2>
                            <p className="text-center text-text-muted text-sm mb-8">
                                Baaz Educational Hub is restricted to university students. Please authenticate using your <strong className="text-text-primary">@university.edu</strong> email address.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="student@university.edu"
                                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                        required
                                    />
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-2 p-3 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs"
                                    >
                                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !emailInput}
                                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-background font-bold px-4 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Authenticate <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
