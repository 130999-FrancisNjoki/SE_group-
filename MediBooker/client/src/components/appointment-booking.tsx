import { useState } from "react";
import { useAuth } from "@/App";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import TimeSlotSelection from "./time-slot-selection";
import AppointmentModal from "./appointment-modal";
import { User } from "@shared/schema";

export default function AppointmentBooking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Mock doctors data - in a real app, this would come from the backend
  const doctors: User[] = [
    {
      id: "doctor-1",
      username: "dr.johnson",
      password: "",
      role: "doctor",
      fullName: "Dr. Sarah Johnson",
      email: "sarah.johnson@medschedule.com",
      phone: "+1-555-0101",
      specialization: "Cardiologist",
      createdAt: new Date(),
    },
    {
      id: "doctor-2", 
      username: "dr.smith",
      password: "",
      role: "doctor",
      fullName: "Dr. Michael Smith",
      email: "michael.smith@medschedule.com",
      phone: "+1-555-0102",
      specialization: "General Practice",
      createdAt: new Date(),
    },
    {
      id: "doctor-3",
      username: "dr.brown", 
      password: "",
      role: "doctor",
      fullName: "Dr. Emily Brown",
      email: "emily.brown@medschedule.com",
      phone: "+1-555-0103",
      specialization: "Dermatologist",
      createdAt: new Date(),
    },
  ];

  const createAppointmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/appointments", data),
    onSuccess: () => {
      toast({
        title: "Appointment booked successfully!",
        description: "Your appointment has been submitted for approval.",
      });
      setShowModal(false);
      setSelectedDoctor("");
      setAppointmentType("");
      setSelectedDate("");
      setSelectedTime("");
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/patient", user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleViewSlots = () => {
    if (!selectedDoctor || !selectedDate || !appointmentType) {
      toast({
        title: "Please fill all fields",
        description: "Select a doctor, appointment type, and date to view available slots.",
        variant: "destructive",
      });
      return;
    }
    // Time slots will be shown automatically via TimeSlotSelection component
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirmAppointment = () => {
    if (!selectedTime) {
      toast({
        title: "Please select a time slot",
        description: "Choose an available time slot to continue.",
        variant: "destructive",
      });
      return;
    }
    setShowModal(true);
  };

  const handleFinalConfirm = (notes: string) => {
    if (!user?.id || !selectedDoctor || !selectedDate || !selectedTime || !appointmentType) return;

    createAppointmentMutation.mutate({
      patientId: user.id,
      doctorId: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
      notes,
    });
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Book New Appointment</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Select Doctor
              </Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.fullName} - {doctor.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Appointment Type
              </Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Preferred Date
              </Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
              />
            </div>
            
            <Button 
              onClick={handleViewSlots}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              View Available Slots
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedDoctor && selectedDate && appointmentType && (
        <TimeSlotSelection
          doctorId={selectedDoctor}
          date={selectedDate}
          selectedTime={selectedTime}
          onTimeSelect={handleTimeSelect}
          onConfirm={handleConfirmAppointment}
        />
      )}

      <AppointmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        appointment={{
          doctor: doctors.find(d => d.id === selectedDoctor)?.fullName || "",
          date: selectedDate,
          time: selectedTime,
          type: appointmentType,
        }}
        onConfirm={handleFinalConfirm}
        isLoading={createAppointmentMutation.isPending}
      />
    </>
  );
}
