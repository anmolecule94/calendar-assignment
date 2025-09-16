import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/route';
import { GoogleCalendarService } from '@/lib/googleCalendar';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startTime, endTime } = await request.json();
    
    if (!startTime || !endTime) {
      return NextResponse.json({ 
        error: 'Start time and end time are required' 
      }, { status: 400 });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (startDate >= endDate) {
      return NextResponse.json({ 
        error: 'End time must be after start time' 
      }, { status: 400 });
    }

    const result = await GoogleCalendarService.updateAppointmentTime(
      params.id,
      session.user.email,
      startDate,
      endDate
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Appointment time updated successfully',
      appointment: result
    });
  } catch (error) {
    console.error('Error updating appointment time:', error);
    return NextResponse.json({ 
      error: 'Failed to update appointment time' 
    }, { status: 500 });
  }
}
