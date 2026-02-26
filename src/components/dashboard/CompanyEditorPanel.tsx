"use client";

import { useState, useEffect } from "react";
import { Company } from "@/types";
import { X, Save, Building2, MapPin, Phone, Mail, Globe, Hash, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CompanyEditorPanelProps {
    company: Company | null;
    onClose: () => void;
    onSave: (company: Company) => void;
}

interface FieldGroupProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

function FieldGroup({ title, icon, children }: FieldGroupProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[rgba(168,85,247,0.15)]">
                <div className="text-neon-purple/70">{icon}</div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</h3>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

export function CompanyEditorPanel({ company, onClose, onSave }: CompanyEditorPanelProps) {
    const [formData, setFormData] = useState<Company | null>(null);

    useEffect(() => {
        if (company) {
            setFormData(JSON.parse(JSON.stringify(company)));
        } else {
            setFormData(null);
        }
    }, [company]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (company) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [company, onClose]);

    if (!formData || !company) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 transition-all duration-300"
                style={{ background: "rgba(8, 11, 20, 0.7)", backdropFilter: "blur(8px)" }}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="fixed inset-y-0 right-0 w-full md:w-[520px] z-50 flex flex-col animate-slide-up"
                style={{
                    background: "rgba(10, 13, 28, 0.95)",
                    backdropFilter: "blur(24px)",
                    borderLeft: "1px solid rgba(168, 85, 247, 0.25)",
                    boxShadow: "-20px 0 60px rgba(0,0,0,0.5), -1px 0 0 rgba(168,85,247,0.1)",
                }}
            >
                {/* Neon top accent */}
                <div className="h-px w-full bg-gradient-to-r from-neon-purple via-neon-cyan to-transparent" />

                {/* Header */}
                <header className="px-6 py-5 flex items-center justify-between gap-4 border-b border-[rgba(168,85,247,0.15)]">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 border border-[rgba(168,85,247,0.3)] flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-semibold text-white leading-tight text-base truncate">
                                Úprava subjektu
                            </h2>
                            <p className="text-xs text-slate-600 font-mono mt-0.5 truncate">
                                {formData.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-[rgba(168,85,247,0.15)] transition-all duration-200"
                        aria-label="Zavřít panel"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </header>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <form id="editor-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* Základní údaje */}
                        <FieldGroup title="Základní údaje" icon={<Building2 className="w-4 h-4" />}>
                            <Input
                                id="edit-name"
                                label="Název firmy"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Název společnosti"
                            />
                            <Input
                                id="edit-ico"
                                label="IČO"
                                icon={<Hash className="w-4 h-4" />}
                                value={formData.ico}
                                onChange={e => setFormData({ ...formData, ico: e.target.value })}
                                required
                                placeholder="12345678"
                            />
                        </FieldGroup>

                        {/* Lokalita */}
                        <FieldGroup title="Lokalita" icon={<MapPin className="w-4 h-4" />}>
                            <Input
                                id="edit-street"
                                label="Ulice a číslo"
                                value={formData.location.street}
                                onChange={e => setFormData({ ...formData, location: { ...formData.location, street: e.target.value } })}
                                placeholder="Václavské náměstí 1"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="edit-city"
                                    label="Město"
                                    value={formData.location.city}
                                    onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                    placeholder="Praha"
                                />
                                <Input
                                    id="edit-zip"
                                    label="PSČ"
                                    value={formData.location.zip}
                                    onChange={e => setFormData({ ...formData, location: { ...formData.location, zip: e.target.value } })}
                                    placeholder="110 00"
                                />
                            </div>
                        </FieldGroup>

                        {/* Kontakt */}
                        <FieldGroup title="Kontaktní údaje" icon={<Phone className="w-4 h-4" />}>
                            <Input
                                id="edit-phone"
                                label="Telefon"
                                icon={<Phone className="w-4 h-4" />}
                                value={formData.contact.phone}
                                onChange={e => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                                placeholder="+420 000 000 000"
                            />
                            <Input
                                id="edit-email"
                                label="E-mail"
                                type="email"
                                icon={<Mail className="w-4 h-4" />}
                                value={formData.contact.email}
                                onChange={e => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                                placeholder="info@firma.cz"
                            />
                            <Input
                                id="edit-website"
                                label="Webová stránka"
                                type="url"
                                icon={<Globe className="w-4 h-4" />}
                                value={formData.contact.website}
                                onChange={e => setFormData({ ...formData, contact: { ...formData.contact, website: e.target.value } })}
                                placeholder="https://firma.cz"
                            />
                        </FieldGroup>

                        {/* Zaměstnanci */}
                        <FieldGroup title="Zaměstnanci" icon={<Users className="w-4 h-4" />}>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="edit-employees" className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1">
                                    Počet zaměstnanců
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <select
                                        id="edit-employees"
                                        className={
                                            "flex h-11 w-full rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 transition-all duration-200 " +
                                            "bg-[rgba(15,20,40,0.7)] backdrop-blur-sm " +
                                            "border border-[rgba(168,85,247,0.2)] " +
                                            "focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 " +
                                            "appearance-none cursor-pointer"
                                        }
                                        value={formData.employeeCount}
                                        onChange={e => setFormData({ ...formData, employeeCount: e.target.value })}
                                    >
                                        <option value="1-10" className="bg-[#0d1226]">1 – 10</option>
                                        <option value="11-50" className="bg-[#0d1226]">11 – 50</option>
                                        <option value="50+" className="bg-[#0d1226]">50+</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </FieldGroup>

                    </form>
                </div>

                {/* Footer */}
                <footer className="px-6 py-4 border-t border-[rgba(168,85,247,0.15)] flex justify-between gap-3">
                    <Button variant="ghost" onClick={onClose} className="text-slate-500 hover:text-slate-300">
                        Zrušit
                    </Button>
                    <Button type="submit" form="editor-form" className="gap-2 min-w-[140px]">
                        <Save className="w-4 h-4" />
                        Uložit změny
                    </Button>
                </footer>
            </div>
        </>
    );
}
