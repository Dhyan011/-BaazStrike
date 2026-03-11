import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
    title: "Baaz — College Security Hub",
    description: "Autonomously attacks AI and web applications to teach students about cybersecurity.",
    keywords: ["cybersecurity", "student", "university", "CTF"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
