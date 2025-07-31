import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotSelectionProps {
  doctorId: string;
  date: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  onConfirm: () => void;
}

export default function TimeSlotSelection({
  doctorId,
  date,
  selectedTime,
  onTimeSelect,
  onConfirm,
}: TimeSlotSelectionProps) {
  const { data: timeSlots = [], isLoading } = useQuery<TimeSlot[]>({
    queryKey: ["/api/appointments/slots", doctorId, date],
    enabled: !!doctorId && !!date,
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Loading available slots...</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Available Time Slots - {formatDate(date)}
        </h3>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {timeSlots.map((slot) => (
            <Button
              key={slot.time}
              variant="outline"
              disabled={!slot.available}
              onClick={() => slot.available && onTimeSelect(slot.time)}
              className={`p-3 h-auto flex flex-col ${
                slot.available
                  ? selectedTime === slot.time
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-green-600 bg-green-50 text-green-600 hover:bg-green-100"
                  : "border-yellow-400 bg-yellow-50 text-yellow-700 opacity-60 cursor-not-allowed"
              }`}
            >
              <span className="font-medium">{formatTime(slot.time)}</span>
              {!slot.available && <span className="text-xs">Booked</span>}
            </Button>
          ))}
        </div>
        
        <div className="pt-4 border-t border-slate-200">
          <Button 
            onClick={onConfirm}
            disabled={!selectedTime}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Confirm Appointment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
