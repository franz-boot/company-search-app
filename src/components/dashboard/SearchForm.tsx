"use client";

import { useState } from "react";
import { SearchParams, Sector } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Users, Briefcase, Loader2 } from "lucide-react";

interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
    isLoading: boolean;
}

const SECTORS: { value: Sector | ""; label: string }[] = [
    { value: "", label: "Všechny sektory" },
    { value: "IT", label: "IT & Technologie" },
    { value: "Finance", label: "Finance" },
    { value: "Manufacturing", label: "Výroba" },
    { value: "Healthcare", label: "Zdravotnictví" },
    { value: "Retail", label: "Obchod" },
    { value: "Other", label: "Ostatní" },
];

const EMPLOYEE_COUNTS = [
    { value: "", label: "Libovolný počet" },
    { value: "1-10", label: "1 – 10 zaměstnanců" },
    { value: "11-50", label: "11 – 50 zaměstnanců" },
    { value: "50+", label: "50+ zaměstnanců" },
];

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
    const [params, setParams] = useState<SearchParams>({
        keyword: "",
        location: "",
        employeeCount: "",
        sector: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(params);
    };

    const selectClass =
        "flex h-11 w-full rounded-xl px-4 py-2 text-sm text-slate-200 transition-all duration-200 " +
        "bg-[rgba(15,20,40,0.7)] backdrop-blur-sm " +
        "border border-[rgba(168,85,247,0.2)] " +
        "focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 " +
        "appearance-none cursor-pointer " +
        "disabled:cursor-not-allowed disabled:opacity-40";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main search – full width */}
            <div>
                <Input
                    id="search-keyword"
                    placeholder="Zadejte název firmy nebo IČO..."
                    icon={<Search className="w-5 h-5" />}
                    className="h-14 text-base"
                    value={params.keyword}
                    onChange={e => setParams({ ...params, keyword: e.target.value })}
                    autoFocus
                />
            </div>

            {/* Filters row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">
                        Lokalita
                    </label>
                    <Input
                        id="search-location"
                        placeholder="Praha, Brno, Ostrava…"
                        icon={<MapPin className="w-4 h-4" />}
                        value={params.location}
                        onChange={e => setParams({ ...params, location: e.target.value })}
                    />
                </div>

                {/* Employee count */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="search-employees" className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">
                        Počet zaměstnanců
                    </label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
                            <Users className="w-4 h-4" />
                        </div>
                        <select
                            id="search-employees"
                            className={selectClass + " pl-10"}
                            value={params.employeeCount}
                            onChange={e => setParams({ ...params, employeeCount: e.target.value })}
                        >
                            {EMPLOYEE_COUNTS.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-[#0d1226] text-slate-200">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {/* Custom arrow */}
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Sector */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="search-sector" className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">
                        Sektor
                    </label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
                            <Briefcase className="w-4 h-4" />
                        </div>
                        <select
                            id="search-sector"
                            className={selectClass + " pl-10"}
                            value={params.sector}
                            onChange={e => setParams({ ...params, sector: e.target.value as Sector })}
                        >
                            {SECTORS.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-[#0d1226] text-slate-200">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="min-w-[180px] h-12 text-base gap-2.5"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Vyhledávám…
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            Hledat subjekty
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
