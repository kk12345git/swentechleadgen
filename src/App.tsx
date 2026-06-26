import { useState, useEffect } from "react";
import { AgencyConfig, Lead, FollowUp, PipelineStage } from "./types";
import PipelineBoard from "./components/PipelineBoard";
import LeadSearch from "./components/LeadSearch";
import FollowUpTracker from "./components/FollowUpTracker";
import AgencyConfigModal from "./components/AgencyConfigModal";
import LeadDetailsModal from "./components/LeadDetailsModal";
import CrmSyncPanel from "./components/CrmSyncPanel";
import OutreachSequences from "./components/OutreachSequences";
import {
  Sparkles,
  Kanban,
  Search,
  CalendarDays,
  Target,
  Flame,
  UserCheck,
  TrendingUp,
  Database,
  Layers,
} from "lucide-react";

// Initial starting premium mock leads
const DEMO_LEADS: Lead[] = [
  {
    id: "demo-1",
    name: "Capital Dental Austin",
    website: "https://www.capitaldentalatx.com",
    address: "1201 San Jacinto Blvd, Austin, TX 78701",
    phone: "+1 (512) 472-1234",
    category: "Dentist",
    rating: 4.4,
    reviewsCount: 38,
    email: "",
    socials: "facebook.com/capitaldentalatx",
    score: 68,
    scoreExplanation: "Has website but missing meta descriptions and schema tags. Moderate Google reviews count. Good prospect for local SEO optimization and Maps booster packages.",
    stage: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Imported via local demo setup.",
    personalization: null,
  },
  {
    id: "demo-2",
    name: "Speedy Plumbers LLC",
    website: "", // NO WEBSITE!
    address: "2201 E 6th St, Austin, TX 78702",
    phone: "+1 (512) 555-4321",
    category: "Plumber",
    rating: 3.8,
    reviewsCount: 9,
    email: "",
    socials: "",
    score: 95,
    scoreExplanation: "CRITICAL LEAD: Absolutely no website presence found online. Google Map rating is low (3.8) with very few reviews. Excellent hot prospect for high-ticket website creation + review booster pack.",
    stage: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "High priority lead. Plan to outreach via both WhatsApp and email regarding their digital footprint gaps.",
    personalization: null,
  },
  {
    id: "demo-3",
    name: "Ironclad Fitness & CrossFit",
    website: "https://www.ironcladfitnessaustin.com",
    address: "4401 S Congress Ave, Austin, TX 78745",
    phone: "+1 (512) 999-8877",
    category: "Gym",
    rating: 4.8,
    reviewsCount: 145,
    email: "info@ironcladfitatx.com",
    socials: "instagram.com/ironcladfitatx, facebook.com/ironcladfitatx",
    score: 55,
    scoreExplanation: "Very strong rating & website already present. Lower priority lead for design. Suggest targeting them with advanced conversion-optimization or social media advertising pitches.",
    stage: "discussion",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Owner replied via Instagram. Setup a follow-up call.",
    personalization: {
      emailSubject: "Increasing conversion rates for Ironclad Fitness & CrossFit",
      emailBody: "Hi team,\n\nI noticed your gym has incredible reviews on Maps! However, your website load speed on mobile has a few bottlenecks. I would love to share a free audit on how to double your trial signups...",
      whatsappMessage: "Hi, love your gym's Instagram! I made a quick video audit of your landing page speed. Let me know if you are open to checking it out. 👍"
    },
  },
];

