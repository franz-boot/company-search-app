"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Locate, Loader2, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Czech cities dataset ────────────────────────────────────────────────────
const CZECH_CITIES = [
    "Praha", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "Ústí nad Labem",
    "České Budějovice", "Hradec Králové", "Pardubice", "Zlín", "Havířov",
    "Kladno", "Most", "Opava", "Frýdek-Místek", "Karviná", "Jihlava",
    "Teplice", "Děčín", "Chomutov", "Jablonec nad Nisou", "Mladá Boleslav",
    "Prostějov", "Přerov", "Česká Lípa", "Třebíč", "Třinec", "Znojmo",
    "Kolín", "Příbram", "Chomutov", "Cheb", "Trutnov", "Písek",
    "Kroměříž", "Vsetín", "Šumperk", "Hodonín", "Tábor", "Nový Jičín",
    "Litvínov", "Nymburk", "Sokolov", "Ústí nad Orlicí", "Uherské Hradiště",
    "Benešov", "Beroun", "Blansko", "Brodek u Přerova", "Bruntál",
    "Český Krumlov", "Domažlice", "Havlíčkův Brod", "Chrudim", "Jičín",
    "Jindřichův Hradec", "Kadaň", "Klatovy", "Kutná Hora", "Louny",
    "Mělník", "Náchod", "Nové Město na Moravě", "Nový Bor", "Pelhřimov",
    "Poděbrady", "Rokycany", "Roudnice nad Labem", "Semily", "Strakonice",
    "Svitavy", "Tachov", "Uherský Brod", "Velké Meziříčí", "Vyškov",
    "Zábřeh", "Žďár nad Sázavou", "Žatec", "Žirovnice",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalize(s: string) {
    return s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function filterCities(query: string): string[] {
    if (!query || query.trim().length < 1) return [];
    const q = normalize(query.trim());
    const starts: string[] = [];
    const contains: string[] = [];
    for (const city of CZECH_CITIES) {
        const n = normalize(city);
        if (n.startsWith(q)) starts.push(city);
        else if (n.includes(q)) contains.push(city);
    }
    return [...starts, ...contains].slice(0, 8);
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CityAutocompleteProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CityAutocomplete({
    id = "city-autocomplete",
    value,
    onChange,
    placeholder = "Praha, Brno, Ostrava…",
    className,
}: CityAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [geoState, setGeoState] = useState<"idle" | "loading" | "error">("idle");
    const [geoError, setGeoError] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update suggestions when value changes
    useEffect(() => {
        const matches = filterCities(value);
        setSuggestions(matches);
        setHighlighted(-1);
        setOpen(matches.length > 0 && document.activeElement === inputRef.current);
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlighted >= 0 && listRef.current) {
            const item = listRef.current.children[highlighted] as HTMLElement;
            item?.scrollIntoView({ block: "nearest" });
        }
    }, [highlighted]);

    const selectCity = useCallback(
        (city: string) => {
            onChange(city);
            setOpen(false);
            setSuggestions([]);
            inputRef.current?.focus();
        },
        [onChange]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open) {
            if (e.key === "ArrowDown" && suggestions.length > 0) {
                setOpen(true);
                setHighlighted(0);
                e.preventDefault();
            }
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlighted(h => Math.min(h + 1, suggestions.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlighted(h => Math.max(h - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (highlighted >= 0) selectCity(suggestions[highlighted]);
                else setOpen(false);
                break;
            case "Escape":
                setOpen(false);
                setHighlighted(-1);
                break;
            case "Tab":
                setOpen(false);
                break;
        }
    };

    // ── Geolocation ──────────────────────────────────────────────────────────
    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            setGeoError("Geolokace není podporována.");
            return;
        }
        setGeoState("loading");
        setGeoError("");

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&accept-language=cs`,
                        { headers: { "User-Agent": "company-search-app/1.0" } }
                    );
                    const data = await res.json();
                    const city =
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.municipality ||
                        "";
                    if (city) {
                        onChange(city);
                        setSuggestions([]);
                        setOpen(false);
                    } else {
                        setGeoError("Město nebylo rozpoznáno.");
                    }
                } catch {
                    setGeoError("Chyba při určování polohy.");
                } finally {
                    setGeoState("idle");
                }
            },
            (err) => {
                setGeoState("error");
                if (err.code === err.PERMISSION_DENIED) {
                    setGeoError("Přístup k poloze byl zamítnut.");
                } else {
                    setGeoError("Polohu se nepodařilo zjistit.");
                }
            },
            { timeout: 8000 }
        );
    };

    const listboxId = `${id}-listbox`;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div ref={containerRef} className="relative w-full group">
                {/* Map pin icon */}
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-purple transition-colors duration-200 z-10 pointer-events-none">
                    <MapPin className="w-4 h-4" />
                </div>

                {/* Text input */}
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls={open ? listboxId : undefined}
                    aria-activedescendant={highlighted >= 0 ? `${id}-option-${highlighted}` : undefined}
                    autoComplete="off"
                    spellCheck={false}
                    value={value}
                    placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => {
                        if (suggestions.length > 0) setOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "flex h-16 w-full rounded-xl pl-12 pr-20 py-2 text-sm text-slate-200 transition-all duration-200",
                        "bg-[rgba(15,20,40,0.7)] backdrop-blur-sm",
                        "border border-[rgba(168,85,247,0.2)]",
                        "placeholder:text-slate-600",
                        "focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 focus:shadow-neon-sm",
                        className
                    )}
                />

                {/* Right icons: clear + geolocate */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {value && (
                        <button
                            type="button"
                            aria-label="Vymazat hodnotu"
                            onClick={() => { onChange(""); setSuggestions([]); setOpen(false); inputRef.current?.focus(); }}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        aria-label="Použít aktuální polohu"
                        title="Určit polohu automaticky"
                        onClick={handleGeolocate}
                        disabled={geoState === "loading"}
                        className={cn(
                            "h-7 w-7 flex items-center justify-center rounded-lg transition-all",
                            geoState === "loading"
                                ? "text-neon-cyan opacity-70 cursor-wait"
                                : "text-slate-500 hover:text-neon-cyan hover:bg-neon-cyan/10"
                        )}
                    >
                        {geoState === "loading" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Locate className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Focus gradient underline */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-gradient-to-r from-neon-purple to-neon-cyan group-focus-within:w-[90%] transition-all duration-300 rounded-full" />

                {/* Dropdown */}
                {open && suggestions.length > 0 && (
                    <ul
                        ref={listRef}
                        id={listboxId}
                        role="listbox"
                        aria-label="Návrhy měst"
                        className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl overflow-hidden shadow-glass"
                        style={{
                            background: "rgba(10, 13, 28, 0.97)",
                            border: "1px solid rgba(168, 85, 247, 0.25)",
                            backdropFilter: "blur(20px)",
                        }}
                    >
                        {suggestions.map((city, i) => {
                            const isHighlighted = i === highlighted;
                            // Highlight matching part
                            const nCity = normalize(city);
                            const nQuery = normalize(value);
                            const matchIdx = nCity.indexOf(nQuery);
                            return (
                                <li
                                    key={city}
                                    id={`${id}-option-${i}`}
                                    role="option"
                                    aria-selected={isHighlighted}
                                    onMouseDown={e => { e.preventDefault(); selectCity(city); }}
                                    onMouseEnter={() => setHighlighted(i)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors duration-100 select-none",
                                        isHighlighted
                                            ? "bg-[rgba(168,85,247,0.15)] text-white"
                                            : "text-slate-400 hover:bg-[rgba(168,85,247,0.08)]"
                                    )}
                                >
                                    <MapPin className={cn("w-3.5 h-3.5 shrink-0", isHighlighted ? "text-neon-purple" : "text-slate-600")} />
                                    <span>
                                        {matchIdx >= 0 && nQuery.length > 0 ? (
                                            <>
                                                {city.slice(0, matchIdx)}
                                                <span className="text-neon-cyan font-semibold">
                                                    {city.slice(matchIdx, matchIdx + nQuery.length)}
                                                </span>
                                                {city.slice(matchIdx + nQuery.length)}
                                            </>
                                        ) : city}
                                    </span>
                                </li>
                            );
                        })}
                        <li className="px-4 py-1.5 text-[10px] text-slate-700 border-t border-[rgba(168,85,247,0.1)] flex items-center gap-1.5">
                            <ChevronDown className="w-3 h-3 rotate-180" />↑↓ pro navigaci, Enter pro výběr, Esc pro zavření
                        </li>
                    </ul>
                )}
            </div>

            {/* Error message */}
            {geoState === "error" && geoError && (
                <p role="alert" className="text-xs text-red-400/80 pl-1 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {geoError}
                </p>
            )}
            {geoState === "loading" && (
                <p className="text-xs text-neon-cyan/60 pl-1 animate-pulse">Zjišťuji aktuální polohu…</p>
            )}
        </div>
    );
}
