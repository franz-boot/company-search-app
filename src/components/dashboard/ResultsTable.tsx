"use client";

import { Company } from "@/types";
import { Building2, Mail, Phone, ExternalLink, Edit2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsTableProps {
    data: Company[];
    isLoading: boolean;
    onEdit: (company: Company) => void;
}

export function ResultsTable({ data, isLoading, onEdit }: ResultsTableProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 animate-pulse">
                <Building2 className="w-12 h-12 mb-4 opacity-20" />
                <p>Prohledávám registry a databáze...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                    <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-medium text-lg">Žádné subjekty nenalezeny</p>
                <p className="text-sm mt-1">Zkuste upravit parametry vyhledávání.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {data.map((company) => (
                <div
                    key={company.id}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 hover:border-brand-300 dark:hover:border-brand-700 flex flex-col h-full"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1" title={company.name}>
                                {company.name}
                            </h3>
                            <p className="text-sm text-slate-500 font-mono mt-1">IČO: {company.ico}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                            {company.sector}
                        </span>
                    </div>

                    <div className="space-y-3 mb-6 flex-grow">
                        <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{company.location.street}, {company.location.zip} {company.location.city}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <Phone className="w-4 h-4 shrink-0" />
                            <span>{company.contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <Mail className="w-4 h-4 shrink-0" />
                            <a href={`mailto:${company.contact.email}`} className="hover:text-brand-600 truncate">{company.contact.email}</a>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                        <div className="text-xs text-slate-500">
                            Zaměstnanci: <span className="font-semibold text-slate-700 dark:text-slate-300">{company.employeeCount}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {company.contact.website && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                                    <a href={company.contact.website} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 text-slate-400" />
                                    </a>
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 shadow-none"
                                onClick={() => onEdit(company)}
                            >
                                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                                Upravit
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