const DEMO_FOLLOWUPS: FollowUp[] = [
  {
    id: "f-1",
    leadId: "demo-3",
    leadName: "Ironclad Fitness & CrossFit",
    dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // tomorrow
    notes: "Call Alex to discuss the landing page conversion optimization review.",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_AGENCY: AgencyConfig = {
  name: "SWEN TECH",
  services: "Premium Website Development, Google Maps SEO, Review Booster Campaigns, Social Media Advertising",
  pitch: "We build modern, blazing-fast, mobile-friendly websites for local businesses and optimize their Google Maps listings to rank higher and attract double the customer inquiries.",
  contactName: "Karthigeyan",
  contactEmail: "karthigeyanbs44@gmail.com",
  contactPhone: "+1 (512) 555-0100",
};

export default function App() {
  // Load initial states from localStorage
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem("swen_tech_leads");
    return saved ? JSON.parse(saved) : DEMO_LEADS;
  });

  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem("swen_tech_followups");
    return saved ? JSON.parse(saved) : DEMO_FOLLOWUPS;
  });

  const [agencyConfig, setAgencyConfig] = useState<AgencyConfig>(() => {
    const saved = localStorage.getItem("swen_tech_agency");
    return saved ? JSON.parse(saved) : DEFAULT_AGENCY;
  });

  const [activeTab, setActiveTab] = useState<"pipeline" | "prospector" | "reminders" | "sequences" | "crm">("pipeline");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("swen_tech_leads", JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem("swen_tech_followups", JSON.stringify(followUps));
  }, [followUps]);

  useEffect(() => {
    localStorage.setItem("swen_tech_agency", JSON.stringify(agencyConfig));
  }, [agencyConfig]);

  // Lead handlers
  const handleAddLead = (newLeadData: Partial<Lead>) => {
    const id = `lead-${Math.random().toString(36).substring(2, 9)}`;
    const fullLead: Lead = {
      id,
      name: newLeadData.name || "Unknown Business",
      website: newLeadData.website || "",
      address: newLeadData.address || "Unknown Address",
      phone: newLeadData.phone || "",
      category: newLeadData.category || "General",
      rating: newLeadData.rating !== undefined ? newLeadData.rating : null,
      reviewsCount: newLeadData.reviewsCount || 0,
      email: newLeadData.email || "",
      socials: newLeadData.socials || "",
      score: newLeadData.score || 50,
      scoreExplanation: newLeadData.scoreExplanation || "Prospect added via Google Maps search. Website and reviews have been analyzed.",
      stage: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: "",
      personalization: null,
    };

    setLeads((prev) => [fullLead, ...prev]);
  };

  const handleImportLeads = (newLeadsData: Partial<Lead>[]) => {
    const fullLeads = newLeadsData.map((newLeadData) => {
      const id = `lead-${Math.random().toString(36).substring(2, 9)}`;
      return {
        id,
        name: newLeadData.name || "Unknown Business",
        website: newLeadData.website || "",
        address: newLeadData.address || "Unknown Address",
        phone: newLeadData.phone || "",
        category: newLeadData.category || "General",
        rating: newLeadData.rating !== undefined ? newLeadData.rating : null,
        reviewsCount: newLeadData.reviewsCount || 0,
        email: newLeadData.email || "",
        socials: newLeadData.socials || "",
        score: newLeadData.score || 50,
        scoreExplanation: newLeadData.scoreExplanation || "Prospect imported via CSV.",
        stage: newLeadData.stage || "new",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: newLeadData.notes || "",
        personalization: null,
      };
    });
    setLeads((prev) => [...fullLeads, ...prev]);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    // If modal is open, sync modal state
    if (selectedLead && selectedLead.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }
  };

  const handleDeleteLead = (id: string) => {
    if (confirm("Are you sure you want to remove this lead and all of its history?")) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setFollowUps((prev) => prev.filter((f) => f.leadId !== id));
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    }
  };

  const handleStageChange = (id: string, stage: PipelineStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stage, updatedAt: new Date().toISOString() } : l))
    );
  };

  // Follow up handlers
  const handleToggleFollowUp = (id: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, completed: !f.completed } : f))
    );
  };

  const handleDeleteFollowUp = (id: string) => {
    setFollowUps((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddFollowUp = (newFollowUp: Omit<FollowUp, "id" | "createdAt">) => {
    const id = `f-${Math.random().toString(36).substring(2, 9)}`;
    const fullFollowUp: FollowUp = {
      ...newFollowUp,
      id,
      createdAt: new Date().toISOString(),
    };
    setFollowUps((prev) => [fullFollowUp, ...prev]);
  };

  // Derived metrics
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.score >= 85).length;
  const totalWon = leads.filter((l) => l.stage === "won").length;
  const inProgressCount = leads.filter(
    (l) => l.stage !== "won" && l.stage !== "lost"
  ).length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans relative overflow-x-hidden" id="app-root">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Upper Navigation/Header Bar */}
      <header className="bg-white/5 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-400 to-teal-400 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-slate-950">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold font-display tracking-tight text-white flex items-center gap-1.5">
                SWEN TECH <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 font-extrabold">Lead Hunter</span>
              </h1>
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest mt-0.5">
                AI Google Maps Prospector & Sales Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Agency config profile modal button */}
            <AgencyConfigModal config={agencyConfig} onSave={setAgencyConfig} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6 relative z-10">
        {/* Metric Widgets Bento Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Widget 1 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Leads
              </span>
              <strong className="text-xl font-black text-white leading-none">{totalLeads}</strong>
            </div>
          </div>

          {/* Widget 2 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl animate-pulse">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Hot Targets (85+)
              </span>
              <strong className="text-xl font-black text-rose-400 leading-none">{hotLeads}</strong>
            </div>
          </div>

          {/* Widget 3 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Funnel
              </span>
              <strong className="text-xl font-black text-amber-400 leading-none">{inProgressCount}</strong>
            </div>
          </div>

          {/* Widget 4 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Won / Closed
              </span>
              <strong className="text-xl font-black text-emerald-400 leading-none">{totalWon}</strong>
            </div>
          </div>
        </section>

        {/* Primary Functional Tabs */}
        <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-sm text-sm justify-start md:justify-center items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "pipeline"
                ? "bg-white/10 text-white border border-white/15 shadow-lg shadow-blue-500/5"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Sales Pipeline Board</span>
          </button>

          <button
            onClick={() => setActiveTab("prospector")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "prospector"
                ? "bg-white/10 text-white border border-white/15 shadow-lg shadow-blue-500/5"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>AI Google Maps Prospector</span>
          </button>

          <button
            onClick={() => setActiveTab("reminders")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "reminders"
                ? "bg-white/10 text-white border border-white/15 shadow-lg shadow-blue-500/5"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Follow-Up Planner</span>
          </button>

          <button
            onClick={() => setActiveTab("sequences")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "sequences"
                ? "bg-white/10 text-white border border-white/15 shadow-lg shadow-blue-500/5"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Outreach Sequences</span>
          </button>

          <button
            onClick={() => setActiveTab("crm")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "crm"
                ? "bg-white/10 text-white border border-white/15 shadow-lg shadow-blue-500/5"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>CRM Sync & Integration</span>
          </button>
        </div>

        {/* Tab View Renderers */}
        <section className="animate-slide-up">
          {activeTab === "pipeline" && (
            <PipelineBoard
              leads={leads}
              onViewLead={setSelectedLead}
              onDeleteLead={handleDeleteLead}
              onStageChange={handleStageChange}
            />
          )}

          {activeTab === "prospector" && (
            <LeadSearch
              agencyConfig={agencyConfig}
              onAddLead={handleAddLead}
              existingLeadNames={leads.map((l) => l.name)}
            />
          )}

          {activeTab === "reminders" && (
            <FollowUpTracker
              followUps={followUps}
              onToggleComplete={handleToggleFollowUp}
              onDeleteFollowUp={handleDeleteFollowUp}
              onAddFollowUp={handleAddFollowUp}
              leadsList={leads.map((l) => ({ id: l.id, name: l.name }))}
            />
          )}

          {activeTab === "sequences" && (
            <OutreachSequences
              leads={leads}
              onUpdateLead={handleUpdateLead}
              followUps={followUps}
              onAddFollowUp={handleAddFollowUp}
              agencyConfig={agencyConfig}
            />
          )}

          {activeTab === "crm" && (
            <CrmSyncPanel
              leads={leads}
              onUpdateLead={handleUpdateLead}
              onImportLeads={handleImportLeads}
              agencyConfig={agencyConfig}
            />
          )}
        </section>
      </main>

      {/* Footer copyright */}
      <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-6 text-center text-xs text-slate-500 shrink-0 mt-auto">
        <p>&copy; 2026 SWEN TECH Lead Hunter. Driven by Gemini Search Grounding & AI Orchestration.</p>
      </footer>

      {/* Leads Detailed Sheet / Outreach Modal Drawer */}
      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          agencyConfig={agencyConfig}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
          leadFollowUps={followUps.filter((f) => f.leadId === selectedLead.id)}
          onAddFollowUp={handleAddFollowUp}
          onToggleFollowUp={handleToggleFollowUp}
        />
      )}
    </div>
  );
}
