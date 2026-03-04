"use client";

import { useState } from "react";
import { SearchForm } from "@/components/dashboard/SearchForm";
import { ResultsTable } from "@/components/dashboard/ResultsTable";
import { CompanyEditorPanel } from "@/components/dashboard/CompanyEditorPanel";
import { Company, SearchParams } from "@/types";
import { Building2, FileSpreadsheet, Sheet, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── CSV helpers ─────────────────────────────────────────────────────────────

/**
 * Wraps a value in double-quotes for CSV, escaping any embedded double-quotes
 * by doubling them (RFC 4180) and prepending a single-quote to values that
 * would otherwise be interpreted as spreadsheet formulas (=, +, -, @, tab, CR).
 */
function csvCell(value: string): string {
    const sanitized = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return `"${sanitized.replace(/"/g, '""')}"`;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [gsheetsToast, setGsheetsToast] = useState(false);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setHasSearched(true);
    setSearchError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const res = await response.json();
      setResults(res.data || []);
      if (res.error) setSearchError(res.error);
    } catch (error) {
      console.error("Search failed", error);
      setSearchError("Nepodařilo se připojit k serveru.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCompany = (updatedCompany: Company) => {
    setResults(current =>
      current.map(c => c.id === updatedCompany.id ? updatedCompany : c)
    );
    setSelectedCompany(null);
  };

  const handleExportSheets = async () => {
    if (results.length === 0) return;
    const headers = ["Název", "IČO", "Lokalita", "Zaměstnanci", "Sektor", "Email", "Telefon", "Web"];
    const rows = results.map(c => [
      c.name,
      c.ico,
      `${c.location.city}, ${c.location.street}`,
      c.employeeCount,
      c.sector,
      c.contact.email,
      c.contact.phone,
      c.contact.website,
    ]);
    const tsv = [headers, ...rows].map(row => row.join("\t")).join("\n");
    try {
      await navigator.clipboard.writeText(tsv);
    } catch {
      // fallback: skip clipboard silently
    }
    window.open("https://sheets.new", "_blank");
    setGsheetsToast(true);
    setTimeout(() => setGsheetsToast(false), 6000);
  };

  const handleExport = () => {
    if (results.length === 0) return;
    const headers = ["Název", "IČO", "Lokalita", "Zaměstnanci", "Sektor", "Email", "Telefon", "Web"];
    const csvContent = [
      headers.join(","),
      ...results.map(c => [
        csvCell(c.name),
        csvCell(c.ico),
        csvCell(`${c.location.city}, ${c.location.street}`),
        csvCell(c.employeeCount),
        csvCell(c.sector),
        csvCell(c.contact.email),
        csvCell(c.contact.phone),
        csvCell(c.contact.website),
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "export_firem.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    /* Outer wrapper — full min-height, vzdušný padding */
    <div className="min-h-screen px-4 sm:px-8 md:px-12 py-24 md:py-36 lg:py-48">

      {/* ── Hlavní oblast — max-width pro obsah ── */}
      <div className="max-w-6xl mx-auto flex flex-col gap-12">

        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in px-1">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-md shrink-0">
              <Building2 className="w-7 h-7 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan opacity-30 blur-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                <span className="neon-text">Vyhledávač</span>{" "}
                <span className="text-white">Subjektů</span>
              </h1>
              <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-neon-purple/60" />
                Business intelligence na dosah ruky
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleExportSheets}
              disabled={results.length === 0}
              variant="outline"
              className="flex items-center gap-2.5"
            >
              <Sheet className="w-4 h-4" />
              Google Sheets
            </Button>
            <Button
              onClick={handleExport}
              disabled={results.length === 0}
              variant="outline"
              className="flex items-center gap-2.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV
              {results.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neon-purple/20 text-neon-purple font-semibold border border-neon-purple/30">
                  {results.length}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* ── SEARCH TILE — centrovaná dlaždice ── */}
        <section
          className="animate-fade-in"
          style={{ animationDelay: "0.08s" }}
          aria-label="Vyhledávací formulář"
        >
          {/* Centrovaná dlaždice s max-width a auto marginy */}
          <div
            className="mx-auto w-full max-w-4xl rounded-[36px] shadow-glass"
            style={{
              background: "rgba(12, 16, 34, 0.82)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              boxShadow:
                "0 0 0 1px rgba(168,85,247,0.10) inset, 0 32px 96px rgba(0,0,0,0.6), 0 0 120px rgba(168,85,247,0.10), 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {/* Neon top bar */}
            <div className="h-px w-full rounded-t-[36px] bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent" />

            {/* Dlaždice obsah — velký padding */}
            <div className="px-10 py-20 sm:px-16 sm:py-28 md:px-20 md:py-32">
              {/* Dlaždice header */}
              <div className="flex items-center gap-3 mb-10 sm:mb-12 md:mb-14">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-gradient-to-b from-neon-purple to-neon-cyan" />
                  <h2 className="text-base font-semibold text-slate-200 tracking-wide">
                    Parametry vyhledávání
                  </h2>
                </div>
              </div>

              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </section>

        {/* ── RESULTS ── */}
        {(hasSearched || results.length > 0) && (
          <section
            className="glass-card shadow-glass p-8 md:p-12 animate-slide-up min-h-[300px]"
            style={{ animationDelay: "0.15s" }}
            aria-label="Výsledky vyhledávání"
          >
            {searchError && (
              <div className="mb-6 px-4 py-3 rounded-xl text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20">
                {searchError}
              </div>
            )}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-neon-cyan to-neon-purple" />
                <h2 className="text-base font-semibold text-slate-200 tracking-wide">
                  Výsledky
                </h2>
              </div>
              {results.length > 0 && (
                <span className="text-xs text-slate-500">
                  Nalezeno{" "}
                  <span className="font-semibold text-neon-cyan">{results.length}</span>{" "}
                  {results.length === 1 ? "subjekt" : results.length < 5 ? "subjekty" : "subjektů"}
                </span>
              )}
            </div>
            <ResultsTable
              data={results}
              isLoading={isLoading}
              onEdit={setSelectedCompany}
            />
          </section>
        )}

      </div>

      {/* ── GOOGLE SHEETS TOAST ── */}
      {gsheetsToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium text-emerald-300 bg-[rgba(10,30,20,0.92)] border border-emerald-500/30 shadow-[0_0_32px_rgba(16,185,129,0.2)] backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Data zkopírována do schránky — v Google Sheets stiskněte{" "}
          <kbd className="ml-0.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-xs font-mono border border-emerald-500/30">
            Ctrl+V
          </kbd>
        </div>
      )}

      {/* ── EDITOR PANEL ── */}
      <CompanyEditorPanel
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
        onSave={handleSaveCompany}
      />
    </div>
  );
}
