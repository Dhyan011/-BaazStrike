"use client";
import { useState, useEffect } from "react";
import { Calendar, ExternalLink, Flag, MonitorPlay, Award } from "lucide-react";

interface EventData {
    id: string;
    title: string;
    date: string;
    type: string;
    link: string;
    description: string;
}

export default function EventsSidebar() {
    const [events, setEvents] = useState<EventData[]>([]);

    useEffect(() => {
        fetch("http://localhost:8000/events")
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(console.error);
    }, []);

    if (events.length === 0) return null;

    return (
        <div className="glass-card border border-primary/20 rounded-xl p-5 shadow-lg shadow-primary/5 h-fit sticky top-24">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-black text-text-primary tracking-wide">Upcoming Events</h3>
            </div>

            <div className="space-y-4">
                {events.map((evt) => {
                    let Icon = Award;
                    let colorClass = "text-accent-purple bg-accent-purple/10 border-accent-purple/20";

                    if (evt.type === "Capture The Flag") {
                        Icon = Flag;
                        colorClass = "text-accent-red bg-accent-red/10 border-accent-red/20";
                    } else if (evt.type === "Hackathon") {
                        Icon = Award;
                        colorClass = "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20";
                    } else if (evt.type === "Seminar") {
                        Icon = MonitorPlay;
                        colorClass = "text-accent-orange bg-accent-orange/10 border-accent-orange/20";
                    }

                    return (
                        <div key={evt.id} className="group block bg-surface/50 hover:bg-surface border border-border/50 hover:border-primary/30 rounded-lg p-3 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-xl -mr-4 -mt-4 rounded-full pointer-events-none group-hover:bg-primary/10 transition-all" />

                            <div className="flex items-start justify-between gap-2 mb-1 cursor-default">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${colorClass}`}>
                                    <Icon className="w-3 h-3" />
                                    {evt.type}
                                </span>
                                <span className="text-[10px] font-mono text-text-muted">{evt.date}</span>
                            </div>

                            <h4 className="text-sm font-bold text-text-primary mb-1 mt-2">{evt.title}</h4>
                            <p className="text-xs text-text-secondary line-clamp-2 mb-3">{evt.description}</p>

                            {evt.link !== "#" && (
                                <a
                                    href={evt.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                                >
                                    View Details <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
