import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, Plus, Trash2, Power, PowerOff, KeyRound, Mail, UserCog } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function authFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

function useAdmins() {
  return useQuery<AdminUser[]>({
    queryKey: ["admins"],
    queryFn: async () => {
      const r = await authFetch("/api/account/admins");
      if (!r.ok) throw new Error("Failed to load admins");
      return r.json();
    },
  });
}

function useChangePassword() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const r = await authFetch("/api/account/password", { method: "PATCH", body: JSON.stringify(data) });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => toast({ title: "Password updated successfully" }),
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

function useChangeEmail() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; currentPassword: string }) => {
      const r = await authFetch("/api/account/email", { method: "PATCH", body: JSON.stringify(data) });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Email updated — please log in again" });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

function useCreateAdmin() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const r = await authFetch("/api/account/admins", { method: "POST", body: JSON.stringify(data) });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Admin account created" });
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

function useToggleAdmin() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const r = await authFetch(`/api/account/admins/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }) });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: (_, vars) => {
      toast({ title: vars.isActive ? "Account enabled" : "Account disabled" });
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

function useDeleteAdmin() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await authFetch(`/api/account/admins/${id}`, { method: "DELETE" });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Admin account deleted" });
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ChangePasswordCard() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const mut = useChangePassword();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) return;
    mut.mutate({ currentPassword: cur, newPassword: next }, {
      onSuccess: () => { setCur(""); setNext(""); setConfirm(""); },
    });
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" /> Change Password
        </CardTitle>
        <CardDescription>Update your login password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Current Password</Label>
            <Input type="password" value={cur} onChange={e => setCur(e.target.value)} required placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input type="password" value={next} onChange={e => setNext(e.target.value)} required placeholder="Min. 6 characters" minLength={6} />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm New Password</Label>
            <Input
              type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              className={confirm && next !== confirm ? "border-destructive" : ""}
              placeholder="Repeat new password"
            />
            {confirm && next !== confirm && <p className="text-xs text-destructive">Passwords do not match</p>}
          </div>
          <Button type="submit" disabled={mut.isPending || (!!confirm && next !== confirm)} className="w-full">
            {mut.isPending ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangeEmailCard() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const mut = useChangeEmail();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    mut.mutate({ email, currentPassword: pwd }, {
      onSuccess: () => { setEmail(""); setPwd(""); },
    });
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" /> Change Email
        </CardTitle>
        <CardDescription>Current: <span className="text-foreground font-medium">{user?.email}</span></CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>New Email Address</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="new@email.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Current Password (to confirm)</Label>
            <Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={mut.isPending} className="w-full">
            {mut.isPending ? "Updating…" : "Update Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CreateAdminDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mut = useCreateAdmin();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    mut.mutate({ name, email, password }, {
      onSuccess: () => { setOpen(false); setName(""); setEmail(""); setPassword(""); },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-3.5 h-3.5" /> New Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create Admin Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Full name" minLength={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters" minLength={6} />
          </div>
          <Button type="submit" disabled={mut.isPending} className="w-full">
            {mut.isPending ? "Creating…" : "Create Admin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminRow({ admin, currentUserId }: { admin: AdminUser; currentUserId: number }) {
  const toggle = useToggleAdmin();
  const del = useDeleteAdmin();
  const isSelf = admin.id === currentUserId;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-primary">{admin.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{admin.name}</p>
          {isSelf && <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 shrink-0">You</Badge>}
        </div>
        <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant={admin.isActive ? "default" : "secondary"}
          className={`text-xs px-2 py-0 h-5 ${admin.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-muted text-muted-foreground"}`}
        >
          {admin.isActive ? "Active" : "Disabled"}
        </Badge>
        {!isSelf && (
          <>
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              disabled={toggle.isPending}
              onClick={() => toggle.mutate({ id: admin.id, isActive: !admin.isActive })}
              title={admin.isActive ? "Disable account" : "Enable account"}
            >
              {admin.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5 text-green-400" />}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Admin Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <strong>{admin.email}</strong>. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => del.mutate(admin.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AdminAccount() {
  const { user } = useAuth();
  const { data: admins, isLoading } = useAdmins();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <UserCog className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Admin Management</h1>
            <p className="text-sm text-muted-foreground">Manage admin accounts and your credentials</p>
          </div>
        </div>

        {/* My Account */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> My Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChangePasswordCard />
            <ChangeEmailCard />
          </div>
        </div>

        {/* Admin Accounts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Admin Accounts
            </h2>
            <CreateAdminDialog />
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-2">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !admins?.length ? (
                <p className="text-sm text-muted-foreground text-center py-6">No admin accounts found</p>
              ) : (
                admins.map(admin => (
                  <AdminRow key={admin.id} admin={admin} currentUserId={user?.id ?? 0} />
                ))
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground mt-2">
            Demo accounts (admin@portal.com, user@portal.com) are disabled and shown here if they exist.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
