import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get all sellers
    const sellers = await UserModel.find(
      { role: 'Seller' },
      { name: 1, email: 1, createdAt: 1 }
    ).sort({ createdAt: -1 });

    return NextResponse.json({ sellers });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}
