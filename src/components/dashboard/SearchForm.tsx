"use client";

import { useState } from "react";
import { SearchParams, Sector } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { Search, Users, Briefcase, Loader2 } from "lucide-react";

// ─── Konfigurace ──────────────────────────────────────────────────────────────
const SECTORS: { value: Sector | ""; label: string }[] = [
    { value: "", label: "Všechny sektory" },
    { value: "IT", label: "IT & Technologie" },
    { value: "Finance", label: "Finance" },
    { value: "Manufacturing", label: "Výroba" },
    { value: "Healthcare", label: "Zdravotnictví" },
    { value: "Retail", label: "Obchod" },
    { value: "Other", label: "Ostatní" },
];

const EMPLOYEE_COUNTS: { value: string; label: string; desc: string }[] = [
    { value: "", label: "Libovolný počet", desc: "" },
    { value: "1-10", label: "1 – 10", desc: "mikro firma" },
    { value: "11-50", label: "11 – 50", desc: "malá firma" },
    { value: "50+", label: "50 a více", desc: "střední / velká firma" },
];

// ─── Sdílené styly ────────────────────────────────────────────────────────────
const selectClass = [
    "flex h-16 w-full rounded-xl pl-12 pr-10 py-2 text-sm text-slate-200",
    "bg-[rgba(15,20,40,0.7)] backdrop-blur-sm",
    "border border-[rgba(168,85,247,0.2)]",
    "transition-all duration-200 appearance-none cursor-pointer",
    "focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20",
    "disabled:opacity-40 disabled:cursor-not-allowed",
].join(" ");

// ─── Pomocné sub-komponenty ───────────────────────────────────────────────────
function FieldLabel({
    htmlFor,
    children,
}: {
    htmlFor: string;
    children: React.ReactNode;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 pl-0.5 select-none"
        >
            {children}
        </label>
    );
}

function SelectWrapper({
    icon,
    children,
}: {
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="relative group h-16 flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-purple transition-colors duration-200 pointer-events-none z-10">
                {icon}
            </div>
            {children}
            {/* Custom chevron */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                        d="M2 4L6 8L10 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            {/* Focus underline */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-gradient-to-r from-neon-purple to-neon-cyan group-focus-within:w-[90%] transition-all duration-300 rounded-full" />
        </div>
    );
}

// ─── Hlavní komponenta ────────────────────────────────────────────────────────
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

    const handleReset = () => {
        setParams({ keyword: "", location: "", employeeCount: "", sector: "" });
    };

    const hasFilters = params.location || params.sector;

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulář pro vyhledávání firem"
        >
            {/* ── Blok 1: Klíčové slovo ─────────────────────────────────────── */}
            <fieldset className="border-none p-0 m-0 mb-10">
                <legend className="sr-only">Hlavní vyhledávání</legend>
                <FieldLabel htmlFor="search-keyword">
                    Název firmy
                </FieldLabel>
                <Input
                    id="search-keyword"
                    name="keyword"
                    type="search"
                    placeholder="Zadejte název společnosti…"
                    icon={<Search className="w-6 h-6" />}
                    className="h-16 text-base pl-12"
                    value={params.keyword}
                    onChange={e => setParams({ ...params, keyword: e.target.value })}
                    aria-label="Název firmy"
                    autoFocus
                    autoComplete="off"
                />
            </fieldset>

            {/* ── Blok 2: Filtry ────────────────────────────────────────────── */}
            <fieldset className="border-none p-0 m-0 mb-10">
                <legend className="flex items-center gap-3 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8 w-full">
                    <div className="flex-1 h-px bg-[rgba(168,85,247,0.15)]" />
                    <span className="shrink-0 px-1">Upřesnit výsledky</span>
                    <div className="flex-1 h-px bg-[rgba(168,85,247,0.15)]" />
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-8">

                    {/* Lokalita */}
                    <div>
                        <FieldLabel htmlFor="search-location">
                            Lokalita
                        </FieldLabel>
                        <CityAutocomplete
                            id="search-location"
                            value={params.location ?? ""}
                            onChange={location => setParams({ ...params, location })}
                            placeholder="Praha, Brno, Ostrava…"
                        />
                        <p className="text-[11px] text-slate-600 mt-1.5 pl-0.5">
                            Zadejte město nebo použijte{" "}
                            <span className="text-neon-cyan/60">GPS ikonu</span> vpravo
                        </p>
                    </div>

                    {/* Počet zaměstnanců — data nejsou k dispozici */}
                    <div className="opacity-40 pointer-events-none select-none" title="Data o počtu zaměstnanců nejsou k dispozici">
                        <FieldLabel htmlFor="search-employees">
                            Počet zaměstnanců
                        </FieldLabel>
                        <SelectWrapper icon={<Users className="w-4 h-4" />}>
                            <select
                                id="search-employees"
                                name="employeeCount"
                                className={selectClass}
                                disabled
                                value=""
                                onChange={() => {}}
                                aria-label="Filtr počtu zaměstnanců není dostupný"
                            >
                                <option value="" className="bg-[#0d1226] text-slate-200">
                                    Nedostupné
                                </option>
                            </select>
                        </SelectWrapper>
                        <p className="text-[11px] text-slate-600 mt-1.5 pl-0.5">
                            Tato data nejsou k dispozici
                        </p>
                    </div>

                    {/* Sektor */}
                    <div>
                        <FieldLabel htmlFor="search-sector">
                            Sektor / odvětví
                        </FieldLabel>
                        <SelectWrapper icon={<Briefcase className="w-4 h-4" />}>
                            <select
                                id="search-sector"
                                name="sector"
                                className={selectClass}
                                value={params.sector}
                                onChange={e =>
                                    setParams({
                                        ...params,
                                        sector: e.target.value as Sector | "",
                                    })
                                }
                                aria-label="Vyberte sektor nebo odvětví"
                            >
                                {SECTORS.map(opt => (
                                    <option
                                        key={opt.value}
                                        value={opt.value}
                                        className="bg-[#0d1226] text-slate-200"
                                    >
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </SelectWrapper>
                    </div>
                </div>
            </fieldset>

            {/* ── Blok 3: Akce ─────────────────────────────────────────────── */}
            <div
                className="flex flex-col sm:flex-row items-center justify-between gap-4"
                role="group"
                aria-label="Akce formuláře"
            >
                {/* Reset – zobrazíme jen pokud jsou nastaveny filtry */}
                <div className="h-9">
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-xs text-slate-600 hover:text-slate-300 transition-colors duration-200 underline underline-offset-4 decoration-dotted"
                            aria-label="Vymazat všechny filtry"
                        >
                            Vymazat filtry
                        </button>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto min-w-[220px] h-14 text-base gap-3"
                    aria-live="polite"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                            <span>Vyhledávám…</span>
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" aria-hidden />
                            <span>Hledat subjekty</span>
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
