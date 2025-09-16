"use client";

import { useSession, signOut } from "next-auth/react";
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
import {
  Calendar,
  Clock,
  CheckCircle,
  LogOut,
  CalendarDays,
  BookOpen,
  TrendingUp,
  Users,
  Plus,
  Eye,
  RefreshCw,
} from "lucide-react";
import AppointmentDetailsModal from "@/components/AppointmentDetailsModal";
import { CalendarAppointment } from "@/lib/googleCalendar";


export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });

  const fetchAppointments = async () => {
    try {
      // Calculate start and end of today
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      startOfToday.setHours(0, 0, 0, 0);
      
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      endOfToday.setHours(23, 59, 59, 999);

      // Build query parameters for today only
      const params = new URLSearchParams({
        startTime: startOfToday.toISOString(),
        endTime: endOfToday.toISOString()
      });

      const response = await fetch(`/api/appointments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
        
        // Calculate stats - for dashboard stats, we might want to fetch all appointments separately
        // For now, we'll just show today's stats
        const now = new Date();
        const upcoming = data.appointments.filter((apt: CalendarAppointment) => 
          new Date(apt.startTime) > now && apt.status !== 'cancelled'
        ).length;
        const completed = data.appointments.filter((apt: CalendarAppointment) => 
          new Date(apt.endTime) < now && apt.status === 'confirmed'
        ).length;
        
        setStats({
          totalAppointments: data.appointments.length,
          upcomingAppointments: upcoming,
          completedAppointments: completed,
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      // Check if there's a stored role from sign-in
      const storedRole = localStorage.getItem("selectedRole");
      if (storedRole && (storedRole === "Buyer" || storedRole === "Seller")) {
        // Update the user's role if it doesn't match
        if ((session.user as any)?.role !== storedRole) {
          updateUserRole(storedRole as "Buyer" | "Seller");
        }
        // Clear the stored role
        localStorage.removeItem("selectedRole");
      }
      fetchAppointments();
    }
  }, [session]);

  const updateUserRole = async (role: "Buyer" | "Seller") => {
    try {
      const response = await fetch("/api/user/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });
      
      if (response.ok) {
        // Refresh the session to get updated role
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.startTime) > now && apt.status !== 'cancelled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3);
  };

  useEffect(() => {
    if (session) {
      console.log({session});
    }
  },[session]); 

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments?id=${appointmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId
              ? { ...apt, status: 'cancelled' as const }
              : apt
          )
        );
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-cyan-700 to-lime-700 bg-clip-text text-transparent leading-tight">
              Welcome back, {session?.user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {(session?.user as any)?.role === "Seller"
                ? "Manage your availability and track your bookings"
                : "Book appointments and manage your calendar"}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Today's Total
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{stats.totalAppointments}</div>
                <p className="text-xs text-blue-600 mt-1">appointments today</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">
                  Today's Upcoming
                </CardTitle>
                <Clock className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">{stats.upcomingAppointments}</div>
                <p className="text-xs text-emerald-600 mt-1">remaining today</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Today's Completed
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{stats.completedAppointments}</div>
                <p className="text-xs text-purple-600 mt-1">finished today</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {(session?.user as any)?.role === "Buyer" && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
                    onClick={() => router.push('/user/book-appointment')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Book Appointment</CardTitle>
                      <CardDescription>Schedule a meeting with a seller</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}


            {(session?.user as any)?.role === "Seller" && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
                    onClick={() => router.push('/user/calendar')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Manage Calendar</CardTitle>
                      <CardDescription>Set your availability and view bookings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* Upcoming Appointments */}
          {getUpcomingAppointments().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Today's Upcoming Appointments</span>
                </CardTitle>
                <CardDescription>Your remaining meetings for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUpcomingAppointments().map((appointment) => {
                    const userRole = (session?.user as any)?.role;
                    const userEmail = session?.user?.email;
                    
                    // Determine the other party
                    let otherPartyName = 'Unknown';
                    if (userRole === 'Seller') {
                      // If user is seller, find buyer from attendees
                      const buyer = appointment.attendees.find(attendee => attendee.email !== userEmail);
                      otherPartyName = buyer?.email || 'Unknown Buyer';
                    } else {
                      // If user is buyer, seller is the organizer
                      otherPartyName = appointment.organizer.email || 'Unknown Seller';
                    }

                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{appointment.title}</h4>
                          <p className="text-sm text-gray-600">
                            with {otherPartyName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(appointment.startTime)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                          {appointment.meetingLink && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(appointment.meetingLink, '_blank');
                              }}
                            >
                              Join
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(appointment);
                              setIsModalOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

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
          fetchAppointments();
        }}
        userRole={(session?.user as any)?.role}
        currentUserEmail={session?.user?.email}
      />
    </div>
  );
}
