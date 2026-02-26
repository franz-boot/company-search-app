"use client";

import { useState } from "react";
import { SearchForm } from "@/components/dashboard/SearchForm";
import { ResultsTable } from "@/components/dashboard/ResultsTable";
import { CompanyEditorPanel } from "@/components/dashboard/CompanyEditorPanel";
import { Company, SearchParams } from "@/types";
import { Building2, FileSpreadsheet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const res = await response.json();
      setResults(res.data || []);
    } catch (error) {
      console.error("Search failed", error);
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

  const handleExport = () => {
    if (results.length === 0) return;
    const headers = ["Název", "IČO", "Lokalita", "Zaměstnanci", "Sektor", "Email", "Telefon", "Web"];
    const csvContent = [
      headers.join(","),
      ...results.map(c => [
        `"${c.name}"`, `"${c.ico}"`,
        `"${c.location.city}, ${c.location.street}"`,
        `"${c.employeeCount}"`, `"${c.sector}"`,
        `"${c.contact.email}"`, `"${c.contact.phone}"`, `"${c.contact.website}"`
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
    <div className="min-h-screen px-4 py-10 md:py-16 lg:py-20">

      {/* ── Hlavní oblast — max-width pro obsah ── */}
      <div className="max-w-6xl mx-auto flex flex-col gap-10">

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

          <Button
            onClick={handleExport}
            disabled={results.length === 0}
            variant="outline"
            className="flex items-center gap-2.5 shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
            {results.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neon-purple/20 text-neon-purple font-semibold border border-neon-purple/30">
                {results.length}
              </span>
            )}
          </Button>
        </header>

        {/* ── SEARCH TILE — centrovaná dlaždice ── */}
        <section
          className="animate-fade-in"
          style={{ animationDelay: "0.08s" }}
          aria-label="Vyhledávací formulář"
        >
          {/* Centrovaná dlaždice s max-width a auto marginy */}
          <div
            className="mx-auto w-full max-w-3xl rounded-3xl shadow-glass"
            style={{
              background: "rgba(12, 16, 34, 0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(168, 85, 247, 0.22)",
              boxShadow:
                "0 0 0 1px rgba(168,85,247,0.08) inset, 0 24px 64px rgba(0,0,0,0.5), 0 0 80px rgba(168,85,247,0.06)",
            }}
          >
            {/* Neon top bar */}
            <div className="h-px w-full rounded-t-3xl bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent" />

            {/* Dlaždice obsah — velký padding */}
            <div className="px-8 py-10 md:px-12 md:py-12">
              {/* Dlaždice header */}
              <div className="flex items-center gap-3 mb-10">
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
            className="glass-card shadow-glass p-6 md:p-10 animate-slide-up min-h-[300px]"
            style={{ animationDelay: "0.15s" }}
            aria-label="Výsledky vyhledávání"
          >
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

      {/* ── EDITOR PANEL ── */}
      <CompanyEditorPanel
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
        onSave={handleSaveCompany}
      />
    </div>
  );
}
