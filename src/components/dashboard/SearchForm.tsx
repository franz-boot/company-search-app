"use client";

import { useState } from "react";
import { SearchParams } from "@/types";
import { Button } from "@/components/ui/button";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { Search, Loader2 } from "lucide-react";

// ─── Hlavní komponenta ────────────────────────────────────────────────────────
interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
    isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
    const [location, setLocation] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ location });
    };

    const handleReset = () => setLocation("");

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulář pro vyhledávání firem"
        >
            {/* ── Lokalita ──────────────────────────────────────────────────── */}
            <fieldset className="border-none p-0 m-0 mb-10">
                <legend className="sr-only">Vyhledávání podle lokality</legend>
                <label
                    htmlFor="search-location"
                    className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 pl-0.5 select-none"
                >
                    Lokalita
                </label>
                <CityAutocomplete
                    id="search-location"
                    value={location}
                    onChange={setLocation}
                    placeholder="Praha, Brno, Ostrava…"
                />
                <p className="text-[11px] text-slate-600 mt-1.5 pl-0.5">
                    Zadejte město nebo použijte{" "}
                    <span className="text-neon-cyan/60">GPS ikonu</span> vpravo
                </p>
            </fieldset>

            {/* ── Akce ──────────────────────────────────────────────────────── */}
            <div
                className="flex flex-col sm:flex-row items-center justify-between gap-4"
                role="group"
                aria-label="Akce formuláře"
            >
                <div className="h-9">
                    {location && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-xs text-slate-600 hover:text-slate-300 transition-colors duration-200 underline underline-offset-4 decoration-dotted"
                            aria-label="Vymazat lokalitu"
                        >
                            Vymazat
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
