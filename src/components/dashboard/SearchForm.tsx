"use client";

import { useState } from "react";
import { SearchParams, Sector } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Users, Briefcase } from "lucide-react";

interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
    isLoading: boolean;
}

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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-4">
                    <Input
                        placeholder="Název firmy nebo IČO..."
                        icon={<Search className="w-5 h-5" />}
                        className="h-14 text-lg"
                        value={params.keyword}
                        onChange={e => setParams({ ...params, keyword: e.target.value })}
                    />
                </div>

                <div>
                    <Input
                        placeholder="Lokalita (např. Praha)"
                        icon={<MapPin className="w-4 h-4" />}
                        value={params.location}
                        onChange={e => setParams({ ...params, location: e.target.value })}
                    />
                </div>

                <div className="relative">
                    <div className="absolute left-3 top-3 text-slate-400 z-10">
                        <Users className="w-4 h-4" />
                    </div>
                    <select
                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-sm transition-all appearance-none cursor-pointer text-slate-700 dark:text-slate-200 dark:bg-slate-950/50 dark:border-slate-800"
                        value={params.employeeCount}
                        onChange={e => setParams({ ...params, employeeCount: e.target.value })}
                    >
                        <option value="">Počet zaměstnanců...</option>
                        <option value="1-10">1 - 10</option>
                        <option value="11-50">11 - 50</option>
                        <option value="50+">Více než 50</option>
                    </select>
                </div>

                <div className="relative">
                    <div className="absolute left-3 top-3 text-slate-400 z-10">
                        <Briefcase className="w-4 h-4" />
                    </div>
                    <select
                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-sm transition-all appearance-none cursor-pointer text-slate-700 dark:text-slate-200 dark:bg-slate-950/50 dark:border-slate-800"
                        value={params.sector}
                        onChange={e => setParams({ ...params, sector: e.target.value as Sector })}
                    >
                        <option value="">Sektor...</option>
                        <option value="IT">IT & Technologie</option>
                        <option value="Finance">Finance</option>
                        <option value="Manufacturing">Výroba</option>
                        <option value="Healthcare">Zdravotnictví</option>
                        <option value="Retail">Obchod</option>
                        <option value="Other">Ostatní</option>
                    </select>
                </div>

                <div>
                    <Button
                        type="submit"
                        className="w-full h-11"
                        disabled={isLoading}
                    >
                        {isLoading ? "Vyhledávám..." : "Hledat subjekty"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
