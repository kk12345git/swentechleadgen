import React, { useState } from "react";
import { Lead, FollowUp, AgencyConfig } from "../types";
import {
  Layers,
  Send,
  Smartphone,
  Mail,
  ArrowRight,
  Clock,
  Sparkles,
  TrendingUp,
  BarChart3,
  UserPlus,
  Play,
  Check,
  Edit2,
  AlertTriangle,
  Flame,
  ThumbsUp,
  CheckSquare,
} from "lucide-react";

interface OutreachSequencesProps {
  leads: Lead[];
  onUpdateLead: (updatedLead: Lead) => void;
  followUps: FollowUp[];
  onAddFollowUp: (followUp: Omit<FollowUp, "id" | "createdAt">) => void;
  agencyConfig: AgencyConfig;
}

interface SequenceStep {
  stepNumber: number;
  channel: "email" | "whatsapp";
  delayDays: number;
  title: string;
  variantA: {
    subject?: string;
    body: string;
  };
  variantB: {
    subject?: string;
    body: string;
  };
  simulatedStats: {
    openRateA: number;
    openRateB: number;
    clickRateA: number;
    clickRateB: number;
  };
}

interface Sequence {
  id: string;
  name: string;
  description: string;
  scoreRange: string;
  minScore: number;
  maxScore: number;
  steps: SequenceStep[];
}

