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
    const sellerEmail = searchParams.get('sellerEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!sellerEmail || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: sellerEmail, startDate, endDate' },
        { status: 400 }
      );
    }

    await connectToDatabase();

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

    // Get available slots
    const availableSlots = await GoogleCalendarService.getAvailableSlots(
      sellerEmail,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
