import React, { useState } from "react";
import { AgencyConfig } from "../types";
import { Settings, Save, ShieldCheck } from "lucide-react";

interface AgencyConfigProps {
  config: AgencyConfig;
  onSave: (newConfig: AgencyConfig) => void;
}

export default function AgencyConfigModal({ config, onSave }: AgencyConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<AgencyConfig>({ ...config });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsOpen(false);
    }, 1200);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-white/10 text-sm cursor-pointer"
        id="btn-agency-settings"
      >
        <Settings className="w-4 h-4 text-slate-300" />
        Agency Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0b0f19]/95 backdrop-blur-2xl rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-white/10 text-slate-100">
            <div className="bg-white/5 border-b border-white/10 p-6 text-white">
              <h3 className="text-xl font-bold font-sans flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400 animate-spin-slow" />
                Configure Agency Profile
              </h3>
              <p className="text-blue-300 text-xs mt-1">
                Customize your agency settings so the AI can craft highly personalized, relevant pitch messages for you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/5 text-white placeholder-slate-500"
                    placeholder="e.g. SWEN TECH"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/5 text-white placeholder-slate-500"
                    placeholder="e.g. Alex Chen"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Services Offered (Comma Separated)
                </label>
                <input
                  type="text"
                  required
                  value={form.services}
                  onChange={(e) => setForm({ ...form, services: e.target.value })}
                  className="w-full border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/5 text-white placeholder-slate-500"
                  placeholder="e.g. Custom Website Development, Google Local SEO, Review Campaigns"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Core Pitch / Value Proposition
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.pitch}
                  onChange={(e) => setForm({ ...form, pitch: e.target.value })}
                  className="w-full border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/5 text-white placeholder-slate-500 resize-none"
                  placeholder="e.g. We specialize in building modern, blazing-fast websites for local service companies and helping them double their customer leads using Google Maps SEO."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Your Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/5 text-white placeholder-slate-500"
                    placeholder="e.g. contact@swentech.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Your Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="w-full border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/5 text-white placeholder-slate-500"
                    placeholder="e.g. +1 555-0199"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saved}
                  className={`flex items-center gap-2 text-white font-medium py-2 px-5 rounded-lg transition-colors text-sm cursor-pointer ${
                    saved ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {saved ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Saved Successfully!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
