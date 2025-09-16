import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/route';
import { GoogleCalendarService } from '@/lib/googleCalendar';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { responseStatus, userEmail } = body;
    
    // More specific validation
    if (typeof responseStatus !== 'string' || typeof userEmail !== 'string') {
      return NextResponse.json({ 
        error: 'Response status and user email must be strings' 
      }, { status: 400 });
    }

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

    const validStatuses = ['accepted', 'declined', 'tentative'] as const;
    if (!validStatuses.includes(responseStatus as typeof validStatuses[number])) {
      return NextResponse.json({ 
        error: `Invalid response status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }

    // Wait for the params to resolve
    const { id } = await context.params;

    const result = await GoogleCalendarService.updateAppointmentResponseStatus(
      id,
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
    console.error('Error in appointment response update:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error processing response' 
    }, { status: 500 });
  }
}
