"use client";

import { useAuth } from "@/components/auth-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { getUserInvoices, updateInvoiceStatus } from "@/lib/db/finances";
import { Invoice } from "@/lib/types/schema";
import { cn } from "@/lib/utils";
import { ArrowLeft, CreditCard, Download, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FinancesPage() {
    const { user, loading: authLoading } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInvoices() {
            if (user) {
                try {
                    const data = await getUserInvoices(user.uid);
                    setInvoices(data);
                } catch (error) {
                    console.error("Failed to fetch invoices:", error);
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading) {
                setLoading(false);
            }
        }

        fetchInvoices();
    }, [user, authLoading]);

    const handlePay = async (invoiceId: string) => {
        // Mock payment flow
        if (confirm("Simulate successful payment?")) {
            await updateInvoiceStatus(invoiceId, 'PAID');
            setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv));
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black font-[family-name:var(--font-outfit)] p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Financials</h1>
                        <p className="text-muted-foreground">Manage your invoices and payments</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="p-6">
                        <p className="text-sm text-muted-foreground">Total Due</p>
                        <p className="text-3xl font-bold text-white mt-2">
                            ${invoices.filter(i => i.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </p>
                    </GlassCard>
                    <GlassCard className="p-6">
                        <p className="text-sm text-muted-foreground">Paid (Last 30 Days)</p>
                        <p className="text-3xl font-bold text-green-400 mt-2">
                            ${invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </p>
                    </GlassCard>
                    <GlassCard className="p-6">
                        <p className="text-sm text-muted-foreground">Next Due Date</p>
                        <p className="text-3xl font-bold text-blue-400 mt-2">
                            {invoices.find(i => i.status === 'PENDING')
                                ? new Date(invoices.find(i => i.status === 'PENDING')!.dueDate).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </GlassCard>
                </div>

                {/* Invoices List */}
                <GlassCard className="overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Recent Invoices
                        </h2>
                    </div>

                    {invoices.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No invoices found.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border",
                                            invoice.status === 'PAID' ? "bg-green-500/10 border-green-500/30 text-green-500" :
                                                invoice.status === 'PENDING' ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" :
                                                    "bg-red-500/10 border-red-500/30 text-red-500"
                                        )}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{invoice.number}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Due {new Date(invoice.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-white font-bold">${invoice.amount.toLocaleString()}</p>
                                            <span className={cn(
                                                "text-xs font-medium px-2 py-0.5 rounded-full",
                                                invoice.status === 'PAID' ? "bg-green-500/20 text-green-400" :
                                                    invoice.status === 'PENDING' ? "bg-yellow-500/20 text-yellow-400" :
                                                        "bg-red-500/20 text-red-400"
                                            )}>
                                                {invoice.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors" title="Download PDF">
                                                <Download className="w-5 h-5" />
                                            </button>
                                            {invoice.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handlePay(invoice.id)}
                                                    className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                                >
                                                    <CreditCard className="w-4 h-4" /> Pay Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
