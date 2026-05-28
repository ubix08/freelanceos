import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Client, Proposal, Invoice, PricingConfig, Lead, Project } from "./types";
import { v4 as uuidv4 } from "uuid";

export interface AppState {
  clients: Client[];
  leads: Lead[];
  projects: Project[];
  proposals: Proposal[];
  invoices: Invoice[];
  pricingConfig: PricingConfig;
  
  // Actions
  addClient: (c: Omit<Client, "id" | "createdAt">) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addLead: (l: Omit<Lead, "id" | "createdAt">) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addProject: (p: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addProposal: (p: Omit<Proposal, "id" | "createdAt">) => void;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  addInvoice: (i: Omit<Invoice, "id" | "createdAt" | "invoiceNumber">) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  updatePricingConfig: (config: PricingConfig) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      clients: [
        { id: "c1", name: "Acme Corp", company: "Acme Inc", status: "ACTIVE", profitabilityScore: 85, createdAt: new Date().toISOString() },
        { id: "c2", name: "Startup IO", status: "PROSPECT", profitabilityScore: 60, createdAt: new Date().toISOString() }
      ],
      leads: [],
      projects: [],
      proposals: [],
      invoices: [],
      pricingConfig: {
        niche: "web-development",
        experienceLevel: "senior",
        hourlyRate: 100,
        targetMonthlyRevenue: 10000
      },

      addClient: (c) => set((state) => ({
        clients: [...state.clients, { ...c, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateClient: (id, updates) => set((state) => ({
        clients: state.clients.map((c) => c.id === id ? { ...c, ...updates } : c)
      })),
      addLead: (l) => set((state) => ({
        leads: [...state.leads, { ...l, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateLead: (id, updates) => set((state) => ({
        leads: state.leads.map((l) => l.id === id ? { ...l, ...updates } : l)
      })),
      addProject: (p) => set((state) => ({
        projects: [...state.projects, { ...p, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      addProposal: (p) => set((state) => ({
        proposals: [...state.proposals, { ...p, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateProposal: (id, updates) => set((state) => ({
        proposals: state.proposals.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
        addInvoice: (i) => set((state) => {
        const num = `INV-${new Date().getFullYear()}-${String(state.invoices.length + 1).padStart(4, "0")}`;
        return {
          invoices: [...state.invoices, { ...i, id: uuidv4(), invoiceNumber: num, createdAt: new Date().toISOString() }]
        };
      }),
      updateInvoice: (id, updates) => set((state) => ({
        invoices: state.invoices.map((i) => i.id === id ? { ...i, ...updates } : i)
      })),
      updatePricingConfig: (config) => set((state) => ({
        pricingConfig: { ...state.pricingConfig, ...config }
      }))
    }),
    {
      name: "freelanceros-storage",
    }
  )
);
