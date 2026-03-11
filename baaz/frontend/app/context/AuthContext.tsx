"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    userEmail: string | null;
    token: string | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load session on mount
        const savedToken = localStorage.getItem("baaz_token");
        const savedEmail = localStorage.getItem("baaz_email");
        if (savedToken && savedEmail) {
            setToken(savedToken);
            setUserEmail(savedEmail);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string) => {
        try {
            const res = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Login failed");
            }

            setToken(data.token);
            setUserEmail(email);
            localStorage.setItem("baaz_token", data.token);
            localStorage.setItem("baaz_email", email);
        } catch (err: any) {
            throw err;
        }
    };

    const logout = () => {
        setToken(null);
        setUserEmail(null);
        localStorage.removeItem("baaz_token");
        localStorage.removeItem("baaz_email");
    };

    return (
        <AuthContext.Provider value={{ userEmail, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
