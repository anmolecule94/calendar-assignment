import { google } from "googleapis";
import UserModel from "./models/User";

export interface CalendarAppointment {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    email: string;
    responseStatus: string;
  }>;
  organizer: {
    email: string;
  };
  meetingLink?: string;
  status: string;
  created: string;
}

export class GoogleCalendarService {
  private oauth2Client: any;

  constructor(refreshToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + "/api/auth/callback/google"
    );

    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
  }

  async getCalendarEvents(timeMin: string, timeMax: string): Promise<any[]> {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items ?? [];
  }

  async createCalendarEvent(eventData: {
    summary: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: Array<{ email: string; displayName?: string }>;
  }): Promise<CalendarAppointment> {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const eventPayload = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: eventData.endTime.toISOString(),
        timeZone: "UTC",
      },
      attendees: eventData.attendees,
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: eventPayload,
      conferenceDataVersion: 1,
    });

    const event = response.data;

    return {
      id: event.id ?? "",
      title: event.summary ?? "Untitled",
      description: event.description ?? undefined,
      startTime: event.start?.dateTime ?? "",
      endTime: event.end?.dateTime ?? "",
      attendees:
        event.attendees?.map((a) => ({
          email: a.email ?? "",
          responseStatus: a.responseStatus ?? "",
        })) ?? [],
      organizer: {
        email: event.organizer?.email ?? "",
      },
      meetingLink:
        event.hangoutLink ??
        event.conferenceData?.entryPoints?.[0]?.uri ??
        undefined,
      status: event.status ?? "confirmed",
      created: event.created ?? "",
    };
  }

  async deleteCalendarEvent(eventId: string): Promise<boolean> {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });

    return true;
  }

  async getAppointments(
    userEmail: string,
    userRole: "Buyer" | "Seller",
    timeMin?: Date,
    timeMax?: Date
  ): Promise<CalendarAppointment[]> {
    // Set default time range if not provided
    const defaultTimeMin =
      timeMin ||
      (() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
      })();

    const defaultTimeMax =
      timeMax ||
      (() => {
        const date = new Date();
        date.setDate(date.getDate() + 90);
        return date;
      })();

    const events = await this.getCalendarEvents(
      defaultTimeMin.toISOString(),
      defaultTimeMax.toISOString()
    );

    console.log("Fetched events:", events);

    return events
      .filter(
        (event) =>
          event.status !== "cancelled"
      )
      .map((event) => ({
        id: event.id ?? "",
        title: event.summary ?? "Untitled",
        description: event.description ?? undefined,
        startTime: event.start?.dateTime ?? "",
        endTime: event.end?.dateTime ?? "",
        attendees:
          event.attendees?.map(
            (a: {
              email?: string | null;
              responseStatus?: string | null;
            }) => ({
              email: a.email ?? "",
              responseStatus: a.responseStatus ?? "",
            })
          ) ?? [],
        organizer: {
          email: event.organizer?.email ?? "",
        },
        meetingLink:
          event.hangoutLink ??
          event.conferenceData?.entryPoints?.[0]?.uri ??
          undefined,
        status: event.status ?? "confirmed",
        created: event.created ?? "",
      }))
      .filter((appointment) => {
        if (userRole === "Seller") {
          // Sellers should see all appointments they're involved in (as organizer OR attendee)
          return (
            appointment.organizer.email === userEmail ||
            appointment.attendees.some(
              (att: { email: string; responseStatus: string }) => att.email === userEmail
            )
          );
        } else {
          // Buyers see appointments where they are attendees but not the organizer
          return (
            appointment.attendees.some(
              (att: { email: string; responseStatus: string }) => att.email === userEmail
            ) && appointment.organizer.email !== userEmail
          );
        }
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  }

  static async getUserAppointments(
    userEmail: string,
    userRole: "Buyer" | "Seller"
  ): Promise<CalendarAppointment[]> {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user?.refreshToken) throw new Error("User refresh token not found");

    const calendarService = new GoogleCalendarService(user.refreshToken);
    return calendarService.getAppointments(userEmail, userRole);
  }

  static async getUserAppointmentsWithTimeRange(
    userEmail: string,
    userRole: "Buyer" | "Seller",
    timeMin: Date,
    timeMax: Date
  ): Promise<CalendarAppointment[]> {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user?.refreshToken) throw new Error("User refresh token not found");

    const calendarService = new GoogleCalendarService(user.refreshToken);
    return calendarService.getAppointments(
      userEmail,
      userRole,
      timeMin,
      timeMax
    );
  }

  static async cancelAppointment(
    userEmail: string,
    eventId: string
  ): Promise<boolean> {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user?.refreshToken) throw new Error("User refresh token not found");

    const calendarService = new GoogleCalendarService(user.refreshToken);
    return calendarService.deleteCalendarEvent(eventId);
  }

  static async getAvailableSlots(
    sellerEmail: string,
    startDate: Date,
    endDate: Date,
    slotDuration: number = 60
  ) {
    const seller = await UserModel.findOne({ email: sellerEmail });
    if (!seller?.refreshToken)
      throw new Error("Seller refresh token not found");

    const calendarService = new GoogleCalendarService(seller.refreshToken);

    const events = await calendarService.getCalendarEvents(
      startDate.toISOString(),
      endDate.toISOString()
    );

    const availableSlots = [];
    const current = new Date(startDate);

    while (current < endDate) {
      if (current.getDay() === 0 || current.getDay() === 6) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      for (let hour = 9; hour < 17; hour++) {
        const slotStart = new Date(current);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        const hasConflict = events.some((event) => {
          if (!event.start?.dateTime || !event.end?.dateTime) return false;

          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);

          return slotStart < eventEnd && slotEnd > eventStart;
        });

        if (!hasConflict) {
          availableSlots.push({
            start: slotStart,
            end: slotEnd,
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return availableSlots;
  }

  static async createEventForBothParties(
    sellerEmail: string,
    buyerEmail: string,
    eventData: {
      title: string;
      description?: string;
      startTime: Date;
      endTime: Date;
      sellerName: string;
      buyerName: string;
    }
  ): Promise<{
    sellerEventId: string;
    buyerEventId: string;
    meetingLink?: string;
  }> {
    // Get both users' refresh tokens
    const seller = await UserModel.findOne({ email: sellerEmail });
    const buyer = await UserModel.findOne({ email: buyerEmail });

    if (!seller?.refreshToken)
      throw new Error("Seller refresh token not found");
    if (!buyer?.refreshToken) throw new Error("Buyer refresh token not found");

    // Create calendar service for seller (who will be the organizer)
    const sellerCalendarService = new GoogleCalendarService(
      seller.refreshToken
    );

    // Create the event with both attendees
    const calendarEvent = await sellerCalendarService.createCalendarEvent({
      summary: eventData.title,
      description: eventData.description,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      attendees: [
        { email: sellerEmail, displayName: eventData.sellerName },
        { email: buyerEmail, displayName: eventData.buyerName },
      ],
    });

    return {
      sellerEventId: calendarEvent.id,
      buyerEventId: calendarEvent.id, // Same event for both parties
      meetingLink: calendarEvent.meetingLink,
    };
  }

  async updateEventResponseStatus(
    eventId: string,
    userEmail: string,
    responseStatus: string
  ): Promise<CalendarAppointment> {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    // First get the current event
    const eventResponse = await calendar.events.get({
      calendarId: "primary",
      eventId,
    });

    const event = eventResponse.data;
    
    // Update the attendee's response status
    if (event.attendees) {
      const attendeeIndex = event.attendees.findIndex(
        (attendee) => attendee.email === userEmail
      );
      
      if (attendeeIndex !== -1) {
        event.attendees[attendeeIndex].responseStatus = responseStatus;
      }
    }

    // Update the event
    const updateResponse = await calendar.events.update({
      calendarId: "primary",
      eventId,
      requestBody: event,
    });

    const updatedEvent = updateResponse.data;

    return {
      id: updatedEvent.id ?? "",
      title: updatedEvent.summary ?? "Untitled",
      description: updatedEvent.description ?? undefined,
      startTime: updatedEvent.start?.dateTime ?? "",
      endTime: updatedEvent.end?.dateTime ?? "",
      attendees:
        updatedEvent.attendees?.map((a) => ({
          email: a.email ?? "",
          responseStatus: a.responseStatus ?? "",
        })) ?? [],
      organizer: {
        email: updatedEvent.organizer?.email ?? "",
      },
      meetingLink:
        updatedEvent.hangoutLink ??
        updatedEvent.conferenceData?.entryPoints?.[0]?.uri ??
        undefined,
      status: updatedEvent.status ?? "confirmed",
      created: updatedEvent.created ?? "",
    };
  }

  async updateEventTime(
    eventId: string,
    startTime: Date,
    endTime: Date
  ): Promise<CalendarAppointment> {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    // First get the current event
    const eventResponse = await calendar.events.get({
      calendarId: "primary",
      eventId,
    });

    const event = eventResponse.data;
    
    // Update the event times
    event.start = {
      dateTime: startTime.toISOString(),
      timeZone: "UTC",
    };
    event.end = {
      dateTime: endTime.toISOString(),
      timeZone: "UTC",
    };

    // Update the event
    const updateResponse = await calendar.events.update({
      calendarId: "primary",
      eventId,
      requestBody: event,
    });

    const updatedEvent = updateResponse.data;

    return {
      id: updatedEvent.id ?? "",
      title: updatedEvent.summary ?? "Untitled",
      description: updatedEvent.description ?? undefined,
      startTime: updatedEvent.start?.dateTime ?? "",
      endTime: updatedEvent.end?.dateTime ?? "",
      attendees:
        updatedEvent.attendees?.map((a) => ({
          email: a.email ?? "",
          responseStatus: a.responseStatus ?? "",
        })) ?? [],
      organizer: {
        email: updatedEvent.organizer?.email ?? "",
      },
      meetingLink:
        updatedEvent.hangoutLink ??
        updatedEvent.conferenceData?.entryPoints?.[0]?.uri ??
        undefined,
      status: updatedEvent.status ?? "confirmed",
      created: updatedEvent.created ?? "",
    };
  }

  static async updateAppointmentResponseStatus(
    eventId: string,
    userEmail: string,
    responseStatus: string,
    accessToken: string
  ): Promise<CalendarAppointment> {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user?.refreshToken) throw new Error("User refresh token not found");

    const calendarService = new GoogleCalendarService(user.refreshToken);
    return calendarService.updateEventResponseStatus(eventId, userEmail, responseStatus);
  }

  static async updateAppointmentTime(
    eventId: string,
    organizerEmail: string,
    startTime: Date,
    endTime: Date
  ): Promise<CalendarAppointment> {
    const user = await UserModel.findOne({ email: organizerEmail });
    if (!user?.refreshToken) throw new Error("User refresh token not found");

    const calendarService = new GoogleCalendarService(user.refreshToken);
    return calendarService.updateEventTime(eventId, startTime, endTime);
  }
}
