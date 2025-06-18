import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem, { IMenuItem } from '@/models/MenuItem';

// GET /api/menu - Fetches all menu items
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const menuItems = await MenuItem.find({}).sort({ createdAt: -1 }); // Sort by newest first
    return NextResponse.json({ success: true, data: menuItems }, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: 'Server Error: ' + errorMessage }, { status: 500 });
  }
}

// POST /api/menu - Adds a new menu item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { name, description, price, imageUrl } = body;

    // Basic validation
    if (!name || !description || price === undefined || price === null) {
      return NextResponse.json({ success: false, error: 'Missing required fields: name, description, and price are required.' }, { status: 400 });
    }
    if (typeof price !== 'number' || price < 0) {
        return NextResponse.json({ success: false, error: 'Price must be a non-negative number.' }, { status: 400 });
    }

    const newMenuItemData: Partial<IMenuItem> = {
        name,
        description,
        price,
        ...(imageUrl && { imageUrl }), // Only add imageUrl if provided
    };

    const menuItem = await MenuItem.create(newMenuItemData);
    return NextResponse.json({ success: true, data: menuItem }, { status: 201 });
  } catch (error: any) {
    console.error("Error adding menu item:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: 'Server Error: ' + errorMessage }, { status: 500 });
  }
}
