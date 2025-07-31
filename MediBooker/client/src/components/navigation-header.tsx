import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Bell, Stethoscope } from "lucide-react";

export default function NavigationHeader() {
  const { user, setUser } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setUser(null);
    setLocation("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-slate-800">MedSchedule</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#dashboard" className="text-blue-600 font-medium px-3 py-2 rounded-md text-sm">
                Dashboard
              </a>
              <a href="#appointments" className="text-slate-600 hover:text-slate-800 px-3 py-2 rounded-md text-sm">
                Appointments
              </a>
              <a href="#profile" className="text-slate-600 hover:text-slate-800 px-3 py-2 rounded-md text-sm">
                Profile
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5 text-slate-600" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium hidden sm:block">{user?.fullName}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
