export interface Lead {
  id: string;
  name: string;
  email?: string;
  company?: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL_SENT" | "NEGOTIATING" | "WON" | "LOST";
  estimatedValue?: number;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  budget?: number;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
  status: "ACTIVE" | "INACTIVE" | "PROSPECT" | "CHURNED";
  profitabilityScore?: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  clientId?: string;
  title: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
  content?: any;
  totalValue?: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  total: number;
  dueDate?: string;
  createdAt: string;
}

export interface PricingConfig {
  niche?: string;
  experienceLevel?: string;
  hourlyRate?: number;
  targetMonthlyRevenue?: number;
}
