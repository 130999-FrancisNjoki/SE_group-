import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import { useState, createContext, useContext, useEffect } from "react";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  console.log('App component rendered, user:', user);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, setUser }}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
