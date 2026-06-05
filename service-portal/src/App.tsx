import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

import Login from "@/pages/login";
import Signup from "@/pages/signup";

// User Pages
import UserDashboard from "@/pages/user/dashboard";
import Services from "@/pages/user/services";
import ServiceDetail from "@/pages/user/service-detail";
import Applications from "@/pages/user/applications";
import ApplicationDetail from "@/pages/user/application-detail";
import Wallet from "@/pages/user/wallet";
import Notifications from "@/pages/user/notifications";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminServices from "@/pages/admin/services";
import AdminCategories from "@/pages/admin/categories";
import AdminApplications from "@/pages/admin/applications";
import AdminUsers from "@/pages/admin/users";
import AdminWallet from "@/pages/admin/wallet";
import AdminAccount from "@/pages/admin/account";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, roleRequired, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  if (roleRequired && user.role !== roleRequired) {
    return <Redirect to={user.role === "admin" ? "/admin" : "/dashboard"} />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/signup" component={Signup} />
      
      {/* User Routes */}
      <Route path="/dashboard"><ProtectedRoute component={UserDashboard} roleRequired="user" /></Route>
      <Route path="/services"><ProtectedRoute component={Services} roleRequired="user" /></Route>
      <Route path="/services/:id"><ProtectedRoute component={ServiceDetail} roleRequired="user" /></Route>
      <Route path="/applications"><ProtectedRoute component={Applications} roleRequired="user" /></Route>
      <Route path="/applications/:id"><ProtectedRoute component={ApplicationDetail} roleRequired="user" /></Route>
      <Route path="/wallet"><ProtectedRoute component={Wallet} roleRequired="user" /></Route>
      <Route path="/notifications"><ProtectedRoute component={Notifications} roleRequired="user" /></Route>

      {/* Admin Routes */}
      <Route path="/admin"><ProtectedRoute component={AdminDashboard} roleRequired="admin" /></Route>
      <Route path="/admin/services"><ProtectedRoute component={AdminServices} roleRequired="admin" /></Route>
      <Route path="/admin/categories"><ProtectedRoute component={AdminCategories} roleRequired="admin" /></Route>
      <Route path="/admin/applications"><ProtectedRoute component={AdminApplications} roleRequired="admin" /></Route>
      <Route path="/admin/users"><ProtectedRoute component={AdminUsers} roleRequired="admin" /></Route>
      <Route path="/admin/wallet"><ProtectedRoute component={AdminWallet} roleRequired="admin" /></Route>
      <Route path="/admin/account"><ProtectedRoute component={AdminAccount} roleRequired="admin" /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
