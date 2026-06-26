import React, { useState } from "react";
import { AgencyConfig, Lead } from "../types";
import { Search, MapPin, Loader2, Plus, Check, Star, Globe, ShieldAlert, Sparkles } from "lucide-react";

interface LeadSearchProps {
  agencyConfig: AgencyConfig;
  onAddLead: (lead: Partial<Lead>) => void;
  existingLeadNames: string[];
}

const SEARCH_PRESETS = [
  { label: "Dentists", icon: "🦷" },
  { label: "Gyms", icon: "💪" },
  { label: "Plumbers", icon: "🔧" },
  { label: "Roofing", icon: "🏠" },
  { label: "Spas", icon: "💆" },
  { label: "Bakers", icon: "🥐" },
];

export default function LeadSearch({ agencyConfig, onAddLead, existingLeadNames }: LeadSearchProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Austin, TX");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [results, setResults] = useState<Partial<Lead>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const handleSearch = async (searchQuery: string, searchLoc: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setAddedIds([]);

    const messages = [
      "Connecting to Google Maps services...",
      "Extracting active business profiles...",
      "Analyzing websites and check links...",
      "Retrieving Maps reviews & ratings count...",
      "Calculating target potential score...",
      "Writing AI pitch recommendations...",
    ];

    let msgIndex = 0;
    setStatusMessage(messages[0]);
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setStatusMessage(messages[msgIndex]);
    }, 2500);

    try {
      const response = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          location: searchLoc,
          agencyConfig,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to search leads. Ensure your GEMINI_API_KEY is configured.");
      }

      const data = await response.json();
      if (data.leads && Array.isArray(data.leads)) {
        setResults(data.leads);
      } else {
        throw new Error("Invalid response format received from AI.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during search.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query, location);
  };

  const handleAdd = (lead: Partial<Lead>, index: number) => {
    onAddLead(lead);
    setAddedIds((prev) => [...prev, lead.name || String(index)]);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-sm p-6 space-y-6">
      {/* Header and description */}
      <div>
        <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          AI Google Maps Prospector
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Search live Google Maps listings to discover local business leads. The system automatically verifies their website, aggregates ratings, scores suitability based on your agency profile, and guides your outreach.
        </p>
      </div>

      {/* Search Input Form */}
      <form onSubmit={onFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/5 text-white placeholder-slate-400"
              placeholder="e.g. Dentists, Roofer, General Contractor"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/5 text-white placeholder-slate-400"
              placeholder="City, State (e.g. Dallas, TX)"
            />
          </div>
        </div>

        {/* Preset search helpers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mr-1">
            Presets:
          </span>
          {SEARCH_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setQuery(preset.label);
                handleSearch(preset.label, location);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          id="btn-lead-search"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>{statusMessage}</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Prospect Leads via Google Maps</span>
            </>
          )}
        </button>
      </form>

      {/* Error State */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-400 text-sm">Prospecting Error</h4>
            <p className="text-rose-300 text-xs mt-1 leading-relaxed">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-bold text-white text-sm">
              Prospecting Results ({results.length} found)
            </h3>
            <span className="text-xs text-slate-400">
              Score indicates suitability for your agency pitch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((lead, idx) => {
              const isAdded = addedIds.includes(lead.name || "") || existingLeadNames.includes(lead.name || "");
              const score = lead.score || 50;

              return (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {lead.category}
                        </span>
                        <h4 className="font-bold text-white text-sm leading-tight mt-0.5">
                          {lead.name}
                        </h4>
                      </div>
                      <div className="bg-white/10 border border-white/10 shadow-sm rounded px-2 py-1 text-center min-w-[40px]">
                        <div className="text-xs font-bold text-blue-400">{score}</div>
                        <div className="text-[7px] text-slate-400 uppercase font-bold">Fit</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {lead.website ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 font-medium px-2 py-0.5 rounded border border-emerald-500/20">
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span>{lead.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/15 text-rose-400 font-bold px-2 py-0.5 rounded border border-rose-500/25 animate-pulse">
                          <Globe className="w-3 h-3 text-rose-400" />
                          <span>NO WEBSITE</span>
                        </span>
                      )}

                      {lead.rating ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded border border-white/10">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{lead.rating} ({lead.reviewsCount})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-white/5 text-slate-500 px-2 py-0.5 rounded border border-white/5">
                          No Ratings
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-normal line-clamp-2 italic mb-3">
                      &ldquo;{lead.scoreExplanation}&rdquo;
                    </p>

                    <p className="text-[11px] text-slate-400 mb-4 font-mono">
                      {lead.phone ? `📞 ${lead.phone}` : "📞 No Phone"} | {lead.address}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAdd(lead, idx)}
                    className={`w-full text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isAdded
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-blue-600 text-white hover:bg-blue-500 shadow-sm"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>In Pipeline</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Sales Pipeline</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
