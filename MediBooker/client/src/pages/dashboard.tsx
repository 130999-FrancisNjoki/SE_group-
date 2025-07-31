import { useAuth } from "@/App";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import NavigationHeader from "@/components/navigation-header";
import PatientDashboard from "@/components/patient-dashboard";
import DoctorDashboard from "@/components/doctor-dashboard";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<"patient" | "doctor">("patient");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('Dashboard useEffect - user:', user);
    
    if (!user) {
      console.log('No user found, redirecting to login');
      setLocation("/login");
      return;
    }

    console.log('User found, setting active view to:', user.role);
    setActiveView(user.role as "patient" | "doctor");
    setIsChecking(false);
  }, [user, setLocation]);

  if (isChecking || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Toggle */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 inline-flex">
            <Button
              variant={activeView === "patient" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("patient")}
              className={activeView === "patient" ? "bg-blue-600 text-white" : "text-slate-600"}
            >
              Patient View
            </Button>
            <Button
              variant={activeView === "doctor" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("doctor")}
              className={activeView === "doctor" ? "bg-blue-600 text-white" : "text-slate-600"}
            >
              Doctor View
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeView === "patient" ? (
          <PatientDashboard />
        ) : (
          <DoctorDashboard />
        )}
      </div>
    </div>
  );
}