const TEMPLATE_SEQUENCES: Sequence[] = [
  {
    id: "seq-hot",
    name: "🔥 Hot Prospect Accelerator",
    description: "Urgent high-conversion sequences designed for leads with critical website gaps or highly deficient listings. Maximizes immediate outreach pressure.",
    scoreRange: "Scores 85 - 100",
    minScore: 85,
    maxScore: 100,
    steps: [
      {
        stepNumber: 1,
        channel: "whatsapp",
        delayDays: 0,
        title: "Immediate Digital Footprint Hook",
        variantA: {
          body: "Hi {{LEAD_NAME}}! I noticed your business doesn't have an active website online right now. In Austin, 92% of users find dentists online. I wanted to send you a 60-second mockup we made for your clinic. No strings attached, are you open to seeing it? 👍 - {{CONTACT_NAME}} from {{AGENCY_NAME}}"
        },
        variantB: {
          body: "Hello! Quick question for {{LEAD_NAME}}: I saw your local business listing on Google Maps, but couldn't locate your website URL. I created a mobile-friendly design draft specifically for your services to help capture more weekend traffic. Can I text you the preview link? - {{CONTACT_NAME}}"
        },
        simulatedStats: { openRateA: 98, openRateB: 95, clickRateA: 45, clickRateB: 38 }
      },
      {
        stepNumber: 2,
        channel: "email",
        delayDays: 2,
        title: "Tailored Web Audit & Redesign Mockup",
        variantA: {
          subject: "Exclusive Mockup Draft for {{LEAD_NAME}}",
          body: "Hi team,\n\nFollowing up on my message earlier regarding your web footprint. I've designed a premium layout for {{LEAD_NAME}} focused on high mobile speeds and automated patient bookings. \n\nI noticed your competitors are getting significant search volume, and having a custom modern site could easily redirect 20-35 clients to you every month.\n\nHere is a link to your preview mockup: [Draft Link]. Let me know if you would like me to adjust any colors!\n\nBest,\n{{CONTACT_NAME}}\n{{AGENCY_NAME}}"
        },
        variantB: {
          subject: "Website Blueprint & Competitor Search Leak for {{LEAD_NAME}}",
          body: "Hi there,\n\nWe did a deep digital presence audit on dentists in your local area and discovered that approximately 250 prospective clients search for dental services weekly. Without a website, {{LEAD_NAME}} is unfortunately losing this traffic.\n\nWe crafted a web blueprint for you that addresses this. We specialize in fast WordPress/Webflow sites that set up in under 5 days. Let's schedule a 5-minute call to hand over the design ownership.\n\nSincerely,\n{{CONTACT_NAME}}"
        },
        simulatedStats: { openRateA: 62, openRateB: 68, clickRateA: 28, clickRateB: 34 }
      },
      {
        stepNumber: 3,
        channel: "whatsapp",
        delayDays: 5,
        title: "High-Urgent Review Booster / Maps Optimization",
        variantA: {
          body: "Hey {{LEAD_NAME}}! Just wanted to share a free tip: we noticed your Google listing has {{RATING}} stars. Increasing this to 4.7+ using our review booster system will boost your Maps ranking by up to 3 slots. I can set you up with a 7-day free trial of our auto-review generator. Open to trying it?"
        },
        variantB: {
          body: "Hi there! I created a QR review card mockup for {{LEAD_NAME}} that makes it easy for customers to review you on Google in 1 tap. This helps combat lower ratings and builds immediate trust. Let me know if I should drop off 50 printed cards to your address at {{ADDRESS}}!"
        },
        simulatedStats: { openRateA: 94, openRateB: 96, clickRateA: 40, clickRateB: 48 }
      },
      {
        stepNumber: 4,
        channel: "email",
        delayDays: 9,
        title: "Austin Local Case Study Proof",
        variantA: {
          subject: "How we helped a local clinic double their bookings",
          body: "Hello,\n\nI wanted to share a quick case study of how our website and review tools helped a nearby clinic scale from 15 to 45 monthly inquiries within 60 days of launch.\n\nSince {{LEAD_NAME}} currently has a score of {{SCORE}}/100 on our Presence scorecard, implementing these same quick changes would yield dramatic results. Let's chat for 10 minutes this Friday.\n\nBest,\n{{CONTACT_NAME}}"
        },
        variantB: {
          subject: "ROI Projection Report for {{LEAD_NAME}}",
          body: "Hi team,\n\nBased on your Google reviews count ({{REVIEWS_COUNT}} reviews) and current web footprint, our AI projection tool suggests a custom mobile funnel would generate an additional $5,000+ in revenue monthly.\n\nI've attached the full spreadsheet and draft design. No obligation at all.\n\nRegards,\n{{CONTACT_NAME}}"
        },
        simulatedStats: { openRateA: 51, openRateB: 48, clickRateA: 19, clickRateB: 22 }
      },
      {
        stepNumber: 5,
        channel: "email",
        delayDays: 14,
        title: "Final Soft Break-up Goodbye",
        variantA: {
          subject: "Closing your digital presença project file",
          body: "Hi,\n\nI haven't heard back, so I assume launching a website or boosting reviews isn't a priority for {{LEAD_NAME}} right now. Totally understand!\n\nI am going to close out your draft design folder. If things change and you want to capture more local traffic in the future, feel free to reach out anytime.\n\nAll the best,\n{{CONTACT_NAME}}"
        },
        variantB: {
          subject: "One last check-in from {{AGENCY_NAME}}",
          body: "Hi there,\n\nI promise this is my final outreach! Just wanted to leave you with your free Google local ranking report as a parting gift. You can view the SEO suggestions here.\n\nIf you ever want to revive the web design draft we made, you know where to find me.\n\nWarmly,\n{{CONTACT_NAME}}"
        },
        simulatedStats: { openRateA: 72, openRateB: 60, clickRateA: 35, clickRateB: 24 }
      }
    ]
  },
  {
    id: "seq-medium",
    name: "⚡ SEO & Reputation Booster",
    description: "Designed for leads that have a website, but suffer from low Google ratings, negative/sparse reviews, or poor search visibility. Focuses on local rank gains.",
    scoreRange: "Scores 70 - 84",
    minScore: 70,
    maxScore: 84,
    steps: [
      {
        stepNumber: 1,
        channel: "email",
        delayDays: 0,
        title: "Google Maps Audit & Benchmark Report",
        variantA: {
          subject: "Your Google Maps Ranking Report - {{LEAD_NAME}}",
          body: "Hi there,\n\nI ran a local ranking audit on {{LEAD_NAME}} and found that you currently rank in position #8 for local searches in your category. \n\nSince 75% of clicks go to the 'Local 3-Pack', you are missing out on major inquiry volume. I have mapped out 3 simple things you can change today to boost your rank. Let me know if you would like me to email the PDF.\n\nWarmly,\n{{CONTACT_NAME}}\n{{AGENCY_NAME}}"
        },
        variantB: {
          subject: "Google visibility scorecard: {{LEAD_NAME}}",
          body: "Hi team,\n\nYour current rating is {{RATING}} stars. Our system flagged that increasing your rating to 4.6 would immediately unlock higher organic positioning on Google Maps.\n\nWe build automated SMS campaigns that prompt your happiest clients to leave five-star reviews. It works passively in the background. Are you free for a quick call to check out the dashboard?\n\nBest,\n{{CONTACT_NAME}}"
        },
        simulatedStats: { openRateA: 58, openRateB: 64, clickRateA: 20, clickRateB: 31 }
      },
      {
        stepNumber: 2,
        channel: "whatsapp",
        delayDays: 3,
        title: "Mobile Friendly Review Widget Pitch",
        variantA: {
          body: "Hey {{LEAD_NAME}}! I made a live demo showing how our customer review widget looks embedded on your site. It automatically pulls positive reviews to your landing page, which increases trust by 40%. Want me to send the preview link?"
        },
        variantB: {
          body: "Hi! Quick suggestion for {{LEAD_NAME}}: we can automate review requests right when your clients check out using their phones. Would love to send over a 2-minute video showing how other local businesses use it!"
        },
        simulatedStats: { openRateA: 95, openRateB: 92, clickRateA: 33, clickRateB: 29 }
      },
      {
        stepNumber: 3,
        channel: "email",
        delayDays: 7,
        title: "Competitor Comparison & Leakage Analysis",
        variantA: {
          subject: "Competitor comparison for {{LEAD_NAME}}",
          body: "Hello,\n\nWe did a quick analysis on reviews count. Competitor businesses in {{ADDRESS}} average over 80 reviews, while {{LEAD_NAME}} is currently at {{REVIEWS_COUNT}} reviews.\n\nThis gap is where your potential clients are going. Our system can help you close this gap in under 30 days.\n\nCan we set up a quick demo?\n\nSincerely,\n{{CONTACT_NAME}}"
        },
        variantB: {
          subject: "Austin search leak alert - {{LEAD_NAME}}",
          body: "Hi team,\n\nDid you know your business is leaking up to 40% of search traffic because of minor Google Maps profile gaps? We've highlighted these gaps in our attached report.\n\nLet us know if you want our agency to apply the optimization fixes for you!\n\nBest,\n{{CONTACT_NAME}}"
        },
        simulatedStats: { openRateA: 44, openRateB: 50, clickRateA: 15, clickRateB: 22 }
      },
      {
        stepNumber: 4,
        channel: "email",
        delayDays: 12,
        title: "Trial Offer & Conversion Boost Call",
        variantA: {
          subject: "Risk-free trial offer for {{LEAD_NAME}}",
          body: "Hi there,\n\nI want to offer {{LEAD_NAME}} a 14-day risk-free trial of our Review Booster platform. We guarantee at least 5 new organic 5-star reviews during the trial, or we'll manage your Maps SEO for free next month.\n\nLet's get you set up today.\n\nBest,\n{{CONTACT_NAME}}"
        },
        variantB: {
          subject: "Final follow-up regarding local search ranking",
          body: "Hi,\n\nI would love to help {{LEAD_NAME}} rank higher on Maps before we close our local onboarding cohort this month. We only accept 2 businesses per category per city to prevent conflicts.\n\nLet me know if you want to secure your spot.\n\nRegards,\n{{CONTACT_NAME}}"
        },
        simulatedStats: { openRateA: 49, openRateB: 42, clickRateA: 18, clickRateB: 12 }
      }
    ]
  },
  {
    id: "seq-standard",
    name: "🎨 Modernize & Convert",
    description: "Standard follow-up for businesses that are stable but need incremental modernization, mobile speed boosts, social integrations, or basic landing page updates.",
    scoreRange: "Scores under 70",
    minScore: 0,
    maxScore: 69,
    steps: [
      {
        stepNumber: 1,
        channel: "email",
        delayDays: 0,
        title: "Responsive Web Usability Audit",
        variantA: {
          subject: "Mobile usability check for {{LEAD_NAME}}",
          body: "Hi team,\n\nWe audited your web experience on mobile devices and noticed several layout items that make it difficult for users to click your phone number or navigate. \n\nSince over 60% of searches occur on phones, a responsive update can boost your conversion instantly. Here is a free mobile recommendations sheet.\n\nBest,\n{{CONTACT_NAME}}\n{{AGENCY_NAME}}"
        },
        variantB: {
          subject: "Fast mobile speed recommendations: {{LEAD_NAME}}",
          body: "Hi,\n\nYour website's speed score on mobile is currently sub-optimal. Slow load times equal lost business. We specialize in speed-optimizing WordPress and Squarespace sites without changing your design.\n\nLet's chat for 5 minutes about our acceleration protocol.\n\nSincerely,\n{{CONTACT_NAME}}"
        },
        simulatedStats: { openRateA: 55, openRateB: 52, clickRateA: 18, clickRateB: 15 }
      },
      {
        stepNumber: 2,
        channel: "email",
        delayDays: 4,
        title: "Social proof integration suggestions",
        variantA: {
          subject: "Integrating Social media on {{LEAD_NAME}}",
          body: "Hi there,\n\nI noticed you have great social links: {{SOCIALS}}! However, these feeds are not embedded on your main website. \n\nWe can add a dynamic Instagram/Facebook live stream widget to your site in 1 hour. This keeps your site fresh and highly engaging.\n\nBest,\n{{CONTACT_NAME}}"
        },
        variantB: {
          subject: "Boosting website trust with social proof",
          body: "Hi team,\n\nShowing real customer faces and social media feeds directly on your landing page increases patient and client inquiry conversions by 28%. We made a quick mockup showing how this would look on your page.\n\nLet me know if you would like to view the screenshot!\n\nBest,\n{{CONTACT_NAME}}"
        },
        simulatedStats: { openRateA: 46, openRateB: 51, clickRateA: 14, clickRateB: 20 }
      },
      {
        stepNumber: 3,
        channel: "whatsapp",
        delayDays: 8,
        title: "Local Business Optimization Check-in",
        variantA: {
          body: "Hi {{LEAD_NAME}}! Just checking in to see if you received our mobile speed audit report. We are offering a $300 local business modernization discount this week. Let me know if you are open to checking out details!"
        },
        variantB: {
          body: "Hello! We have one slot left this week for a free, live web consultation for businesses in your area. Would love to reserve it for {{LEAD_NAME}}. Let me know if you have 10 minutes open tomorrow!"
        },
        simulatedStats: { openRateA: 91, openRateB: 93, clickRateA: 25, clickRateB: 30 }
      }
    ]
  }
];

