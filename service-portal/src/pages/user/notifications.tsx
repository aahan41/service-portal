import { Bell, CheckCheck, Info, Wallet, FileText } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const typeIcons = {
  application: FileText,
  status_update: FileText,
  wallet: Wallet,
  info: Info,
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: notifications, isLoading } = useListNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();

  const handleMarkAll = () => {
    markAll.mutate(undefined as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        toast({ title: "All notifications marked as read" });
      }
    });
  };

  const handleMarkOne = (id: number) => {
    markOne.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    });
  };

  const unread = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up"}
            </p>
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={markAll.isPending} data-testid="button-mark-all-read">
              <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
            </Button>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => {
              const Icon = typeIcons[n.type as keyof typeof typeIcons] ?? Info;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 transition-colors cursor-pointer ${!n.isRead ? "bg-primary/5" : "hover:bg-accent/40"}`}
                  onClick={() => !n.isRead && handleMarkOne(n.id)}
                  data-testid={`row-notification-${n.id}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? "bg-primary/15" : "bg-muted"}`}>
                    <Icon className={`w-4 h-4 ${!n.isRead ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? "text-foreground font-medium" : "text-muted-foreground"}`}>{n.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
