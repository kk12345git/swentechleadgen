import React, { useState, useEffect } from "react";
import { AgencyConfig, Lead, FollowUp } from "../types";
import {
  X,
  Globe,
  Phone,
  MapPin,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Send,
  Loader2,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  FileText,
  CalendarCheck,
} from "lucide-react";

interface LeadDetailsModalProps {
  lead: Lead;
  agencyConfig: AgencyConfig;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  leadFollowUps: FollowUp[];
  onAddFollowUp: (followUp: Omit<FollowUp, "id" | "createdAt">) => void;
  onToggleFollowUp: (id: string) => void;
}

export default function LeadDetailsModal({
  lead,
  agencyConfig,
  onClose,
  onUpdateLead,
  leadFollowUps,
  onAddFollowUp,
  onToggleFollowUp,
}: LeadDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "email" | "whatsapp" | "notes">("ai");
  const [notes, setNotes] = useState(lead.notes || "");
  const [loading, setLoading] = useState(false);
  const [personalization, setPersonalization] = useState(lead.personalization || null);
  const [copied, setCopied] = useState<"email" | "whatsapp" | "subject" | null>(null);

  // Follow-up inputs
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  // Email/WhatsApp modifications
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [whatsappMsg, setWhatsappMsg] = useState("");

  useEffect(() => {
    if (personalization) {
      setEmailSubject(personalization.emailSubject || "");
      setEmailBody(personalization.emailBody || "");
      setWhatsappMsg(personalization.whatsappMessage || "");
    }
  }, [personalization]);

  const handleGenerateOutreach = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/leads/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead,
          agencyConfig,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to craft personalized outreach.");
      }

      const data = await response.json();
      setPersonalization(data);

      // Save to main parent state
      onUpdateLead({
        ...lead,
        personalization: data,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to connect to AI server to personalize outreach. Make sure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = () => {
    onUpdateLead({
      ...lead,
      notes,
    });
  };

  const handleSaveModifiedOutreach = () => {
    if (!personalization) return;
    const updatedPersonalization = {
      emailSubject,
      emailBody,
      whatsappMessage: whatsappMsg,
    };
    setPersonalization(updatedPersonalization);
    onUpdateLead({
      ...lead,
      personalization: updatedPersonalization,
      notes,
    });
  };

  const handleCopyText = (text: string, type: "email" | "whatsapp" | "subject") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/[^0-9+]/g, "");
  };

  const handleAddFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpNotes || !followUpDate) return;

    onAddFollowUp({
      leadId: lead.id,
      leadName: lead.name,
      dueDate: followUpDate,
      notes: followUpNotes,
      completed: false,
    });

    setFollowUpNotes("");
    setFollowUpDate("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0b0f19]/95 backdrop-blur-2xl rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/10 flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="bg-white/5 border-b border-white/10 p-6 shrink-0 flex items-start justify-between">
          <div>
            <span className="inline-block bg-blue-500/15 text-blue-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-blue-400/20 mb-2">
              {lead.category || "Lead Profile"}
            </span>
            <h3 className="text-xl font-bold leading-tight font-sans text-white">{lead.name}</h3>
            <p className="text-slate-400 text-xs mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {lead.address}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content (Scrollable Grid) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 scrollbar-thin">
          {/* Left Column: Quick Profile & AI Score */}
          <div className="space-y-4 lg:col-span-1">
            {/* Lead Status Score Ring */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center space-y-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                Target Score
              </span>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    strokeWidth="8"
                    stroke="rgba(255, 255, 255, 0.05)"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    strokeWidth="8"
                    stroke={lead.score >= 85 ? "#ef4444" : lead.score >= 70 ? "#f59e0b" : "#3b82f6"}
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - lead.score / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white">{lead.score}</span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">/ 100</span>
                </div>
              </div>

              <div>
                <span
                  className={`inline-block text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    lead.score >= 85
                      ? "bg-rose-500/15 text-rose-300"
                      : lead.score >= 70
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-blue-500/15 text-blue-300"
                  }`}
                >
                  {lead.score >= 85 ? "🔥 Hot Prospect" : lead.score >= 70 ? "⚡ Good Fit" : "Standard Fit"}
                </span>
              </div>
            </div>

            {/* Quick Contacts Block */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wide border-b border-white/10 pb-2">
                Business Details
              </h4>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline font-medium break-all"
                    >
                      {lead.website.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  ) : (
                    <span className="text-rose-400 font-bold uppercase tracking-wider bg-rose-500/15 px-1.5 py-0.5 rounded text-[10px] border border-rose-500/20">
                      No website detected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`} className="hover:underline font-medium">
                      {lead.phone}
                    </a>
                  ) : (
                    <span className="text-slate-500 italic">No phone available</span>
                  )}
                </div>

                {lead.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline break-all">
                      {lead.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Stage Selector */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-sm space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Sales Funnel Stage
              </label>
              <select
                value={lead.stage}
                onChange={(e) =>
                  onUpdateLead({
                    ...lead,
                    stage: e.target.value as Lead["stage"],
                  })
                }
                className="w-full text-xs font-semibold bg-[#0b0f19] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="new" className="bg-[#0b0f19]">New Lead</option>
                <option value="contacted" className="bg-[#0b0f19]">Contacted</option>
                <option value="discussion" className="bg-[#0b0f19]">In Discussion</option>
                <option value="proposal" className="bg-[#0b0f19]">Proposal Sent</option>
                <option value="won" className="bg-[#0b0f19]">Won / Signed</option>
                <option value="lost" className="bg-[#0b0f19]">Lost</option>
              </select>
            </div>

            {/* CRM Linkage Status */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-sm space-y-2.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                CRM Linkage & Enrichment
              </span>
              {lead.crmSyncStatus?.synced ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      ● Synced ({lead.crmSyncStatus.crmType.toUpperCase()})
                    </span>
                    <span className="text-[10px] text-slate-500">ID: {lead.crmSyncStatus.externalId}</span>
                  </div>
                  {lead.crmSyncStatus.enrichedData ? (
                    <div className="bg-[#0b0f19] rounded-lg border border-white/5 p-2.5 text-[10px] space-y-1.5 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Annual Revenue:</span>
                        <span className="font-bold text-white">{lead.crmSyncStatus.enrichedData.annualRevenue || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Employee Count:</span>
                        <span className="font-bold text-white">{lead.crmSyncStatus.enrichedData.employeeCount || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Decision Maker:</span>
                        <span className="font-bold text-white max-w-[120px] truncate font-sans" title={lead.crmSyncStatus.enrichedData.decisionMakerName}>{lead.crmSyncStatus.enrichedData.decisionMakerName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">CRM Status:</span>
                        <span className="font-semibold text-blue-400">{lead.crmSyncStatus.enrichedData.customerStatus || "N/A"}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/crm/enrich", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ crmType: lead.crmSyncStatus?.crmType, sandbox: true, email: lead.email, companyName: lead.name }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            onUpdateLead({
                              ...lead,
                              crmSyncStatus: {
                                ...lead.crmSyncStatus!,
                                enrichedData: data.enrichedData
                              }
                            });
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="w-full bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-300 font-bold text-[10px] py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      Pull CRM Enrichment
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400 leading-normal">
                    This lead is not yet linked to HubSpot or Salesforce. Link it to unlock automatic synchronization.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/crm/push", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ crmType: "hubspot", sandbox: true, lead }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          onUpdateLead({
                            ...lead,
                            crmSyncStatus: {
                              synced: true,
                              crmType: "hubspot",
                              syncedAt: data.syncedAt,
                              externalId: data.externalId
                            }
                          });
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400 font-bold text-[10px] py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Quick Push to CRM (HubSpot Sandbox)
                  </button>
                </div>
              )}
            </div>

            {/* Sequence Enrollment Widget */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-sm space-y-2.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Nurture Follow-Up Sequence
              </span>
              {lead.sequenceEnrollment ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[130px] font-sans">
                      {lead.sequenceEnrollment.sequenceId === "seq-hot" ? "🔥 Hot Accelerator" : lead.sequenceEnrollment.sequenceId === "seq-medium" ? "⚡ SEO Booster" : "🎨 Modernize Track"}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
                      Step {lead.sequenceEnrollment.currentStepIndex + 1}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Enrolled on {lead.sequenceEnrollment.startDate}. AB testing assigned: Variant {lead.sequenceEnrollment.abVariant}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400 leading-normal">
                    This lead is not yet enrolled in any automated outreach campaign sequences.
                  </p>
                  <button
                    onClick={() => {
                      const recSeqId = lead.score >= 85 ? "seq-hot" : lead.score >= 70 ? "seq-medium" : "seq-standard";
                      const enrollment = {
                        sequenceId: recSeqId,
                        currentStepIndex: 0,
                        startDate: new Date().toLocaleDateString(),
                        abVariant: (Math.random() > 0.5 ? "A" : "B") as "A" | "B",
                        history: [
                          {
                            stepIndex: 0,
                            sentAt: new Date().toLocaleString(),
                            channel: (recSeqId === "seq-hot" ? "whatsapp" : "email") as "whatsapp" | "email",
                            variantUsed: "A" as const,
                            status: "sent" as const,
                          }
                        ],
                      };
                      onUpdateLead({
                        ...lead,
                        sequenceEnrollment: enrollment
                      });
                      
                      // Add reminder to FollowUp tracker
                      onAddFollowUp({
                        leadId: lead.id,
                        leadName: lead.name,
                        dueDate: new Date().toISOString().split("T")[0],
                        notes: `[Seq Step 1] Outreach Immediate Launch: "${recSeqId === "seq-hot" ? "Immediate Digital Footprint Hook" : "Google Maps Audit & Benchmark Report"}"`,
                        completed: false,
                      });
                      
                      alert("Lead enrolled successfully! Check 'Outreach Sequences' tab to track performance.");
                    }}
                    className="w-full bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-300 font-bold text-[10px] py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Auto-Enroll (Recommended Seq)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Columns: Main Work Area & Outreach Tabs */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            {/* Tabs Selector */}
            <div className="flex border border-white/10 text-xs shrink-0 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "ai" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                AI Gap Analysis
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "email" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                Email Pitch
              </button>
              <button
                onClick={() => setActiveTab("whatsapp")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "whatsapp" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                WhatsApp Chat
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "notes" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                Notes & Reminders
              </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm min-h-[300px]">
              {/* Tab 1: AI Analysis */}
              {activeTab === "ai" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider">
                        AI Digital Presence Scorecard
                      </h4>
                      <p className="text-slate-300 text-xs leading-relaxed mt-1.5">
                        {lead.scoreExplanation}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wide">
                      Identified Pipeline Gaps
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Web Presence
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                          {lead.website ? (
                            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                              <Check className="w-4 h-4" /> Has Website
                            </span>
                          ) : (
                            <span className="text-rose-400 font-extrabold text-xs flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-4 h-4" /> Missing Web presence
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {lead.website
                            ? "Website is present. Evaluate page speed, mobile compatibility, and SEO optimization."
                            : "No website found. High potential candidate for website design services."}
                        </p>
                      </div>

                      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Online Reputation
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                            ⭐ {lead.rating || "Not Rated"} ({lead.reviewsCount || 0} reviews)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {lead.rating && lead.rating < 4.2
                            ? "Below-average rating. Perfect fit for review-generation campaign."
                            : "Stable ratings. Could offer local map optimization and Google profile boosting."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Email outreach */}
              {activeTab === "email" && (
                <div className="space-y-4 animate-fade-in">
                  {!personalization ? (
                    <div className="text-center py-12 space-y-4">
                      <p className="text-xs text-slate-400">
                        No custom emails prepared yet. Click the button below to have the Gemini AI craft a tailored pitch.
                      </p>
                      <button
                        onClick={handleGenerateOutreach}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 mx-auto shadow-lg transition-all cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Crafting Outreach Pitch...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Draft Personalized Email Pitch
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Subject Line
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="w-full text-xs border border-white/10 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#0b0f19] text-white font-medium"
                          />
                          <button
                            onClick={() => handleCopyText(emailSubject, "subject")}
                            className="p-2.5 text-slate-400 hover:text-blue-400 bg-white/5 border border-white/10 rounded-lg cursor-pointer"
                            title="Copy Subject"
                          >
                            {copied === "subject" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Email Body
                        </label>
                        <textarea
                          rows={12}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          className="w-full text-xs border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#0b0f19] text-white font-sans leading-relaxed resize-none scrollbar-thin"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <button
                          onClick={handleSaveModifiedOutreach}
                          className="text-[11px] text-slate-400 hover:text-white border border-dashed border-white/10 px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Save changes locally
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyText(emailBody, "email")}
                            className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 hover:bg-white/10 font-medium py-2 px-4 rounded-xl transition-all border border-white/10 cursor-pointer"
                          >
                            {copied === "email" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied Body</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Body</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`mailto:${lead.email || ""}?subject=${encodeURIComponent(
                              emailSubject
                            )}&body=${encodeURIComponent(emailBody)}`}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2 px-4 rounded-xl transition-all shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Email</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: WhatsApp outreach */}
              {activeTab === "whatsapp" && (
                <div className="space-y-4 animate-fade-in">
                  {!personalization ? (
                    <div className="text-center py-12 space-y-4">
                      <p className="text-xs text-slate-400">
                        No WhatsApp outreach ready. Click below to craft messages tailored for chat.
                      </p>
                      <button
                        onClick={handleGenerateOutreach}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 mx-auto shadow transition-all cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Crafting Chat Copy...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Draft Personalized WhatsApp Copy
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          WhatsApp Pitch Message
                        </label>
                        <textarea
                          rows={10}
                          value={whatsappMsg}
                          onChange={(e) => setWhatsappMsg(e.target.value)}
                          className="w-full text-xs border border-white/10 rounded-lg p-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#0b0f19] text-white font-sans leading-relaxed resize-none scrollbar-thin"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <button
                          onClick={handleSaveModifiedOutreach}
                          className="text-[11px] text-slate-400 hover:text-white border border-dashed border-white/10 px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Save changes locally
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyText(whatsappMsg, "whatsapp")}
                            className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 hover:bg-white/10 font-medium py-2 px-4 rounded-xl transition-all border border-white/10 cursor-pointer"
                          >
                            {copied === "whatsapp" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied Chat</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Message</span>
                              </>
                            )}
                          </button>

                          {lead.phone ? (
                            <a
                              href={`https://api.whatsapp.com/send?phone=${cleanPhoneNumber(
                                lead.phone
                              )}&text=${encodeURIComponent(whatsappMsg)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 px-4 rounded-xl transition-all shadow-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Open WhatsApp Chat</span>
                            </a>
                          ) : (
                            <button
                              disabled
                              className="flex items-center gap-1.5 bg-white/5 text-slate-500 font-medium text-xs py-2 px-4 rounded-xl border border-white/5 cursor-not-allowed"
                              title="Phone number missing for WhatsApp link"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>No Phone Number</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Local Notes & Lead-Specific Followups */}
              {activeTab === "notes" && (
                <div className="space-y-4 animate-fade-in flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Interaction Diary & Notes
                    </h4>
                    <textarea
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={handleSaveNotes}
                      className="w-full text-xs border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#0b0f19] text-white resize-none scrollbar-thin"
                      placeholder="Type details about your discussions, call history, objections, or deal status..."
                    />
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={handleSaveNotes}
                        className="text-[10px] bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 font-bold px-3 py-1 rounded transition-colors cursor-pointer"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4 text-blue-400 animate-bounce" />
                      Reminders linked to {lead.name}
                    </h4>

                    {/* Quick Add Follow-up for this lead */}
                    <form onSubmit={handleAddFollowUpSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="date"
                        required
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="text-xs border border-white/10 bg-[#0b0f19] text-white rounded p-1.5 focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Reminder notes (e.g. Call back)"
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                        className="text-xs border border-white/10 bg-[#0b0f19] text-white rounded p-1.5 focus:outline-none col-span-2"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs p-1.5 rounded cursor-pointer col-span-1 md:col-span-3 text-center"
                      >
                        + Schedule Reminder
                      </button>
                    </form>

                    {/* Linked follow-ups list */}
                    <div className="space-y-2 max-h-[150px] overflow-y-auto scrollbar-thin">
                      {leadFollowUps.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic">No follow-ups linked yet.</p>
                      ) : (
                        leadFollowUps.map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs p-2.5 rounded border flex items-center justify-between gap-3 ${
                              task.completed
                                ? "bg-white/5 border-white/5 text-slate-500"
                                : "bg-[#0b0f19] border-white/10 text-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => onToggleFollowUp(task.id)}
                                className="cursor-pointer"
                              />
                              <span className={task.completed ? "line-through text-slate-500" : "font-medium text-slate-200"}>
                                {task.notes}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono bg-white/5 text-slate-400 px-1.5 py-0.5 rounded shrink-0 border border-white/5">
                              📅 {task.dueDate}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