export default function OutreachSequences({
  leads,
  onUpdateLead,
  followUps,
  onAddFollowUp,
  agencyConfig,
}: OutreachSequencesProps) {
  const [selectedSequenceId, setSelectedSequenceId] = useState<string>("seq-hot");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [activeLeadId, setActiveLeadId] = useState<string>(leads[0]?.id || "");
  const [editingVariant, setEditingVariant] = useState<"A" | "B">("A");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Active sequence and step
  const activeSequence = TEMPLATE_SEQUENCES.find((s) => s.id === selectedSequenceId) || TEMPLATE_SEQUENCES[0];
  const activeStep = activeSequence.steps[activeStepIndex] || activeSequence.steps[0];
  const activeLead = leads.find((l) => l.id === activeLeadId) || leads[0];

  // Substitute placeholders
  const renderTemplate = (text: string, leadObj: Lead) => {
    if (!text || !leadObj) return "";
    return text
      .replace(/{{LEAD_NAME}}/g, leadObj.name || "Business")
      .replace(/{{WEBSITE}}/g, leadObj.website || "None")
      .replace(/{{ADDRESS}}/g, leadObj.address || "your local area")
      .replace(/{{PHONE}}/g, leadObj.phone || "")
      .replace(/{{CATEGORY}}/g, leadObj.category || "your industry")
      .replace(/{{RATING}}/g, leadObj.rating ? leadObj.rating.toString() : "0.0")
      .replace(/{{REVIEWS_COUNT}}/g, leadObj.reviewsCount.toString())
      .replace(/{{SCORE}}/g, leadObj.score.toString())
      .replace(/{{SOCIALS}}/g, leadObj.socials || "Social Profiles")
      .replace(/{{AGENCY_NAME}}/g, agencyConfig.name)
      .replace(/{{CONTACT_NAME}}/g, agencyConfig.contactName)
      .replace(/{{CONTACT_EMAIL}}/g, agencyConfig.contactEmail)
      .replace(/{{CONTACT_PHONE}}/g, agencyConfig.contactPhone);
  };

  // Prepopulate edit fields when step/variant changes
  React.useEffect(() => {
    if (activeStep) {
      const template = editingVariant === "A" ? activeStep.variantA : activeStep.variantB;
      setCustomSubject(template.subject || "");
      setCustomBody(template.body || "");
      setEditMode(false);
    }
  }, [selectedSequenceId, activeStepIndex, editingVariant]);

  // Handle enrolling lead in a sequence
  const handleEnrollLead = (leadToEnroll: Lead, sequenceId: string) => {
    const sequence = TEMPLATE_SEQUENCES.find((s) => s.id === sequenceId);
    if (!sequence) return;

    const enrollment = {
      sequenceId,
      currentStepIndex: 0,
      startDate: new Date().toLocaleDateString(),
      abVariant: (Math.random() > 0.5 ? "A" : "B") as "A" | "B",
      history: [
        {
          stepIndex: 0,
          sentAt: new Date().toLocaleString(),
          channel: sequence.steps[0].channel,
          variantUsed: "A" as "A" | "B", // default variant
          status: "sent" as const,
        }
      ],
    };

    const updatedLead = {
      ...leadToEnroll,
      sequenceEnrollment: enrollment,
    };

    onUpdateLead(updatedLead);

    // Schedule the first follow-up in the central FollowUp planner!
    const stepObj = sequence.steps[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + stepObj.delayDays);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    onAddFollowUp({
      leadId: leadToEnroll.id,
      leadName: leadToEnroll.name,
      dueDate: dueDateStr,
      notes: `[Seq Step 1] Outreach ${stepObj.channel.toUpperCase()}: "${stepObj.title}"`,
      completed: false,
    });

    alert(`Enrolled "${leadToEnroll.name}" in ${sequence.name}!\nFirst step scheduled in Follow-Up Planner for ${dueDateStr}.`);
  };

  // Push next step in sequence to planner
  const handleProgressSequence = (leadObj: Lead) => {
    const enrollment = leadObj.sequenceEnrollment;
    if (!enrollment) return;

    const sequence = TEMPLATE_SEQUENCES.find((s) => s.id === enrollment.sequenceId);
    if (!sequence) return;

    const nextStepIndex = enrollment.currentStepIndex + 1;
    if (nextStepIndex >= sequence.steps.length) {
      // Completed sequence
      onUpdateLead({
        ...leadObj,
        sequenceEnrollment: null,
        notes: `${leadObj.notes}\n[Sequence Completed] Completed all steps of ${sequence.name}.`,
      });
      alert(`"${leadObj.name}" completed all follow-up steps in ${sequence.name}! Removed from active queue.`);
      return;
    }

    const nextStep = sequence.steps[nextStepIndex];
    const updatedEnrollment = {
      ...enrollment,
      currentStepIndex: nextStepIndex,
      history: [
        ...enrollment.history,
        {
          stepIndex: nextStepIndex,
          sentAt: new Date().toLocaleString(),
          channel: nextStep.channel,
          variantUsed: enrollment.abVariant,
          status: "sent" as const,
        }
      ]
    };

    onUpdateLead({
      ...leadObj,
      sequenceEnrollment: updatedEnrollment,
    });

    // Schedule in planner
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + nextStep.delayDays);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    onAddFollowUp({
      leadId: leadObj.id,
      leadName: leadObj.name,
      dueDate: dueDateStr,
      notes: `[Seq Step ${nextStepIndex + 1}] Outreach ${nextStep.channel.toUpperCase()}: "${nextStep.title}"`,
      completed: false,
    });

    alert(`Progressed "${leadObj.name}" to Step ${nextStepIndex + 1} (${nextStep.title})!\nScheduled in Follow-Up Planner for ${dueDateStr}.`);
  };

  // Auto recommend sequence based on score
  const getRecommendedSequence = (score: number) => {
    if (score >= 85) return "seq-hot";
    if (score >= 70) return "seq-medium";
    return "seq-standard";
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5.5 h-5.5 text-blue-400" />
            Automated Outreach & Follow-Up Sequences
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build multi-step nurture sequences across Email and WhatsApp. Target campaigns dynamically based on lead score, last contact date, and perform scientific A/B content tests.
          </p>
        </div>

        {/* Rapid Stats */}
        <div className="flex gap-4 self-start md:self-auto">
          <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">A/B Tests Active</span>
            <strong className="text-lg font-black text-white">3 Running</strong>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Avg Conversion</span>
            <strong className="text-lg font-black text-emerald-400">32.4%</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Selector & Leads List */}
        <div className="space-y-6">
          {/* Sequence template selector */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
              Select Sequence Track
            </h3>
            <div className="space-y-2.5">
              {TEMPLATE_SEQUENCES.map((seq) => {
                const isActive = seq.id === selectedSequenceId;
                return (
                  <button
                    key={seq.id}
                    onClick={() => {
                      setSelectedSequenceId(seq.id);
                      setActiveStepIndex(0);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer block ${
                      isActive
                        ? "bg-blue-500/10 border-blue-400/50 text-white shadow-md shadow-blue-500/5"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs md:text-sm">{seq.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                        {seq.steps.length} Steps
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {seq.description}
                    </p>
                    <div className="mt-2 text-[10px] font-bold text-blue-400 flex items-center justify-between">
                      <span>Targets: {seq.scoreRange}</span>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enrollment Panel */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
              Lead Enroller & Active Queue
            </h3>

            {leads.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No leads in pipeline. Head to AI Google Maps Prospector to search for candidates.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin divide-y divide-white/5 pr-1">
                {leads.map((lead) => {
                  const isEnrolled = !!lead.sequenceEnrollment;
                  const recSeqId = getRecommendedSequence(lead.score);
                  const recSeq = TEMPLATE_SEQUENCES.find((s) => s.id === recSeqId);

                  return (
                    <div key={lead.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-white text-xs">{lead.name}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Score: {lead.score} • {lead.category}
                          </span>
                        </div>
                        {isEnrolled ? (
                          <span className="text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                            Step {lead.sequenceEnrollment!.currentStepIndex + 1}
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-500 italic">
                            Unassigned
                          </span>
                        )}
                      </div>

                      {/* Enrollment Buttons */}
                      {isEnrolled ? (
                        <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-[10px] text-slate-300">
                          <div>
                            <span>Current: <strong>{TEMPLATE_SEQUENCES.find((s) => s.id === lead.sequenceEnrollment?.sequenceId)?.name.split(" ")[1]}</strong></span>
                          </div>
                          <button
                            onClick={() => handleProgressSequence(lead)}
                            className="text-blue-400 hover:text-white font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Next Step</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500 italic">
                            Rec: {recSeq?.name.split(" ")[1]}
                          </span>
                          <button
                            onClick={() => handleEnrollLead(lead, recSeqId)}
                            className="bg-blue-600/25 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 font-bold text-[10px] px-2 py-1 rounded transition-all cursor-pointer"
                          >
                            + Enroll Prospect
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center column: Step editor and sequence preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Steps Timeline Header */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-3">
              Campaign Pathway Steps Sequence
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5">
              {activeSequence.steps.map((step, idx) => {
                const isActive = idx === activeStepIndex;
                const isEmail = step.channel === "email";

                return (
                  <React.Fragment key={idx}>
                    <button
                      onClick={() => {
                        setActiveStepIndex(idx);
                        setEditingVariant("A");
                      }}
                      className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white border-blue-500 shadow"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="bg-black/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      {isEmail ? <Mail className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                      <div className="text-left leading-none">
                        <span className="block text-[10px] font-normal text-slate-300">Day {step.delayDays}</span>
                        <span>{step.title.substring(0, 15)}...</span>
                      </div>
                    </button>
                    {idx < activeSequence.steps.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* A/B Testing Head-to-Head Simulator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Variant A Card */}
            <div
              onClick={() => setEditingVariant("A")}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                editingVariant === "A"
                  ? "bg-blue-500/10 border-blue-400/50 text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/[0.08]"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/25 px-2.5 py-0.5 rounded border border-blue-500/20">
                  Variant A: Impact/ROI
                </span>
                <span className="text-[10px] text-slate-400">Direct Conversion Hook</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-center border-t border-white/5 pt-3">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Open Rate</span>
                  <strong className="text-sm font-black text-white">{activeStep.simulatedStats.openRateA}%</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Click/Reply</span>
                  <strong className="text-sm font-black text-blue-400">{activeStep.simulatedStats.clickRateA}%</strong>
                </div>
              </div>
              {editingVariant === "A" && (
                <div className="absolute top-2 right-2 text-blue-400 animate-pulse">
                  <ThumbsUp className="w-4 h-4 fill-blue-400/25" />
                </div>
              )}
            </div>

            {/* Variant B Card */}
            <div
              onClick={() => setEditingVariant("B")}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                editingVariant === "B"
                  ? "bg-teal-500/10 border-teal-400/50 text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/[0.08]"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider bg-teal-500/25 px-2.5 py-0.5 rounded border border-teal-500/20">
                  Variant B: Audit/Soft
                </span>
                <span className="text-[10px] text-slate-400">Educational Audit Hook</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-center border-t border-white/5 pt-3">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Open Rate</span>
                  <strong className="text-sm font-black text-white">{activeStep.simulatedStats.openRateB}%</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Click/Reply</span>
                  <strong className="text-sm font-black text-teal-400">{activeStep.simulatedStats.clickRateB}%</strong>
                </div>
              </div>
              {editingVariant === "B" && (
                <div className="absolute top-2 right-2 text-teal-400 animate-pulse">
                  <ThumbsUp className="w-4 h-4 fill-teal-400/25" />
                </div>
              )}
            </div>
          </div>

          {/* Active Template Preview with Placeholders Substituted */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg text-slate-950 ${activeStep.channel === "email" ? "bg-blue-400" : "bg-emerald-400"}`}>
                  {activeStep.channel === "email" ? <Mail className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Step {activeStep.stepNumber}: {activeStep.title}</h4>
                  <span className="text-[10px] text-slate-400">Trigger delay: {activeStep.delayDays === 0 ? "Immediate on enrollment" : `Scheduled ${activeStep.delayDays} days after preceding step`}</span>
                </div>
              </div>

              {/* Lead Substitute Selector */}
              {leads.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Substitute with:</span>
                  <select
                    value={activeLeadId}
                    onChange={(e) => setActiveLeadId(e.target.value)}
                    className="text-xs bg-[#0b0f19] border border-white/10 text-white rounded p-1 w-36 outline-none"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Editor vs Preview Display */}
            <div className="space-y-4">
              {activeStep.channel === "email" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Template Subject Line (Variant {editingVariant})
                  </label>
                  <input
                    type="text"
                    disabled={!editMode}
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full text-xs font-bold border border-white/10 rounded-lg p-2.5 bg-[#0b0f19] text-white focus:outline-none"
                    placeholder="Subject Line"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Template Message Body (Variant {editingVariant})
                  </label>
                  <button
                    onClick={() => {
                      if (editMode) {
                        // Save changes locally in state
                        const template = editingVariant === "A" ? activeStep.variantA : activeStep.variantB;
                        if (activeStep.channel === "email") template.subject = customSubject;
                        template.body = customBody;
                        setEditMode(false);
                      } else {
                        setEditMode(true);
                      }
                    }}
                    className="text-[10px] font-bold text-blue-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {editMode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Template</span>
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Template</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  disabled={!editMode}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={6}
                  className="w-full text-xs font-mono border border-white/10 rounded-lg p-3 bg-[#0b0f19] text-white focus:outline-none"
                  placeholder="Template Body"
                />
              </div>
            </div>

            {/* Personalization substitution box */}
            {activeLead && (
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 space-y-2 animate-fade-in">
                <span className="text-[10px] font-extrabold uppercase text-blue-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  Personalized Substitute Live Preview for {activeLead.name}
                </span>

                {activeStep.channel === "email" && (
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold block">Subject:</span>
                    <p className="text-white font-medium mb-2 bg-black/20 p-2 rounded border border-white/5">
                      {renderTemplate(customSubject, activeLead)}
                    </p>
                  </div>
                )}

                <div className="text-xs">
                  <span className="text-slate-400 font-bold block">Body Message:</span>
                  <div className="text-slate-200 bg-black/20 p-3 rounded border border-white/5 whitespace-pre-wrap leading-relaxed font-sans">
                    {renderTemplate(customBody, activeLead)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
