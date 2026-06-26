import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in your environment secrets. Please set it in Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Searches Google Maps / Search Grounding endpoint
app.post("/api/leads/search", async (req, res) => {
  try {
    const { query, location, agencyConfig } = req.body;
    if (!query) {
       res.status(400).json({ error: "Search query is required." });
       return;
    }

    const ai = getGeminiClient();
    const searchQuery = location ? `${query} in ${location}` : query;

    const systemInstruction = `You are an expert sales intelligence assistant for "SWEN TECH Lead Hunter".
Your task is to search Google/Google Maps to find REAL active businesses in the specified industry and location.
You will evaluate their web presence, check for a website, extract contact details, and calculate an AI lead score (0-100).
The agency seeking leads is: "${agencyConfig?.name || 'SWEN TECH'}".
They offer these services: "${agencyConfig?.services || 'Web Design, SEO, Google Reviews, Reputation Management, and Social Media'}".
Their agency pitch is: "${agencyConfig?.pitch || 'We help local businesses modernize their websites, increase their search rank, and boost customer reviews.'}".

Identify and evaluate exactly 6 to 8 real businesses.
For each business, analyze their digital footprint to calculate a lead score (0 to 100):
- If they have NO website (or a broken link), they are a HOT lead for web design (score them high: 85-98) and explain why in scoreExplanation.
- If they have low Google Maps rating (< 4.2 stars) or very few reviews (< 20 reviews), they are a HOT lead for Reputation/Review services (score them high: 75-90) and note this.
- If they have a website, analyze what services could benefit them.
- Find contact details such as phone and email if possible.

Generate a valid JSON array of objects. Do NOT use markdown. Follow the schema strictly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Find 8 real businesses for: "${searchQuery}". Score them and output details in structured JSON.`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Official business name" },
              website: { type: Type.STRING, description: "Official website URL, or empty string if none exists" },
              address: { type: Type.STRING, description: "Full street address" },
              phone: { type: Type.STRING, description: "Contact phone number, or empty string" },
              category: { type: Type.STRING, description: "Primary category/industry" },
              rating: { type: Type.NUMBER, description: "Google rating out of 5, or null if none" },
              reviewsCount: { type: Type.INTEGER, description: "Number of reviews, or 0" },
              email: { type: Type.STRING, description: "Discovered email address, or empty string" },
              socials: { type: Type.STRING, description: "Comma-separated social links if found, or empty string" },
              score: { type: Type.INTEGER, description: "Lead score from 10 to 100 based on fit" },
              scoreExplanation: { type: Type.STRING, description: "2-3 sentences explaining why they got this score and what specific service of ours to pitch." }
            },
            required: ["name", "website", "address", "phone", "category", "rating", "reviewsCount", "email", "socials", "score", "scoreExplanation"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const leads = JSON.parse(text);
    res.json({ leads });
  } catch (error: any) {
    console.error("Search leads error:", error);
    res.status(500).json({ error: error.message || "Failed to search leads using Gemini grounding." });
  }
});

