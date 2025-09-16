import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!UserModel) {
      throw new Error('Database connection failed');
    }

    // Get all sellers with lean() for better performance
    const sellers = await UserModel.find(
      { role: 'Seller' },
      { 
        name: 1, 
        email: 1, 
        createdAt: 1,
        _id: 1 
      }
    )
    .lean()
    .sort({ createdAt: -1 });

    if (!sellers?.length) {
      return NextResponse.json({ 
        success: false,
        error: 'No sellers found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      sellers,
      count: sellers.length 
    });

  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sellers'
    }, { status: 500 });
  }
}
