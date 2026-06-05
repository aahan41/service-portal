import { useState } from "react";
import { Wallet as WalletIcon, Plus, Clock, CheckCircle, XCircle, IndianRupee } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetWalletBalance, useListWalletRequests, useCreateWalletRequest, getGetWalletBalanceQueryKey, getListWalletRequestsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const statusConfig = {
  pending: { label: "Pending", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: Clock },
  approved: { label: "Approved", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  rejected: { label: "Rejected", class: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle },
};

export default function Wallet() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: walletData, isLoading: walletLoading } = useGetWalletBalance();
  const { data: requests, isLoading: reqLoading } = useListWalletRequests();
  const createRequest = useCreateWalletRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 10) {
      toast({ variant: "destructive", title: "Minimum top-up amount is ₹10" });
      return;
    }

    createRequest.mutate({ data: { amount: amt } }, {
      onSuccess: () => {
        toast({ title: "Request submitted", description: "Your wallet top-up request has been submitted for approval." });
        queryClient.invalidateQueries({ queryKey: getListWalletRequestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWalletBalanceQueryKey() });
        setAmount("");
        setShowForm(false);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Failed to submit request" });
      }
    });
  };

  const presetAmounts = [100, 250, 500, 1000];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your service portal balance</p>
        </div>

        {/* Balance card */}
        <div className="bg-card border border-primary/30 rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <WalletIcon className="w-4 h-4" /> Current Balance
              </p>
              {walletLoading ? (
                <Skeleton className="h-10 w-32 mt-2" />
              ) : (
                <p className="text-4xl font-bold text-foreground mt-1" data-testid="text-wallet-balance">
                  ₹{walletData?.balance?.toFixed(2) ?? "0.00"}
                </p>
              )}
            </div>
            <Button onClick={() => setShowForm(!showForm)} data-testid="button-add-money">
              <Plus className="w-4 h-4 mr-2" /> Add Money
            </Button>
          </div>
        </div>

        {/* Add money form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Request Top-up</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Amount (₹)</label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {presetAmounts.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(String(amt))}
                      className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                        amount === String(amt) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="10"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="pl-9"
                    data-testid="input-amount"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Your request will be reviewed by an admin and approved manually.</p>
              <div className="flex gap-3">
                <Button type="submit" disabled={createRequest.isPending} data-testid="button-submit-request">
                  {createRequest.isPending ? "Submitting..." : "Submit Request"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Request history */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Top-up Requests</h2>
          </div>
          {reqLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !requests || requests.length === 0 ? (
            <div className="p-8 text-center">
              <WalletIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No top-up requests yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {requests.map(req => {
                const cfg = statusConfig[req.status as keyof typeof statusConfig] ?? statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <div key={req.id} className="flex items-center gap-4 px-4 py-3" data-testid={`row-wallet-request-${req.id}`}>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">₹{req.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    {req.adminNote && <p className="text-xs text-muted-foreground flex-1 hidden sm:block">{req.adminNote}</p>}
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${cfg.class}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
