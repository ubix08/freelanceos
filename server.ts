import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Scope Analysis
  app.post("/api/pricing/analyze-scope", async (req, res) => {
    try {
      const { description, niche, experienceLevel, hourlyRate } = req.body;
      
      const prompt = `
You are an experienced freelance project estimator. 
Analyze this project and provide realistic estimates in JSON.

<project_description>
${description}
</project_description>

<context>
<niche>${niche || "general"}</niche>
<experience_level>${experienceLevel || "mid"}</experience_level>
<typical_hourly_rate>${hourlyRate || 50}</typical_hourly_rate>
</context>

Calculate estimated hours based on the complexity described.
Return a valid JSON object matching this schema exactly:
{
  "estimatedHours": { "low": number, "mid": number, "high": number },
  "complexityScore": number, // 1-10
  "pricingModel": "fixed" | "hourly" | "retainer",
  "recommendedPrice": { "low": number, "mid": number, "high": number, "currency": "USD" },
  "scopeRisks": [ { "risk": "string", "severity": "low" | "medium" | "high", "mitigation": "string" } ],
  "breakdown": [ { "phase": "string", "hours": number, "description": "string" } ]
}
Respond with ONLY the JSON object.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      res.json({ data: result });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // API Route: AI Proposal Generation
  app.post("/api/proposals/generate", async (req, res) => {
    try {
      const { clientName, deliverables, goals, timeline, tone } = req.body;
      
      const prompt = `
You are an expert freelance proposal writer.
Generate a complete freelance proposal as a valid JSON object.

<client_name>${clientName}</client_name>
<deliverables>${deliverables}</deliverables>
<goals>${goals}</goals>
<timeline>${timeline}</timeline>
<tone>${tone}</tone>

Return JSON matching this schema:
{
  "executiveSummary": "string",
  "understanding": "string",
  "approach": "string",
  "deliverables": [ { "name": "string", "description": "string" } ],
  "timeline": [ { "phase": "string", "duration": "string", "description": "string" } ],
  "investment": { "name": "string", "price": number, "description": "string" },
  "whyMe": "string",
  "callToAction": "string"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json({ data: result });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // API Route: AI Copilot Chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      const systemInstruction = `
You are an expert Freelance Business Advisor, acting as an AI Copilot for FreelancerOS.
Your goal is to help the freelancer with pricing, negotiation, strategy, and client management.

<context>
Clients: ${JSON.stringify(context?.clients || [])}
Projects: ${JSON.stringify(context?.projects || [])}
Recent Invoices: ${JSON.stringify(context?.invoices || [])}
</context>

Respond completely in markdown. Be concise, actionable, and professional.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemInstruction }] },
          { role: "model", parts: [{ text: "Understood. I am ready to help." }] },
          ...messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        ]
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
