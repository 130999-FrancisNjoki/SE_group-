import { useAuth } from "@/App";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, DollarSign, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Appointment, User as UserType } from "@shared/schema";

interface AppointmentWithPatient extends Appointment {
  patient: UserType;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats } = useQuery<{
    todayAppointments: number;
    totalPatients: number;
    monthlyEarnings: number;
  }>({
    queryKey: ["/api/stats/doctor", user?.id],
    enabled: !!user?.id,
  });

  const { data: appointments = [] } = useQuery<AppointmentWithPatient[]>({
    queryKey: ["/api/appointments/doctor", user?.id],
    enabled: !!user?.id,
  });



  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/appointments/${id}/status`, { status }),
    onSuccess: () => {
      toast({
        title: "Appointment updated",
        description: "Appointment status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/doctor", user?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      });
    },
  });



  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === today && apt.status !== "cancelled");
  const pendingAppointments = appointments.filter(apt => apt.status === "pending");

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-8">
      {/* Doctor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats?.todayAppointments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Patients</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats?.totalPatients || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Monthly Earnings</p>
                <p className="text-2xl font-bold text-slate-800">
                  ${stats?.monthlyEarnings?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Average Rating</p>
                <p className="text-2xl font-bold text-slate-800">4.8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Today's Schedule</h2>
              <div className="text-sm text-slate-500">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            </div>
            
            <div className="space-y-3">
              {todayAppointments.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No appointments today</p>
              ) : (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        appointment.status === 'confirmed' ? 'bg-blue-600' :
                        appointment.status === 'pending' ? 'bg-yellow-500' : 'bg-green-600'
                      }`}></div>
                      <div>
                        <p className="font-medium text-slate-800">{appointment.patient?.fullName}</p>
                        <p className="text-sm text-slate-600 capitalize">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-800">{formatTime(appointment.time)}</p>
                      <p className="text-xs text-slate-500">30 min</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Overview */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Schedule Overview</h2>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Current Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Appointments:</span>
                  <span className="font-medium">{appointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pending Requests:</span>
                  <span className="font-medium">{pendingAppointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Today's Schedule:</span>
                  <span className="font-medium">{todayAppointments.length} appointments</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Monthly Total:</span>
                  <span className="font-bold text-blue-600">
                    ${stats?.monthlyEarnings?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Requests */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Appointment Requests</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-blue-600">
                Pending ({pendingAppointments.length})
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {pendingAppointments.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No pending requests</p>
            ) : (
              pendingAppointments.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {request.patient?.fullName?.split(' ').map(n => n[0]).join('') || 'P'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{request.patient?.fullName}</p>
                      <p className="text-sm text-slate-600 capitalize">{request.type} Request</p>
                      <p className="text-sm text-slate-500">
                        {new Date(request.date).toLocaleDateString()} at {formatTime(request.time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => updateAppointmentMutation.mutate({ id: request.id, status: "confirmed" })}
                      disabled={updateAppointmentMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAppointmentMutation.mutate({ id: request.id, status: "cancelled" })}
                      disabled={updateAppointmentMutation.isPending}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