// 2. Personalizes WhatsApp & Email messages endpoint
app.post("/api/leads/personalize", async (req, res) => {
  try {
    const { lead, agencyConfig } = req.body;
    if (!lead || !agencyConfig) {
       res.status(400).json({ error: "Lead and agencyConfig are required." });
       return;
    }

    const ai = getGeminiClient();

    const prompt = `Draft personalized outreach messages for this prospect business.
Business details:
- Name: ${lead.name}
- Category: ${lead.category}
- Website: ${lead.website || 'None (Needs website creation!)'}
- Phone: ${lead.phone || 'None'}
- Address: ${lead.address}
- Google Maps Rating: ${lead.rating ? `${lead.rating} stars` : 'Not Rated'} (${lead.reviewsCount || 0} reviews)
- AI Scoring Insight: ${lead.scoreExplanation}

Our Agency Config:
- Agency Name: ${agencyConfig.name}
- Services we sell: ${agencyConfig.services}
- Pitch: ${agencyConfig.pitch}
- Representative Name: ${agencyConfig.contactName}
- Contact Details: Email: ${agencyConfig.contactEmail}, Phone: ${agencyConfig.contactPhone}

Please output:
1. A highly tailored, benefit-driven EMAIL. Include a hook subject line and a conversational body. Call out their specific weakness (e.g. no website, or low rating/reviews, or poor Google listing) in a helpful, non-offensive tone. Show how ${agencyConfig.name} can solve it.
2. A direct, engaging WHATSAPP message. Keep it short, use 1-2 relevant emojis, get straight to the point, and have a clear call-to-action.

Output a single valid JSON object matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emailSubject: { type: Type.STRING, description: "Email subject line" },
            emailBody: { type: Type.STRING, description: "Email body text (with appropriate line breaks)" },
            whatsappMessage: { type: Type.STRING, description: "Personalized WhatsApp message" }
          },
          required: ["emailSubject", "emailBody", "whatsappMessage"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Personalization error:", error);
    res.status(500).json({ error: error.message || "Failed to generate personalization." });
  }
});

// 3. CRM Integration Endpoint: Test Connection
app.post("/api/crm/test-connection", async (req, res) => {
  try {
    const { crmType, apiKey, sandbox, instanceUrl } = req.body;
    if (!crmType) {
      res.status(400).json({ error: "CRM type is required." });
      return;
    }

    if (sandbox) {
      // Simulate validation delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      res.json({
        success: true,
        message: `Successfully connected to SWEN TECH sandbox environment for ${crmType === "hubspot" ? "HubSpot" : "Salesforce"}.`,
        connectionDetails: {
          portalId: crmType === "hubspot" ? "HB-9831520-SANDBOX" : undefined,
          organizationId: crmType === "salesforce" ? "SF-ORG-00D50000000ISU" : undefined,
          status: "Verified",
          rateLimitRemaining: 150,
        }
      });
      return;
    }

    if (!apiKey) {
      res.status(400).json({ error: "API Key or Access Token is required for non-sandbox modes." });
      return;
    }

    if (crmType === "hubspot") {
      const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=1", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HubSpot API rejection: ${response.status} - ${errBody}`);
      }
      const data = await response.json();
      res.json({ success: true, message: "HubSpot connection verified successfully!", data });
    } else {
      // Salesforce
      const url = instanceUrl ? instanceUrl.replace(/\/$/, "") : "https://login.salesforce.com";
      const response = await fetch(`${url}/services/data/v60.0/limits`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Salesforce API rejection: ${response.status} - ${errBody}`);
      }
      const data = await response.json();
      res.json({ success: true, message: "Salesforce connection verified successfully!", data });
    }
  } catch (error: any) {
    console.error("CRM Test Connection error:", error);
    res.status(500).json({ error: error.message || "Failed to verify connection to CRM API." });
  }
});

// 4. CRM Integration Endpoint: Push Lead
app.post("/api/crm/push", async (req, res) => {
  try {
    const { crmType, apiKey, sandbox, instanceUrl, lead } = req.body;
    if (!crmType || !lead) {
      res.status(400).json({ error: "CRM type and Lead details are required." });
      return;
    }

    if (sandbox) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockId = `${crmType === "hubspot" ? "hs" : "sf"}-${Math.floor(100000 + Math.random() * 900000)}`;
      res.json({
        success: true,
        message: `Successfully pushed lead "${lead.name}" to ${crmType === "hubspot" ? "HubSpot Contacts" : "Salesforce Leads"}.`,
        externalId: mockId,
        syncedAt: new Date().toISOString(),
      });
      return;
    }

    if (!apiKey) {
      res.status(400).json({ error: "API key/Access Token is required to push to production CRM." });
      return;
    }

    if (crmType === "hubspot") {
      const nameParts = (lead.name || "Business").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "Company";

      const properties = {
        firstname: firstName,
        lastname: lastName,
        company: lead.name,
        website: lead.website || "",
        phone: lead.phone || "",
        address: lead.address || "",
        industry: lead.category || "",
        email: lead.email || `${lead.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
        description: `Lead score: ${lead.score}/100. Gap Analysis: ${lead.scoreExplanation}\nNotes: ${lead.notes || ""}`
      };

      const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ properties })
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HubSpot Push failed: ${response.status} - ${errBody}`);
      }

      const data = await response.json();
      res.json({
        success: true,
        message: `Successfully pushed contact to HubSpot.`,
        externalId: data.id,
        syncedAt: new Date().toISOString()
      });
    } else {
      const url = instanceUrl ? instanceUrl.replace(/\/$/, "") : "";
      if (!url) {
        res.status(400).json({ error: "Salesforce Instance URL is required for live sync." });
        return;
      }

      const bodyPayload = {
        LastName: lead.name || "Unknown Company",
        Company: lead.name || "Unknown Company",
        Website: lead.website || "",
        Phone: lead.phone || "",
        Street: lead.address || "",
        Industry: lead.category || "",
        Email: lead.email || `${lead.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
        Description: `Lead score: ${lead.score}/100. Gap Analysis: ${lead.scoreExplanation}\nNotes: ${lead.notes || ""}`,
        Status: "Open - Not Contacted"
      };

      const response = await fetch(`${url}/services/data/v60.0/sobjects/Lead`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Salesforce Lead Push failed: ${response.status} - ${errBody}`);
      }

      const data = await response.json();
      res.json({
        success: true,
        message: `Successfully created Lead in Salesforce.`,
        externalId: data.id,
        syncedAt: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error("CRM Push error:", error);
    res.status(500).json({ error: error.message || "Failed to push data to CRM." });
  }
});

// 5. CRM Integration Endpoint: Pull / Enrich
app.post("/api/crm/enrich", async (req, res) => {
  try {
    const { crmType, apiKey, sandbox, instanceUrl, email, companyName } = req.body;
    if (!crmType) {
      res.status(400).json({ error: "CRM type is required." });
      return;
    }

    if (sandbox) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const randomRevenue = Math.floor(150000 + Math.random() * 850000);
      const randomEmployees = Math.floor(5 + Math.random() * 45);
      const technologies = ["WordPress", "Google Analytics", "Square POS", "Yelp for Business"].slice(0, Math.floor(Math.random() * 4) + 1);
      
      res.json({
        success: true,
        enrichedData: {
          annualRevenue: `$${randomRevenue.toLocaleString()}`,
          employeeCount: randomEmployees,
          associatedDeals: Math.floor(Math.random() * 2),
          techStack: technologies,
          decisionMakerName: "John Doe (Director of Operations)",
          linkedinCompanyUrl: `linkedin.com/company/${(companyName || "business").toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          lastCrmActivity: "Outreach logged 15 days ago",
          customerStatus: Math.random() > 0.7 ? "Existing Opportunity" : "Qualified Cold Prospect",
        }
      });
      return;
    }

    if (!apiKey) {
      res.status(400).json({ error: "API key/Access Token is required to enrich using live CRM." });
      return;
    }

    if (crmType === "hubspot") {
      const searchResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "email",
                  operator: "EQ",
                  value: email || "nonexistent-email-placeholder-swen@example.com"
                }
              ]
            }
          ],
          properties: ["annualrevenue", "numemployees", "linkedin", "phone", "website", "lifecyclestage"]
        })
      });

      if (!searchResponse.ok) {
        throw new Error(`HubSpot enrichment lookup failed with status: ${searchResponse.status}`);
      }

      const searchResult = await searchResponse.json();
      if (searchResult.results && searchResult.results.length > 0) {
        const result = searchResult.results[0];
        res.json({
          success: true,
          enrichedData: {
            annualRevenue: result.properties.annualrevenue ? `$${Number(result.properties.annualrevenue).toLocaleString()}` : "N/A",
            employeeCount: result.properties.numemployees || "N/A",
            customerStatus: result.properties.lifecyclestage || "Contact Found",
            decisionMakerName: `${result.properties.firstname || ""} ${result.properties.lastname || ""}`.trim() || "N/A",
            lastCrmActivity: `Synced: ID ${result.id}`,
            associatedDeals: "Click CRM to view details"
          }
        });
      } else {
        res.json({ success: false, error: "No matching contact found in your HubSpot CRM to pull enrichment details from." });
      }
    } else {
      const url = instanceUrl ? instanceUrl.replace(/\/$/, "") : "";
      if (!url) {
        res.status(400).json({ error: "Salesforce Instance URL is required for live sync." });
        return;
      }

      const queryUrl = `${url}/services/data/v60.0/query?q=${encodeURIComponent(
        `SELECT Id, Name, Company, AnnualRevenue, NumberOfEmployees, Status, Title FROM Lead WHERE Email='${email || ""}' LIMIT 1`
      )}`;

      const queryResponse = await fetch(queryUrl, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!queryResponse.ok) {
        throw new Error(`Salesforce enrichment query failed with status: ${queryResponse.status}`);
      }

      const queryResult = await queryResponse.json();
      if (queryResult.records && queryResult.records.length > 0) {
        const leadRecord = queryResult.records[0];
        res.json({
          success: true,
          enrichedData: {
            annualRevenue: leadRecord.AnnualRevenue ? `$${Number(leadRecord.AnnualRevenue).toLocaleString()}` : "N/A",
            employeeCount: leadRecord.NumberOfEmployees || "N/A",
            customerStatus: leadRecord.Status || "N/A",
            decisionMakerName: `${leadRecord.Name} (${leadRecord.Title || "Title Unknown"})`,
            lastCrmActivity: `Synced: ID ${leadRecord.Id}`,
            associatedDeals: "N/A"
          }
        });
      } else {
        res.json({ success: false, error: "No matching Lead found in your Salesforce CRM with that email address." });
      }
    }
  } catch (error: any) {
    console.error("CRM Enrichment error:", error);
    res.status(500).json({ error: error.message || "Failed to query enrichment data." });
  }
});

// Setup development or production front-end serving
async function setupFrontend() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static assets in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SWEN TECH Lead Hunter server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  setupFrontend().catch((err) => {
    console.error("Failed to start server:", err);
  });
}

export default app;
