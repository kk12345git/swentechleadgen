import { Lead } from "../types";
import { Globe, Phone, Star, ArrowRight, Eye, Trash2 } from "lucide-react";

interface LeadCardProps {
  key?: string;
  lead: Lead;
  onView: (lead: Lead) => void;
  onDelete?: (id: string) => void;
  onStageChange?: (id: string, stage: Lead["stage"]) => void;
}

export default function LeadCard({ lead, onView, onDelete, onStageChange }: LeadCardProps) {
  // Determine score colors
  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-rose-500/15 text-rose-400 border-rose-500/25"; // Hot target
    if (score >= 70) return "bg-amber-500/15 text-amber-400 border-amber-500/25"; // Warm target
    return "bg-white/5 text-slate-300 border-white/10";
  };

  const hasWebsite = lead.website && lead.website.trim() !== "";

  return (
    <div
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-white/20 transition-all group flex flex-col justify-between"
      id={`lead-card-${lead.id}`}
    >
      <div>
        {/* Header: Name and AI Lead Score */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">
              {lead.category || "Lead"}
            </span>
            <h4 className="font-semibold text-white leading-snug group-hover:text-blue-400 transition-colors text-sm line-clamp-2">
              {lead.name}
            </h4>
          </div>

          <div
            className={`flex flex-col items-center justify-center min-w-[42px] h-[42px] rounded-lg border text-center ${getScoreColor(
              lead.score
            )}`}
            title={`Lead Score: ${lead.score}/100. ${lead.scoreExplanation}`}
          >
            <span className="text-xs font-bold font-sans">{lead.score}</span>
            <span className="text-[7px] font-bold uppercase tracking-wide">Score</span>
          </div>
        </div>

        {/* Info Icons & Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {/* Website badge */}
          {hasWebsite ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              <Globe className="w-3 h-3 text-emerald-400" />
              Has Web
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded border border-rose-500/25 animate-pulse">
              <Globe className="w-3 h-3 text-rose-400" />
              NO WEBSITE
            </span>
          )}

          {/* Rating badge */}
          {lead.rating !== null ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-white/5 text-slate-300 px-2 py-0.5 rounded border border-white/10">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {lead.rating} ({lead.reviewsCount})
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-white/5 text-slate-500 px-2 py-0.5 rounded border border-white/5">
              Unrated
            </span>
          )}
        </div>

        {/* Phone & Address snippet */}
        <div className="space-y-1 text-xs text-slate-400 mb-4">
          {lead.phone ? (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500 italic">
              <Phone className="w-3 h-3 shrink-0" />
              <span>No Phone Discovered</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 line-clamp-1">{lead.address}</p>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
        {onStageChange && (
          <select
            value={lead.stage}
            onChange={(e) => onStageChange(lead.id, e.target.value as Lead["stage"])}
            className="text-[10px] font-medium text-slate-300 bg-white/5 border border-white/10 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="discussion">In Discussion</option>
            <option value="proposal">Proposal Sent</option>
            <option value="won">Won / Signed</option>
            <option value="lost">Lost</option>
          </select>
        )}

        <div className="flex items-center gap-1">
          {onDelete && (
            <button
              onClick={() => onDelete(lead.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
              title="Delete Lead"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onView(lead)}
            className="flex items-center gap-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-all cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            Outreach
          </button>
        </div>
      </div>
    </div>
  );
}
