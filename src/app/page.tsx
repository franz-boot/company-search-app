"use client";

import { useState } from "react";
import { SearchForm } from "@/components/dashboard/SearchForm";
import { ResultsTable } from "@/components/dashboard/ResultsTable";
import { CompanyEditorPanel } from "@/components/dashboard/CompanyEditorPanel";
import { Company, SearchParams } from "@/types";
import { Building2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
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
    // Basic CSV export simulation for now
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
                <Building2 className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              </div>
              Vyhledávač Subjektů
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Najděte, upravte a exportujte firemní kontakty.
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={results.length === 0}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export do Sheets / CSV
          </Button>
        </header>

        {/* Search Panel */}
        <section className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-xl rounded-2xl p-6">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* Results Section */}
        <section className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-xl rounded-2xl p-6 min-h-[400px]">
          <ResultsTable
            data={results}
            isLoading={isLoading}
            onEdit={setSelectedCompany}
          />
        </section>

        {/* Editor Sidebar/Modal */}
        <CompanyEditorPanel
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onSave={handleSaveCompany}
        />

      </div>
    </div>
  );
}
