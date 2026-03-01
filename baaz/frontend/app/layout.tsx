import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Baaz — AI Security Scanner",
    description: "Autonomously attacks AI applications to find vulnerabilities and generate detailed security reports.",
    keywords: ["AI security", "vulnerability scanner", "penetration testing", "LLM security", "prompt injection"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
