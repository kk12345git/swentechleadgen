import { FollowUp } from "../types";
import { CheckSquare, Square, Calendar, Plus, Trash2, Clock, CheckCircle } from "lucide-react";
import React, { useState } from "react";

interface FollowUpTrackerProps {
  followUps: FollowUp[];
  onToggleComplete: (id: string) => void;
  onDeleteFollowUp: (id: string) => void;
  onAddFollowUp?: (followUp: Omit<FollowUp, "id" | "createdAt">) => void;
  leadsList?: { id: string; name: string }[];
}

export default function FollowUpTracker({
  followUps,
  onToggleComplete,
  onDeleteFollowUp,
  onAddFollowUp,
  leadsList = [],
}: FollowUpTrackerProps) {
  const [newNotes, setNewNotes] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotes || !newDueDate || !onAddFollowUp) return;

    const leadName = leadsList.find((l) => l.id === selectedLeadId)?.name || "General Task";

    onAddFollowUp({
      leadId: selectedLeadId,
      leadName,
      dueDate: newDueDate,
      notes: newNotes,
      completed: false,
    });

    setNewNotes("");
    setNewDueDate("");
    setSelectedLeadId("");
  };

  const filteredFollowUps = followUps.filter((item) => {
    if (filter === "pending") return !item.completed;
    if (filter === "completed") return item.completed;
    return true;
  });

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400 animate-pulse" />
            Follow-Up Scheduler
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Keep track of scheduled calls, proposal follow-ups, or custom outreach reminders.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all ${
              filter === "pending" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Pending ({followUps.filter((f) => !f.completed).length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all ${
              filter === "completed" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Completed ({followUps.filter((f) => f.completed).length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all ${
              filter === "all" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Add Form */}
        {onAddFollowUp && leadsList.length > 0 && (
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 flex flex-col justify-between">
            <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider mb-3">
              Schedule Next Reminder
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Link to Pipeline Lead
                </label>
                <select
                  required
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full text-xs border border-white/10 bg-[#0b0f19] rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white cursor-pointer"
                >
                  <option value="" className="text-slate-400">-- Choose Lead --</option>
                  {leadsList.map((lead) => (
                    <option key={lead.id} value={lead.id} className="text-slate-200 bg-[#0b0f19]">
                      {lead.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs border border-white/10 bg-[#0b0f19] rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Reminder Notes
                </label>
                <textarea
                  required
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs border border-white/10 bg-[#0b0f19] rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white resize-none"
                  placeholder="e.g. Call to discuss web design mockups"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule Task
              </button>
            </form>
          </div>
        )}

        {/* Reminders List */}
        <div className="lg:col-span-2 space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin">
          {filteredFollowUps.length === 0 ? (
            <div className="border border-dashed border-white/10 bg-white/5 rounded-xl h-48 flex flex-col items-center justify-center text-center p-4">
              <Clock className="w-8 h-8 text-slate-500 mb-2" />
              <p className="text-xs text-slate-400 font-medium">No follow-ups found in this view.</p>
              <p className="text-[10px] text-slate-500 mt-1">Select &ldquo;All&rdquo; or link a new follow-up reminder.</p>
            </div>
          ) : (
            filteredFollowUps.map((item) => {
              const isOverdue = new Date(item.dueDate) < new Date() && !item.completed;

              return (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 flex items-start justify-between gap-4 transition-all ${
                    item.completed
                      ? "bg-white/5 border-white/5 text-slate-500"
                      : isOverdue
                      ? "bg-rose-500/10 border-rose-500/20 text-slate-200"
                      : "bg-white/5 border-white/10 hover:border-white/20 text-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleComplete(item.id)}
                      className="mt-0.5 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${item.completed ? "text-slate-500 line-through" : "text-blue-400"}`}>
                          {item.leadName}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          item.completed
                            ? "bg-white/5 text-slate-500"
                            : isOverdue
                            ? "bg-rose-500/20 text-rose-300 font-bold"
                            : "bg-white/10 text-slate-300 font-medium"
                        }`}>
                          📅 {item.dueDate} {isOverdue && "(OVERDUE)"}
                        </span>
                      </div>

                      <p className={`text-xs mt-1.5 leading-relaxed font-medium ${item.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                        {item.notes}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteFollowUp(item.id)}
                    className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded transition-colors cursor-pointer shrink-0"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
