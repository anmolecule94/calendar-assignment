import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { GoogleCalendarService } from '@/lib/googleCalendar';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const sellerEmail = searchParams.get('sellerEmail');

    // Set default time range if not provided
    let timeMin: Date;
    let timeMax: Date;

    if (startTime) {
      timeMin = new Date(startTime);
      if (isNaN(timeMin.getTime())) {
        return NextResponse.json(
          { error: 'Invalid startTime format. Use ISO 8601 format (e.g., 2023-12-01T00:00:00Z)' },
          { status: 400 }
        );
      }
    } else {
      timeMin = new Date();
      timeMin.setDate(timeMin.getDate() - 30); // Default: 30 days ago
    }

    if (endTime) {
      timeMax = new Date(endTime);
      if (isNaN(timeMax.getTime())) {
        return NextResponse.json(
          { error: 'Invalid endTime format. Use ISO 8601 format (e.g., 2023-12-31T23:59:59Z)' },
          { status: 400 }
        );
      }
    } else {
      timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 90); // Default: 90 days from now
    }

    if (timeMin >= timeMax) {
      return NextResponse.json(
        { error: 'startTime must be before endTime' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get current user
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let appointments;

    if (sellerEmail) {
      // Buyer is requesting seller's appointments for booking purposes
      if (user.role !== 'Buyer') {
        return NextResponse.json({ error: 'Only buyers can view seller appointments' }, { status: 403 });
      }

      // Verify seller exists
      const seller = await UserModel.findOne({ email: sellerEmail, role: 'Seller' });
      if (!seller) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
      }

      if (!seller.refreshToken) {
        return NextResponse.json(
          { error: 'Seller has not connected their Google Calendar' },
          { status: 400 }
        );
      }

      // Get seller's appointments for availability checking
      appointments = await GoogleCalendarService.getUserAppointmentsWithTimeRange(
        sellerEmail,
        'Seller',
        timeMin,
        timeMax
      );
    } else {
      // Get current user's own appointments
      appointments = await GoogleCalendarService.getUserAppointmentsWithTimeRange(
        session.user.email,
        user.role,
        timeMin,
        timeMax
      );
    }

    console.log('Fetched appointments:', JSON.stringify(appointments, null, 2));

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startTime, endTime, sellerEmail } = body;

    if (!title || !startTime || !endTime || !sellerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startTime, endTime, sellerEmail' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get buyer (current user)
    const buyer = await UserModel.findOne({ email: session.user.email });
    if (!buyer || buyer.role !== 'Buyer') {
      return NextResponse.json({ error: 'Only buyers can create appointments' }, { status: 403 });
    }

    // Get seller
    const seller = await UserModel.findOne({ email: sellerEmail, role: 'Seller' });
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    if (!seller.refreshToken || !buyer.refreshToken) {
      return NextResponse.json(
        { error: 'Both parties must have Google Calendar connected' },
        { status: 400 }
      );
    }

    // Validate time slot
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (startDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'Appointment time must be in the future' },
        { status: 400 }
      );
    }

    if (startDateTime >= endDateTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Create Google Calendar events for both parties
    const calendarEvents = await GoogleCalendarService.createEventForBothParties(
      sellerEmail,
      session.user.email,
      {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
        sellerName: seller.name,
        buyerName: buyer.name,
      }
    );

    return NextResponse.json({
      eventId: calendarEvents.sellerEventId,
      meetingLink: calendarEvents.meetingLink,
      message: 'Appointment created successfully',
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing event ID' },
        { status: 400 }
      );
    }

    // Cancel appointment from Google Calendar
    await GoogleCalendarService.cancelAppointment(session.user.email, eventId);

    return NextResponse.json({
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
