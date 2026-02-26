"use client";

import { Company } from "@/types";
import { Building2, Mail, Phone, ExternalLink, Edit2, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsTableProps {
    data: Company[];
    isLoading: boolean;
    onEdit: (company: Company) => void;
}

const SECTOR_COLORS: Record<string, string> = {
    IT: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
    Finance: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    Manufacturing: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    Healthcare: "text-pink-400 bg-pink-400/10 border-pink-400/30",
    Retail: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    Other: "text-slate-400 bg-slate-400/10 border-slate-400/30",
};

function LinkedInIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

/** Strip protocol + www for display */
function displayUrl(url: string): string {
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

export function ResultsTable({ data, isLoading, onEdit }: ResultsTableProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
                <div className="spinner" />
                <p className="text-slate-500 text-sm animate-pulse">
                    Prohledávám registry a databáze…
                </p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.2)] flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-slate-600" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-neon-purple/10 blur-xl" />
                </div>
                <div>
                    <p className="font-semibold text-slate-400 text-lg">Žádné výsledky</p>
                    <p className="text-slate-600 text-sm mt-1">Zkuste upravit parametry vyhledávání.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in">
            {data.map((company, i) => {
                const sectorColor = SECTOR_COLORS[company.sector] ?? SECTOR_COLORS.Other;
                const hasWebsite = Boolean(company.contact.website);
                const hasLinkedIn = Boolean(company.socialLinks.linkedin);

                return (
                    <div
                        key={company.id}
                        className="group relative rounded-2xl p-5 flex flex-col h-full transition-all duration-300 cursor-default"
                        style={{
                            background: "rgba(15, 20, 40, 0.7)",
                            border: "1px solid rgba(168, 85, 247, 0.15)",
                            backdropFilter: "blur(16px)",
                            animationDelay: `${i * 0.05}s`,
                        }}
                    >
                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                                background: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(6,182,212,0.04) 100%)",
                                boxShadow: "inset 0 0 0 1px rgba(168,85,247,0.3)",
                            }}
                        />

                        <div className="relative flex flex-col h-full">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 gap-3">
                                <div className="min-w-0">
                                    <h3 className="font-bold text-base text-white leading-snug line-clamp-2 group-hover:text-neon-purple transition-colors duration-200" title={company.name}>
                                        {company.name}
                                    </h3>
                                    <p className="text-xs text-slate-600 font-mono mt-1.5 tracking-wider">
                                        IČO: <span className="text-slate-400">{company.ico}</span>
                                    </p>
                                </div>
                                <span className={`inline-flex shrink-0 items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${sectorColor}`}>
                                    {company.sector}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="space-y-2.5 flex-grow mb-5">
                                {/* Address */}
                                <div className="flex items-start gap-3 text-sm text-slate-500">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-600" />
                                    <span className="line-clamp-2">
                                        {[company.location.street, company.location.zip, company.location.city]
                                            .filter(Boolean).join(', ')}
                                    </span>
                                </div>

                                {/* Website */}
                                <div className="flex items-center gap-3 text-sm">
                                    <Globe className="w-4 h-4 shrink-0 text-slate-600" />
                                    {hasWebsite ? (
                                        <a
                                            href={company.contact.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-neon-cyan/80 hover:text-neon-cyan truncate transition-colors"
                                            title={company.contact.website}
                                        >
                                            {displayUrl(company.contact.website)}
                                        </a>
                                    ) : (
                                        <span className="text-slate-700 italic text-xs">web nenalezen</span>
                                    )}
                                </div>

                                {/* LinkedIn */}
                                <div className="flex items-center gap-3 text-sm">
                                    <LinkedInIcon className="w-4 h-4 shrink-0 text-slate-600" />
                                    {hasLinkedIn ? (
                                        <a
                                            href={company.socialLinks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400/80 hover:text-blue-400 truncate transition-colors"
                                        >
                                            Hledat na LinkedIn
                                        </a>
                                    ) : (
                                        <span className="text-slate-700 italic text-xs">není k dispozici</span>
                                    )}
                                </div>

                                {/* Email — only shown if filled */}
                                {company.contact.email && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 shrink-0 text-slate-600" />
                                        <a
                                            href={`mailto:${company.contact.email}`}
                                            className="text-neon-cyan/70 hover:text-neon-cyan truncate transition-colors"
                                        >
                                            {company.contact.email}
                                        </a>
                                    </div>
                                )}

                                {/* Phone — only shown if filled */}
                                {company.contact.phone && (
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <Phone className="w-4 h-4 shrink-0 text-slate-600" />
                                        <span>{company.contact.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-[rgba(168,85,247,0.1)] flex items-center justify-between mt-auto">
                                {/* Quick-access icon links */}
                                <div className="flex items-center gap-1.5">
                                    {hasWebsite && (
                                        <a
                                            href={company.contact.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Otevřít web"
                                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all duration-200"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    {hasLinkedIn && (
                                        <a
                                            href={company.socialLinks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Hledat na LinkedIn"
                                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-200"
                                        >
                                            <LinkedInIcon className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 gap-1.5"
                                    onClick={() => onEdit(company)}
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Upravit
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
