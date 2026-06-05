import { Link } from "wouter";
import { FileText, Wallet, Clock, CheckCircle, XCircle, Loader, ArrowRight, Bell } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useListApplications, useGetWalletBalance, useListNotifications } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: Loader },
  success: { label: "Completed", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle },
};

export default function UserDashboard() {
  const { user } = useAuth();
  const { data: walletData, isLoading: walletLoading } = useGetWalletBalance();
  const { data: appsData, isLoading: appsLoading } = useListApplications({ limit: 5 });
  const { data: notifications } = useListNotifications();

  const unread = notifications?.filter(n => !n.isRead).length ?? 0;
  const apps = appsData?.applications ?? [];

  const stats = [
    { label: "Total", value: appsData?.total ?? 0, icon: FileText, color: "text-primary" },
    { label: "Pending", value: appsData?.applications?.filter(a => a.status === "pending").length ?? 0, icon: Clock, color: "text-yellow-400" },
    { label: "Processing", value: appsData?.applications?.filter(a => a.status === "processing").length ?? 0, icon: Loader, color: "text-blue-400" },
    { label: "Completed", value: appsData?.applications?.filter(a => a.status === "success").length ?? 0, icon: CheckCircle, color: "text-emerald-400" },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your service applications</p>
          </div>
          <Link href="/services">
            <Button size="sm" data-testid="button-browse-services">
              Browse Services <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Top cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Wallet */}
          <div className="bg-card border border-border rounded-lg p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Wallet Balance</span>
            </div>
            {walletLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold text-foreground" data-testid="text-wallet-balance">
                ₹{walletData?.balance?.toFixed(2) ?? "0.00"}
              </p>
            )}
            <Link href="/wallet">
              <p className="text-xs text-primary mt-2 hover:underline cursor-pointer">Add money →</p>
            </Link>
          </div>

          {/* Application stats */}
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              {appsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Notification banner */}
        {unread > 0 && (
          <Link href="/notifications">
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/25 rounded-lg p-3 cursor-pointer hover:bg-primary/15 transition-colors">
              <Bell className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm text-primary flex-1">You have {unread} unread notification{unread > 1 ? "s" : ""}</p>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </Link>
        )}

        {/* Recent applications */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Applications</h2>
            <Link href="/applications">
              <span className="text-xs text-primary hover:underline cursor-pointer">View all</span>
            </Link>
          </div>
          {appsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : apps.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No applications yet</p>
              <Link href="/services">
                <Button size="sm" variant="outline" className="mt-3">Browse Services</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {apps.map(app => {
                const status = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.pending;
                const Icon = status.icon;
                return (
                  <Link key={app.id} href={`/applications/${app.id}`}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer" data-testid={`row-application-${app.id}`}>
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{app.serviceName ?? "Service"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
