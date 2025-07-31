import { useAuth } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";
import AppointmentBooking from "./appointment-booking";
import { Appointment, User as UserType } from "@shared/schema";

interface AppointmentWithDoctor extends Appointment {
  doctor: UserType;
}

export default function PatientDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery<{
    upcomingAppointments: number;
    totalAppointments: number;
  }>({
    queryKey: ["/api/stats/patient", user?.id],
    enabled: !!user?.id,
  });

  const { data: appointments = [] } = useQuery<AppointmentWithDoctor[]>({
    queryKey: ["/api/appointments/patient", user?.id],
    enabled: !!user?.id,
  });

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const now = new Date();
    return aptDate >= now && apt.status !== "cancelled";
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats?.upcomingAppointments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Appointments</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats?.totalAppointments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-slate-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Preferred Doctor</p>
                <p className="text-lg font-semibold text-slate-800">
                  {upcomingAppointments[0]?.doctor?.fullName?.split(' ')[1] || 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AppointmentBooking />
        
        {/* Upcoming Appointments */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Your Upcoming Appointments</h2>
            </div>
            
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No upcoming appointments</p>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{appointment.doctor?.fullName}</p>
                        <p className="text-sm text-slate-600 capitalize">{appointment.type} appointment</p>
                        <p className="text-sm text-slate-500">
                          {formatDate(appointment.date)} at {formatTime(appointment.time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
