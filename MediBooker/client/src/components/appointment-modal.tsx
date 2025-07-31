import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    doctor: string;
    date: string;
    time: string;
    type: string;
  };
  onConfirm: (notes: string) => void;
  isLoading: boolean;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  onConfirm,
  isLoading,
}: AppointmentModalProps) {
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Doctor:</span>
                <span className="font-medium">{appointment.doctor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Date:</span>
                <span className="font-medium">{formatDate(appointment.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Time:</span>
                <span className="font-medium">{formatTime(appointment.time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Type:</span>
                <span className="font-medium capitalize">{appointment.type}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Additional Notes (Optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific symptoms or concerns..."
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Confirming..." : "Confirm Appointment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
