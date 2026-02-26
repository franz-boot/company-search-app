"use client";

import { useState, useEffect } from "react";
import { Company } from "@/types";
import { X, Save, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CompanyEditorPanelProps {
    company: Company | null;
    onClose: () => void;
    onSave: (company: Company) => void;
}

export function CompanyEditorPanel({ company, onClose, onSave }: CompanyEditorPanelProps) {
    const [formData, setFormData] = useState<Company | null>(null);

    useEffect(() => {
        if (company) {
            setFormData(JSON.parse(JSON.stringify(company))); // Deep copy
        } else {
            setFormData(null);
        }
    }, [company]);

    if (!formData || !company) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white dark:bg-slate-900 shadow-2xl z-50 animate-slide-up md:animate-slide-in-right flex flex-col border-l border-slate-200 dark:border-slate-800">

                <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Building className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg leading-tight">Úprava subjektu</h2>
                            <p className="text-xs text-slate-500 font-mono">ID: {formData.id}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="editor-form" onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider">Základní údaje</h3>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-600 dark:text-slate-400">Název firmy</label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-600 dark:text-slate-400">IČO</label>
                                <Input
                                    value={formData.ico}
                                    onChange={e => setFormData({ ...formData, ico: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider">Lokalita a obor</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm text-slate-600 dark:text-slate-400">Ulice</label>
                                    <Input
                                        value={formData.location.street}
                                        onChange={e => setFormData({ ...formData, location: { ...formData.location, street: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-600 dark:text-slate-400">Město</label>
                                    <Input
                                        value={formData.location.city}
                                        onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-600 dark:text-slate-400">PSČ</label>
                                    <Input
                                        value={formData.location.zip}
                                        onChange={e => setFormData({ ...formData, location: { ...formData.location, zip: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider">Kontaktní údaje</h3>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-600 dark:text-slate-400">Email</label>
                                <Input
                                    type="email"
                                    value={formData.contact.email}
                                    onChange={e => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-600 dark:text-slate-400">Telefon</label>
                                <Input
                                    value={formData.contact.phone}
                                    onChange={e => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-600 dark:text-slate-400">Webová stránka</label>
                                <Input
                                    type="url"
                                    value={formData.contact.website}
                                    onChange={e => setFormData({ ...formData, contact: { ...formData.contact, website: e.target.value } })}
                                />
                            </div>
                        </div>

                    </form>
                </div>

                <footer className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Zrušit</Button>
                    <Button type="submit" form="editor-form" className="gap-2">
                        <Save className="w-4 h-4" />
                        Uložit změny
                    </Button>
                </footer>

            </div>
        </>
    );
}
