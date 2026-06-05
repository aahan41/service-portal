import { Users, FileText, CheckCircle, XCircle, Clock, TrendingUp, IndianRupee, Loader } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetAdminStats, useListApplications } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const statusConfig = {
  pending: { label: "Pending", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  processing: { label: "Processing", class: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  success: { label: "Completed", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  rejected: { label: "Rejected", class: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: recentData, isLoading: appsLoading } = useListApplications({ limit: 8 });

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Applications", value: stats.totalApplications, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Pending", value: stats.pendingApplications, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Completed", value: stats.successApplications, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Rejected", value: stats.rejectedApplications, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Total Revenue", value: `₹${Number(stats.totalRevenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`, icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ] : [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Overview of portal activity</p>
          </div>
          <Link href="/admin/applications">
            <Button size="sm" data-testid="button-view-applications">View Applications</Button>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsLoading
            ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
            : statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-card border border-border rounded-lg p-4">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))
          }
        </div>

        {/* Recent Applications */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Applications</h2>
            <Link href="/admin/applications">
              <span className="text-xs text-primary hover:underline cursor-pointer">View all</span>
            </Link>
          </div>
          {appsLoading ? (
            <div className="p-4 space-y-3">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !recentData?.applications?.length ? (
            <div className="p-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No applications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">ID</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Service</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">User</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Date</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentData.applications.map(app => {
                    const cfg = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.pending;
                    return (
                      <tr key={app.id} className="hover:bg-accent/40 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground">#{app.id}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{app.serviceName}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{app.userName ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cfg.class}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/applications?id=${app.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2" data-testid={`button-review-${app.id}`}>Review</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/applications", label: "Manage Applications", icon: FileText },
            { href: "/admin/users", label: "Manage Users", icon: Users },
            { href: "/admin/wallet", label: "Wallet Requests", icon: IndianRupee },
            { href: "/admin/services", label: "Services", icon: TrendingUp },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:border-primary/40 transition-colors cursor-pointer" data-testid={`link-${label.toLowerCase().replace(/\s+/g, "-")}`}>
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
