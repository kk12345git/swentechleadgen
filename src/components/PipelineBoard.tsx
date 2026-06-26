import { Lead, PipelineStage } from "../types";
import LeadCard from "./LeadCard";
import { Kanban, ArrowRightLeft, CheckCircle2, XCircle } from "lucide-react";

interface PipelineBoardProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onStageChange: (id: string, stage: PipelineStage) => void;
}

interface ColumnConfig {
  id: PipelineStage;
  title: string;
  color: string;
  bgColor: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: "new", title: "New Leads", color: "text-blue-300 bg-blue-500/15 border-blue-400/20", bgColor: "bg-white/5 backdrop-blur-md border-white/10" },
  { id: "contacted", title: "Contacted", color: "text-purple-300 bg-purple-500/15 border-purple-400/20", bgColor: "bg-white/5 backdrop-blur-md border-white/10" },
  { id: "discussion", title: "In Discussion", color: "text-amber-300 bg-amber-500/15 border-amber-400/20", bgColor: "bg-white/5 backdrop-blur-md border-white/10" },
  { id: "proposal", title: "Proposal Sent", color: "text-indigo-300 bg-indigo-500/15 border-indigo-400/20", bgColor: "bg-white/5 backdrop-blur-md border-white/10" },
  { id: "won", title: "Won / Signed", color: "text-emerald-300 bg-emerald-500/15 border-emerald-400/20", bgColor: "bg-white/5 backdrop-blur-md border-white/10" },
  { id: "lost", title: "Lost", color: "text-rose-300 bg-rose-500/15 border-rose-400/20", bgColor: "bg-white/5 backdrop-blur-md border-white/10" },
];

export default function PipelineBoard({ leads, onViewLead, onDeleteLead, onStageChange }: PipelineBoardProps) {
  // Helper to filter leads by stage
  const getLeadsInStage = (stage: PipelineStage) => leads.filter((lead) => lead.stage === stage);

  return (
    <div className="space-y-4">
      {/* Mini Stats Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Kanban className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Pipeline Overview</h3>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <div>
            Total Pipeline Leads: <strong className="text-white">{leads.length}</strong>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Won Deals:{" "}
            <strong className="text-emerald-300">
              {leads.filter((l) => l.stage === "won").length}
            </strong>
          </div>
          <div>
            Average Score:{" "}
            <strong className="text-blue-300">
              {leads.length > 0
                ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length)
                : 0}
              %
            </strong>
          </div>
        </div>
      </div>

      {/* Grid structure for Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colLeads = getLeadsInStage(col.id);

          return (
            <div
              key={col.id}
              className={`rounded-xl border ${col.bgColor} p-3 flex flex-col min-h-[450px] w-full min-w-[220px]`}
              id={`pipeline-col-${col.id}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 shrink-0">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${col.color}`}
                >
                  {col.title}
                </span>
                <span className="text-xs font-bold text-slate-300 bg-white/10 border border-white/10 rounded-full w-5 h-5 flex items-center justify-center">
                  {colLeads.length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin">
                {colLeads.length === 0 ? (
                  <div className="h-28 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-center p-3">
                    <p className="text-[10px] text-slate-500 font-medium">
                      No leads here. Search or drag one.
                    </p>
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onView={onViewLead}
                      onDelete={onDeleteLead}
                      onStageChange={onStageChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
