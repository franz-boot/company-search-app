"use client";

import { useState } from "react";
import { SearchParams, EntityType } from "@/types";
import { Button } from "@/components/ui/button";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { Search, Loader2, Building2, Dumbbell, Users, Network } from "lucide-react";

// ─── Entity type config ───────────────────────────────────────────────────────

interface EntityConfig {
    label: string;
    icon: React.ReactNode;
    keywordPlaceholder: string;
}

const ENTITY_CONFIGS: Record<EntityType, EntityConfig> = {
    company: {
        label: "Firmy",
        icon: <Building2 className="w-3.5 h-3.5" />,
        keywordPlaceholder: "software, stavební, logistika…",
    },
    sports_club: {
        label: "Sportovní kluby",
        icon: <Dumbbell className="w-3.5 h-3.5" />,
        keywordPlaceholder: "fotbal, hokej, tenis, atletika…",
    },
    association: {
        label: "Spolky & sdružení",
        icon: <Users className="w-3.5 h-3.5" />,
        keywordPlaceholder: "kulturní, vzdělávací, mládež…",
    },
    union: {
        label: "Svazy & asociace",
        icon: <Network className="w-3.5 h-3.5" />,
        keywordPlaceholder: "svaz, komora, federace, unie…",
    },
};

const ENTITY_TYPES: EntityType[] = ["company", "sports_club", "association", "union"];

// ─── Main component ───────────────────────────────────────────────────────────

interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
    isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
    const [location, setLocation] = useState("");
    const [keyword, setKeyword] = useState("");
    const [entityType, setEntityType] = useState<EntityType>("company");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ location, keyword, entityType });
    };

    const handleReset = () => {
        setLocation("");
        setKeyword("");
    };

    const config = ENTITY_CONFIGS[entityType];

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulář pro vyhledávání"
        >
            {/* ── Entity type pills ────────────────────────────────────────── */}
            <fieldset className="border-none p-0 m-0 mb-10">
                <legend className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 pl-0.5 select-none">
                    Typ subjektu
                </legend>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Typ subjektu">
                    {ENTITY_TYPES.map(type => {
                        const cfg = ENTITY_CONFIGS[type];
                        const active = entityType === type;
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setEntityType(type)}
                                aria-pressed={active}
                                className={[
                                    "flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 border select-none",
                                    active
                                        ? "bg-neon-purple/20 border-neon-purple/60 text-neon-purple shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                                        : "bg-transparent border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-300",
                                ].join(" ")}
                            >
                                {cfg.icon}
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>
            </fieldset>

            {/* ── Lokalita + Klíčové slovo (2-col on md+) ─────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                {/* Lokalita */}
                <fieldset className="border-none p-0 m-0">
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
                        Město nebo{" "}
                        <span className="text-neon-cyan/60">GPS ikona</span> vlevo
                    </p>
                </fieldset>

                {/* Klíčové slovo */}
                <fieldset className="border-none p-0 m-0">
                    <legend className="sr-only">Vyhledávání podle klíčového slova</legend>
                    <label
                        htmlFor="search-keyword"
                        className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 pl-0.5 select-none"
                    >
                        Klíčové slovo{" "}
                        <span className="normal-case font-normal text-slate-600">(volitelné)</span>
                    </label>
                    <div className="relative">
                        <input
                            id="search-keyword"
                            type="text"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            placeholder={config.keywordPlaceholder}
                            className="w-full h-20 rounded-2xl pl-5 pr-5 text-[32px] text-slate-200 bg-[rgba(15,20,40,0.7)] backdrop-blur-sm border border-[rgba(168,85,247,0.2)] focus:outline-none focus:border-neon-purple focus:ring-4 focus:ring-neon-purple/15 focus:shadow-[0_0_24px_rgba(168,85,247,0.15)] placeholder:text-slate-600 transition-colors"
                        />
                    </div>
                </fieldset>
            </div>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <div
                className="flex flex-col sm:flex-row items-center justify-between gap-4"
                role="group"
                aria-label="Akce formuláře"
            >
                <div className="h-9">
                    {(location || keyword) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-xs text-slate-600 hover:text-slate-300 transition-colors duration-200 underline underline-offset-4 decoration-dotted"
                            aria-label="Vymazat vyhledávání"
                        >
                            Vymazat
                        </button>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || (!location && !keyword)}
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
                            <span>Hledat {ENTITY_CONFIGS[entityType].label.toLowerCase()}</span>
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
