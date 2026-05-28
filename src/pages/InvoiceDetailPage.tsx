import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import { Button, Card, Input } from "../components/ui";
import { ArrowLeft, Check, Send } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { format } from "date-fns";
import { useState } from "react";

export function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, updateInvoice, clients } = useAppStore();

  const invoice = invoices.find(i => i.id === id);
  const client = clients.find(c => c.id === invoice?.clientId);

  if (!invoice) {
    return <div className="p-8 text-text-muted">Invoice not found.</div>;
  }

  const handleStateChange = (status: any) => {
     updateInvoice(invoice.id, { status });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
           <Button variant="outline" onClick={() => navigate("/invoices")} className="p-2">
             <ArrowLeft className="w-4 h-4" />
           </Button>
           <div>
             <h1 className="text-2xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
             <p className="text-text-secondary mt-1">Status: <span className="font-semibold text-text-primary">{invoice.status}</span></p>
           </div>
        </div>
        <div className="flex gap-2">
           {invoice.status === "DRAFT" && <Button onClick={() => handleStateChange("SENT")}><Send className="w-4 h-4 mr-2" /> Mark as Sent</Button>}
           {invoice.status === "SENT" && (
                 <Button className="bg-success text-white hover:bg-success/90" onClick={() => handleStateChange("PAID")}><Check className="w-4 h-4 mr-2" /> Mark as Paid</Button>
           )}
        </div>
      </div>

      <Card className="p-12 space-y-12 bg-white text-black">
         <div className="flex justify-between items-start">
            <div>
               <h2 className="text-3xl font-bold opacity-80">INVOICE</h2>
               <div className="mt-2 text-sm font-medium opacity-60">{invoice.invoiceNumber}</div>
            </div>
            <div className="text-right text-sm opacity-80">
               <div><strong>Freelance OS</strong></div>
               <div>123 Creator Lane</div>
               <div>San Francisco, CA 94107</div>
            </div>
         </div>

         <div className="flex justify-between items-start border-t border-black/10 pt-8">
            <div className="text-sm opacity-80">
               <div className="font-bold opacity-60 mb-2 uppercase text-xs">Billed To</div>
               {client ? (
                  <>
                     <div className="font-bold text-base">{client.name}</div>
                     {client.company && <div>{client.company}</div>}
                     {client.email && <div>{client.email}</div>}
                  </>
               ) : (
                  <div className="italic">Unknown Client</div>
               )}
            </div>
            <div className="text-right text-sm opacity-80 space-y-1">
               <div className="flex justify-end gap-8">
                  <span className="font-bold opacity-60 text-xs uppercase">Date</span>
                  <span>{format(new Date(invoice.createdAt), "MMMM d, yyyy")}</span>
               </div>
               <div className="flex justify-end gap-8">
                  <span className="font-bold opacity-60 text-xs uppercase">Due Date</span>
                  <span>{format(new Date(invoice.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000, "MMMM d, yyyy")}</span>
               </div>
            </div>
         </div>

         <table className="w-full text-sm text-left">
            <thead className="border-b-2 border-black/20 text-xs uppercase opacity-60 font-bold">
               <tr>
                  <th className="py-3">Description</th>
                  <th className="py-3 text-center">Amount</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
               <tr>
                  <td className="py-4">Professional Services Rendered</td>
                  <td className="py-4 text-center font-medium">{formatCurrency(invoice.total)}</td>
               </tr>
            </tbody>
         </table>

         <div className="flex justify-end pt-4 border-t-2 border-black/20">
            <div className="w-64 space-y-3">
               <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
               </div>
            </div>
         </div>

         <div className="pt-12 text-sm opacity-60">
            <strong>Payment Terms:</strong> Net 14. Please remit payment via bank transfer or credit card.
         </div>
      </Card>
    </div>
  );
}
