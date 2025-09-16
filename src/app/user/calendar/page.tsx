"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CalendarAppointment } from "@/lib/googleCalendar";
import CalendarComponent from "@/components/CalendarComponent";
import AppointmentDetailsModal from "@/components/AppointmentDetailsModal";

interface UserSession {
  role: string;
  email: string;
}

export default function CalendarContainer() {
  const { data: session } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = 
    useState<CalendarAppointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      endOfMonth.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        startTime: startOfMonth.toISOString(),
        endTime: endOfMonth.toISOString(),
      });

      const response = await fetch(`/api/appointments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    const user = session?.user as UserSession | undefined;
    
    if (session && user?.role !== "Seller") {
      router.push("/user/dashboard");
      return;
    }
    
    if (user?.email) {
      fetchAppointments();
    }
  }, [session, router, currentDate, fetchAppointments]); // Added currentDate dependency

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments?id=${appointmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, status: "cancelled" as const }
              : apt
          )
        );
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw error;
    }
  };

  const user = session?.user as UserSession | undefined;

  return (
    <>
      <CalendarComponent
        appointments={appointments}
        loading={loading}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        selectedAppointment={selectedAppointment}
        setSelectedAppointment={setSelectedAppointment}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        cancelAppointment={cancelAppointment}
        session={session}
      />

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        onCancel={cancelAppointment}
        onUpdate={fetchAppointments}
        userRole={user?.role === "Seller" || user?.role === "Buyer" ? user.role : undefined}
        currentUserEmail={user?.email}
      />
    </>
  );
}
