"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Search,
  User,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import CalendarComponent from "@/components/CalendarComponent";
import AppointmentDetailsModal from "@/components/AppointmentDetailsModal";
import { CalendarAppointment } from "@/lib/googleCalendar";
import { useSession } from "next-auth/react";

interface Seller {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface TimeSlot {
  start: Date;
  end: Date;
}

export default function BookAppointment() {
  const router = useRouter();
  const { data: session } = useSession();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  
  // Calendar related states
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Appointment creation modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [appointmentDetails, setAppointmentDetails] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    if (selectedSeller) {
      fetchSellerAppointments(selectedSeller.email);
    }
  }, [selectedSeller]);

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/sellers');
      if (response.ok) {
        const data = await response.json();
        setSellers(data.sellers || []);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerAppointments = async (sellerEmail: string) => {
    setLoadingAppointments(true);
    try {
      const response = await fetch(`/api/appointments?sellerEmail=${sellerEmail}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching seller appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
  };

  const checkTimeConflict = (date: Date, start: string, end: string) => {
    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime).toDateString();
      return aptDate === date.toDateString() && apt.status !== 'cancelled';
    });

    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const proposedStart = new Date(date);
    proposedStart.setHours(startHour, startMinute, 0, 0);
    
    const proposedEnd = new Date(date);
    proposedEnd.setHours(endHour, endMinute, 0, 0);

    // Check if proposed time overlaps with any existing appointment
    return dayAppointments.some(apt => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      return proposedStart < aptEnd && proposedEnd > aptStart;
    });
  };

  const createAppointment = async () => {
    if (!selectedSeller || !selectedDate || !startTime || !endTime || !appointmentDetails.title) {
      return;
    }

    // Validate that end time is after start time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      alert('End time must be after start time');
      return;
    }

    // Check for conflicts
    if (checkTimeConflict(selectedDate, startTime, endTime)) {
      alert('This time slot conflicts with an existing appointment. Please choose a different time.');
      return;
    }
    
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    setBooking(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: appointmentDetails.title,
          description: appointmentDetails.description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          sellerEmail: selectedSeller.email,
        }),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setSelectedDate(null);
        setStartTime("09:00");
        setEndTime("10:00");
        setAppointmentDetails({ title: "", description: "" });
        fetchSellerAppointments(selectedSeller.email);
        alert('Appointment created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment');
    } finally {
      setBooking(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    // This is for the calendar component interface, can be implemented later
    console.log('Cancel appointment:', appointmentId);
  };

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    const grouped: { [key: string]: TimeSlot[] } = {};
    
    slots.forEach(slot => {
      const dateKey = slot.start.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        <p className="text-gray-600 mt-2">Choose a seller and schedule your meeting</p>
      </div>

      {!selectedSeller ? (
        // Step 1: Choose Seller
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Choose a Seller</span>
            </CardTitle>
            <CardDescription>Select who you'd like to meet with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSellers.map((seller) => (
                  <div
                    key={seller._id}
                    className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 hover:border-primary"
                    onClick={() => setSelectedSeller(seller)}
                  >
                    <h4 className="font-medium">{seller.name}</h4>
                    <p className="text-sm text-gray-600">{seller.email}</p>
                  </div>
                ))}
              </div>

              {filteredSellers.length === 0 && (
                <p className="text-center text-gray-500 py-8">No sellers found</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Step 2: Calendar View and Appointment Creation
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Schedule with {selectedSeller.name}
              </h2>
              <p className="text-gray-600">{selectedSeller.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSeller(null);
                setAppointments([]);
              }}
            >
              Change Seller
            </Button>
          </div>

          {/* Modified Calendar Component */}
          <CalendarComponent
            appointments={appointments}
            loading={loadingAppointments}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedAppointment={selectedAppointment}
            setSelectedAppointment={setSelectedAppointment}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            cancelAppointment={cancelAppointment}
            session={session}
            onDateClick={handleDateClick}
            hideAppointmentDetails={true}
            currentUserEmail={session?.user?.email || undefined}
          />

          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-4">
              Click on any date in the calendar to schedule a new appointment. 
              {session?.user?.email && " Blue appointments with 👥 are shared between you and the seller."}
            </p>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        onCancel={cancelAppointment}
        onUpdate={() => {
          if (selectedSeller) {
            fetchSellerAppointments(selectedSeller.email);
          }
        }}
        currentUserEmail={session?.user?.email || undefined}
      />

      {/* Appointment Creation Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Appointment</DialogTitle>
            <DialogDescription>
              {selectedDate && `Schedule an appointment for ${selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="modal-title">Event Title *</Label>
              <Input
                id="modal-title"
                placeholder="Enter appointment title"
                value={appointmentDetails.title}
                onChange={(e) => setAppointmentDetails(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
              />
            </div>

            <div>
              <Label htmlFor="modal-description">Description</Label>
              <Input
                id="modal-description"
                placeholder="Enter description (optional)"
                value={appointmentDetails.description}
                onChange={(e) => setAppointmentDetails(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time *</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            {selectedDate && checkTimeConflict(selectedDate, startTime, endTime) && (
              <p className="text-sm text-red-600">
                This time slot conflicts with an existing appointment. Please choose a different time.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setSelectedDate(null);
                setStartTime("09:00");
                setEndTime("10:00");
                setAppointmentDetails({ title: "", description: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={createAppointment}
              disabled={
                !appointmentDetails.title || 
                !startTime || 
                !endTime || 
                (selectedDate && checkTimeConflict(selectedDate, startTime, endTime)) ||
                booking
              }
            >
              {booking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
