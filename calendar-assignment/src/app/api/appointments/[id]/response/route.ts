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

    const { responseStatus, userEmail } = await request.json();
    
    if (!responseStatus || !userEmail) {
      return NextResponse.json({ 
        error: 'Response status and user email are required' 
      }, { status: 400 });
    }

    // Verify the user is trying to update their own response
    if (userEmail !== session.user.email) {
      return NextResponse.json({ 
        error: 'You can only update your own response status' 
      }, { status: 403 });
    }

    const validStatuses = ['accepted', 'declined', 'tentative'];
    if (!validStatuses.includes(responseStatus)) {
      return NextResponse.json({ 
        error: 'Invalid response status' 
      }, { status: 400 });
    }

    const result = await GoogleCalendarService.updateAppointmentResponseStatus(
      params.id,
      userEmail,
      responseStatus,
      ''
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Response status updated successfully',
      appointment: result
    });
  } catch (error) {
    console.error('Error updating response status:', error);
    return NextResponse.json({ 
      error: 'Failed to update response status' 
    }, { status: 500 });
  }
}
