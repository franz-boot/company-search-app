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
        `"${c.name}"`,
        `"${c.ico}"`,
        `"${c.location.city}, ${c.location.street}"`,
        `"${c.employeeCount}"`,
        `"${c.sector}"`,
        `"${c.contact.email}"`,
        `"${c.contact.phone}"`,
        `"${c.contact.website}"`
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
    <div className="min-h-screen p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
          <div className="flex items-center gap-4">
            {/* Logo icon */}
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

        {/* ── SEARCH PANEL ── */}
        <section
          className="glass-card shadow-glass p-6 md:p-8 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Panel header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-4 w-1 rounded-full bg-gradient-to-b from-neon-purple to-neon-cyan" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
              Parametry vyhledávání
            </h2>
          </div>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* ── RESULTS ── */}
        {(hasSearched || results.length > 0) && (
          <section
            className="glass-card shadow-glass p-6 md:p-8 animate-slide-up min-h-[300px]"
            style={{ animationDelay: "0.15s" }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-gradient-to-b from-neon-cyan to-neon-purple" />
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
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
