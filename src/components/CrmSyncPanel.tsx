import React, { useState } from "react";
import { Lead, AgencyConfig } from "../types";
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings,
  Download,
  Upload,
  Activity,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Search,
  ExternalLink,
} from "lucide-react";

interface CrmSyncPanelProps {
  leads: Lead[];
  onUpdateLead: (updatedLead: Lead) => void;
  onImportLeads: (leads: Partial<Lead>[]) => void;
  agencyConfig: AgencyConfig;
}

export default function CrmSyncPanel({ leads, onUpdateLead, onImportLeads, agencyConfig }: CrmSyncPanelProps) {
  const [crmType, setCrmType] = useState<"hubspot" | "salesforce">("hubspot");
  const [sandbox, setSandbox] = useState<boolean>(true);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("swen_crm_apikey") || "");
  const [instanceUrl, setInstanceUrl] = useState<string>(
    () => localStorage.getItem("swen_crm_url") || "https://na1.salesforce.com"
  );

  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    message: string;
    details?: any;
  } | null>(() => {
    const saved = localStorage.getItem("swen_crm_status");
    return saved ? JSON.parse(saved) : null;
  });

  const [syncLogs, setSyncLogs] = useState<{ time: string; action: string; status: "success" | "error" }[]>(() => {
    const saved = localStorage.getItem("swen_crm_logs");
    return saved ? JSON.parse(saved) : [
      { time: new Date(Date.now() - 3600000).toLocaleTimeString(), action: "CRM Module initialized", status: "success" }
    ];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [syncingLeadId, setSyncingLeadId] = useState<string | null>(null);
  const [enrichingLeadId, setEnrichingLeadId] = useState<string | null>(null);

  const saveCrmSettings = (newKey: string, newUrl: string, newStatus: any, newLogs?: any) => {
    localStorage.setItem("swen_crm_apikey", newKey);
    localStorage.setItem("swen_crm_url", newUrl);
    if (newStatus) localStorage.setItem("swen_crm_status", JSON.stringify(newStatus));
    if (newLogs) localStorage.setItem("swen_crm_logs", JSON.stringify(newLogs));
  };

  const addLog = (action: string, status: "success" | "error") => {
    const newLogs = [{ time: new Date().toLocaleTimeString(), action, status }, ...syncLogs].slice(0, 20);
    setSyncLogs(newLogs);
    saveCrmSettings(apiKey, instanceUrl, connectionStatus, newLogs);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);
    try {
      const response = await fetch("/api/crm/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crmType,
          apiKey: sandbox ? "" : apiKey,
          sandbox,
          instanceUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to establish connection.");
      }

      const statusObj = {
        connected: true,
        message: data.message,
        details: data.connectionDetails || data.data,
      };
      setConnectionStatus(statusObj);
      addLog(`Tested connection to ${crmType.toUpperCase()} (${sandbox ? "Sandbox" : "Production"})`, "success");
      saveCrmSettings(apiKey, instanceUrl, statusObj);
    } catch (err: any) {
      const statusObj = {
        connected: false,
        message: err.message || "Connection refused.",
      };
      setConnectionStatus(statusObj);
      addLog(`Connection test failed: ${err.message}`, "error");
      saveCrmSettings(apiKey, instanceUrl, statusObj);
    } finally {
      setTesting(false);
    }
  };

  const handlePushLead = async (lead: Lead) => {
    setSyncingLeadId(lead.id);
    try {
      const response = await fetch("/api/crm/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crmType,
          apiKey: sandbox ? "" : apiKey,
          sandbox,
          instanceUrl,
          lead,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to push lead.");
      }

      onUpdateLead({
        ...lead,
        crmSyncStatus: {
          synced: true,
          crmType,
          syncedAt: data.syncedAt || new Date().toLocaleString(),
          externalId: data.externalId,
          enrichedData: lead.crmSyncStatus?.enrichedData || undefined,
        },
      });

      addLog(`Pushed lead "${lead.name}" to ${crmType.toUpperCase()} (ID: ${data.externalId})`, "success");
    } catch (err: any) {
      addLog(`Push failed for "${lead.name}": ${err.message}`, "error");
      alert(`Sync Failed: ${err.message}`);
    } finally {
      setSyncingLeadId(null);
    }
  };

  const handlePullEnrichment = async (lead: Lead) => {
    setEnrichingLeadId(lead.id);
    try {
      const response = await fetch("/api/crm/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crmType,
          apiKey: sandbox ? "" : apiKey,
          sandbox,
          instanceUrl,
          email: lead.email,
          companyName: lead.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to enrich.");
      }

      if (!data.success) {
        throw new Error(data.error || "Record not found in CRM.");
      }

      onUpdateLead({
        ...lead,
        crmSyncStatus: lead.crmSyncStatus
          ? {
              ...lead.crmSyncStatus,
              enrichedData: data.enrichedData,
            }
          : {
              synced: false,
              crmType,
              syncedAt: "",
              enrichedData: data.enrichedData,
            },
      });

      addLog(`Pulled enrichment profile for "${lead.name}"`, "success");
    } catch (err: any) {
      addLog(`Enrichment failed for "${lead.name}": ${err.message}`, "error");
      alert(`Enrichment Failed: ${err.message}. ${sandbox ? "" : "Ensure a contact with matching email or company exists in your CRM database."}`);
    } finally {
      setEnrichingLeadId(null);
    }
  };

  const handleDisconnect = () => {
    setConnectionStatus(null);
    localStorage.removeItem("swen_crm_status");
    addLog(`Disconnected from ${crmType.toUpperCase()}`, "success");
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert("No leads to export.");
      return;
    }
    const headers = [
      "Name",
      "Website",
      "Category",
      "Phone",
      "Address",
      "Email",
      "Socials",
      "Score",
      "ScoreExplanation",
      "Stage",
      "Notes"
    ];
    
    const escapeCsvValue = (val: any) => {
      if (val === null || val === undefined) return "";
      let str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        str = str.replace(/"/g, '""');
        return `"${str}"`;
      }
      return str;
    };

    const csvRows = [headers.join(",")];
    for (const lead of leads) {
      const row = [
        lead.name,
        lead.website,
        lead.category,
        lead.phone,
        lead.address,
        lead.email,
        lead.socials,
        lead.score,
        lead.scoreExplanation,
        lead.stage,
        lead.notes
      ];
      csvRows.push(row.map(escapeCsvValue).join(","));
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `swen_tech_leads_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const parseCSV = (csvText: string): string[][] => {
          const lines: string[][] = [];
          const row: string[] = [];
          let inQuotes = false;
          let currentVal = "";

          for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i];
            const nextChar = csvText[i + 1];
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                currentVal += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === "," && !inQuotes) {
              row.push(currentVal.trim());
              currentVal = "";
            } else if ((char === "\r" || char === "\n") && !inQuotes) {
              row.push(currentVal.trim());
              if (row.length > 1 || row[0] !== "") {
                lines.push([...row]);
              }
              row.length = 0;
              currentVal = "";
              if (char === "\r" && nextChar === "\n") {
                i++;
              }
            } else {
              currentVal += char;
            }
          }
          if (row.length > 0 || currentVal !== "") {
            row.push(currentVal.trim());
            lines.push(row);
          }
          return lines;
        };

        const rows = parseCSV(text);
        if (rows.length < 2) {
          alert("Invalid CSV: Must have at least a header row and one data row.");
          return;
        }

        const headers = rows[0].map(h => h.toLowerCase());
        const findColumnIndex = (names: string[]) => {
          return headers.findIndex(h => names.includes(h));
        };

        const nameIdx = findColumnIndex(["name", "business name", "company", "title"]);
        const websiteIdx = findColumnIndex(["website", "site", "web", "url"]);
        const categoryIdx = findColumnIndex(["category", "industry", "type"]);
        const phoneIdx = findColumnIndex(["phone", "telephone", "phone number", "contact"]);
        const addressIdx = findColumnIndex(["address", "location", "street"]);
        const emailIdx = findColumnIndex(["email", "mail", "email address"]);
        const socialsIdx = findColumnIndex(["socials", "social links", "facebook", "instagram"]);
        const scoreIdx = findColumnIndex(["score", "lead score", "fit score"]);
        const explanationIdx = findColumnIndex(["scoreexplanation", "explanation", "score explanation", "insight"]);
        const stageIdx = findColumnIndex(["stage", "status", "pipeline stage"]);
        const notesIdx = findColumnIndex(["notes", "note", "comments"]);

        if (nameIdx === -1) {
          alert("Invalid CSV: A 'Name' column is required.");
          return;
        }

        const importedLeads: Partial<Lead>[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length === 0 || (row.length === 1 && row[0] === "")) continue;

          const name = row[nameIdx];
          if (!name) continue;

          const website = websiteIdx !== -1 ? row[websiteIdx] : "";
          const category = categoryIdx !== -1 ? row[categoryIdx] : "General";
          const phone = phoneIdx !== -1 ? row[phoneIdx] : "";
          const address = addressIdx !== -1 ? row[addressIdx] : "Unknown Address";
          const email = emailIdx !== -1 ? row[emailIdx] : "";
          const socials = socialsIdx !== -1 ? row[socialsIdx] : "";
          const score = scoreIdx !== -1 && !isNaN(Number(row[scoreIdx])) ? Number(row[scoreIdx]) : 50;
          const scoreExplanation = explanationIdx !== -1 ? row[explanationIdx] : "Imported via CSV.";
          const stage = stageIdx !== -1 ? (row[stageIdx].toLowerCase() as Lead["stage"]) : "new";
          const notes = notesIdx !== -1 ? row[notesIdx] : "";

          importedLeads.push({
            name,
            website,
            category,
            phone,
            address,
            email,
            socials,
            score,
            scoreExplanation,
            stage: ["new", "contacted", "discussion", "proposal", "won", "lost"].includes(stage) ? stage : "new",
            notes
          });
        }

        if (importedLeads.length === 0) {
          alert("No valid leads found in the CSV file.");
          return;
        }

        onImportLeads(importedLeads);
        alert(`Successfully imported ${importedLeads.length} leads!`);
        e.target.value = "";
      } catch (err: any) {
        console.error(err);
        alert(`Error importing CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Filter leads list
  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Settings Panel */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            CRM Integration Configuration
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Link Lead Hunter to your Salesforce or HubSpot workspace to synchronize prospect contacts, notes, and metrics.
          </p>
        </div>

        {/* CRM Type Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
            Select CRM Platform
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setCrmType("hubspot");
                setConnectionStatus(null);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                crmType === "hubspot"
                  ? "border-orange-500/50 bg-orange-500/10 text-white"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <Database className="w-5 h-5 text-orange-400" />
              <span className="text-xs font-bold">HubSpot CRM</span>
            </button>
            <button
              onClick={() => {
                setCrmType("salesforce");
                setConnectionStatus(null);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                crmType === "salesforce"
                  ? "border-blue-500/50 bg-blue-500/10 text-white"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <Database className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold">Salesforce CRM</span>
            </button>
          </div>
        </div>

        {/* Environment Mode */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Developer Testing Sandbox</span>
            <span className="text-[10px] text-slate-400">Simulate API actions without live keys</span>
          </div>
          <button
            onClick={() => {
              setSandbox(!sandbox);
              setConnectionStatus(null);
            }}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              sandbox ? "bg-emerald-500" : "bg-slate-700"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                sandbox ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Live Config Inputs */}
        {!sandbox && (
          <div className="space-y-4 animate-fade-in">
            {crmType === "salesforce" && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">
                  Salesforce Instance URL
                </label>
                <input
                  type="text"
                  value={instanceUrl}
                  onChange={(e) => {
                    setInstanceUrl(e.target.value);
                    saveCrmSettings(apiKey, e.target.value, connectionStatus);
                  }}
                  placeholder="e.g. https://mycompany.my.salesforce.com"
                  className="w-full text-xs border border-white/10 bg-[#0b0f19] rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">
                {crmType === "hubspot" ? "Private App Access Token" : "OAuth Access Token / Secret"}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  saveCrmSettings(e.target.value, instanceUrl, connectionStatus);
                }}
                placeholder={crmType === "hubspot" ? "pat-na1-xxxxxx-xxxx-xxxx" : "00Dxxxxxxxxx..."}
                className="w-full text-xs border border-white/10 bg-[#0b0f19] rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Action Button & Status Block */}
        <div className="space-y-3">
          {connectionStatus?.connected ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Connection Verified</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                    {connectionStatus.message}
                  </p>
                </div>
              </div>
              {connectionStatus.details && (
                <div className="bg-[#0b0f19] p-2.5 rounded-lg border border-white/5 font-mono text-[9px] text-slate-400 max-h-24 overflow-y-auto">
                  {JSON.stringify(connectionStatus.details, null, 2)}
                </div>
              )}
              <button
                onClick={handleDisconnect}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition-all border border-white/10"
              >
                Disconnect Connection
              </button>
            </div>
          ) : (
            <button
              onClick={handleTestConnection}
              disabled={testing || (!sandbox && !apiKey)}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-blue-500/15"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to {crmType.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Test & Authorize Link</span>
                </>
              )}
            </button>
          )}

          {connectionStatus?.connected === false && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Connection Failed</span>
                <p className="text-[10px] text-rose-300 leading-tight mt-0.5">
                  {connectionStatus.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Integration Instructions */}
        <div className="border border-white/10 bg-white/5 rounded-xl p-4 space-y-2 text-[11px] text-slate-400 leading-relaxed">
          <h4 className="font-bold text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Integration Guidelines
          </h4>
          {crmType === "hubspot" ? (
            <ol className="list-decimal pl-4 space-y-1">
              <li>Open HubSpot Settings &gt; Integrations &gt; Private Apps.</li>
              <li>Create a Private App and select <code className="text-orange-400 font-mono">crm.objects.contacts.write</code> scope.</li>
              <li>Copy the Access Token and paste it here!</li>
            </ol>
          ) : (
            <ol className="list-decimal pl-4 space-y-1">
              <li>Log in to your Salesforce Developer Sandbox/Account.</li>
              <li>Register a Connected App to obtain Client Credentials or Use OAuth login.</li>
              <li>Ensure your User Account has API permissions activated.</li>
            </ol>
          )}
        </div>

        {/* CSV Import/Export Manager Card */}
        <div className="border border-white/10 bg-white/5 rounded-xl p-4 space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            CSV Lead Import & Export
          </h4>
          <p className="text-[11px] text-slate-400 leading-normal">
            Bulk upload prospects from a custom CSV spreadsheet or download your scored target list to load into outbound dialers or messaging campaigns.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-[10px] py-2 px-3 rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <label className="flex items-center justify-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-[10px] py-2 px-3 rounded-lg transition-all cursor-pointer shadow-sm relative">
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Sync List */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Pipeline Synchronization & Enrichment</h3>
            <p className="text-xs text-slate-400">Push Lead profiles to CRM or fetch enrichment insights dynamically.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads to sync..."
              className="pl-9 pr-4 py-2 text-xs border border-white/10 bg-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-56"
            />
          </div>
        </div>

        {/* Leads Table Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Database className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No leads found matching query.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredLeads.map((lead) => {
                const isSynced = lead.crmSyncStatus?.synced;
                const syncData = lead.crmSyncStatus;
                const hasEnrichment = !!syncData?.enrichedData;

                return (
                  <div key={lead.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    {/* Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                        <span className="text-[10px] font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded font-mono">
                          Score: {lead.score}
                        </span>
                        {isSynced ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Synced ({syncData?.crmType?.toUpperCase()})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded border border-white/5">
                            Not Synced
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>📧 {lead.email || "No Email"}</span>
                        <span>🌐 {lead.website ? lead.website.replace(/^https?:\/\/(www\.)?/, "") : "No website"}</span>
                        {syncData?.syncedAt && (
                          <span className="text-slate-500 text-[10px]">Last synced: {syncData.syncedAt}</span>
                        )}
                      </div>

                      {/* Enrichment highlight */}
                      {hasEnrichment && (
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] animate-fade-in text-slate-300">
                          <div>
                            <span className="text-slate-400 block font-bold uppercase tracking-wider">Revenue</span>
                            <strong className="text-white text-xs">{syncData.enrichedData?.annualRevenue}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold uppercase tracking-wider">Employees</span>
                            <strong className="text-white text-xs">{syncData.enrichedData?.employeeCount}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold uppercase tracking-wider">Decision Maker</span>
                            <strong className="text-white text-xs text-ellipsis block overflow-hidden whitespace-nowrap" title={syncData.enrichedData?.decisionMakerName}>
                              {syncData.enrichedData?.decisionMakerName}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold uppercase tracking-wider">Status</span>
                            <strong className="text-blue-400 text-xs font-semibold">{syncData.enrichedData?.customerStatus}</strong>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {/* Pull enrichment button */}
                      <button
                        onClick={() => handlePullEnrichment(lead)}
                        disabled={enrichingLeadId === lead.id}
                        title="Pull enrichment details based on Lead website and domain from CRM"
                        className="flex items-center gap-1 bg-white/5 hover:bg-white/10 disabled:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all border border-white/10 cursor-pointer"
                      >
                        {enrichingLeadId === lead.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span>Enrich Profile</span>
                      </button>

                      {/* Push lead button */}
                      <button
                        onClick={() => handlePushLead(lead)}
                        disabled={syncingLeadId === lead.id || (!connectionStatus?.connected && !sandbox)}
                        className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                          isSynced
                            ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-800 disabled:text-slate-500 border border-transparent"
                        }`}
                      >
                        {syncingLeadId === lead.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isSynced ? "Resync Lead" : "Push to CRM"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sync Log Feed */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Integration Log Feed
            </h4>
            <span className="text-[10px] text-slate-500">Showing last 20 operations</span>
          </div>

          <div className="bg-[#0b0f19] rounded-xl border border-white/5 p-3 font-mono text-[11px] space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
            {syncLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-400">
                <span className="text-slate-600 font-sans shrink-0">{log.time}</span>
                <span className={log.status === "error" ? "text-rose-400" : "text-emerald-400"}>
                  {log.status === "error" ? "✖" : "✔"}
                </span>
                <span className="text-slate-300 break-all">{log.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
