import { NextRequest, NextResponse } from 'next/server';
import { getOrdersDbConnection } from '@/lib/mongodb';
import getOrderModel from '@/models/Order';
import { getUserModel } from '@/models/User';

export async function GET() {
  try {
    const ordersConnection = await getOrdersDbConnection();

    getUserModel(ordersConnection);

    const Order = getOrderModel(ordersConnection);

    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: 'Server Error: ' + errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    try {
        const ordersConnection = await getOrdersDbConnection();

        getUserModel(ordersConnection);

        const Order = getOrderModel(ordersConnection);
        const body = await request.json();

        if (!body.user || !body.items || !body.totalAmount || !body.deliveryAddress) {
            return NextResponse.json({ success: false, error: 'Missing required order fields.' }, { status: 400 });
        }

        const order = await Order.create(body);
        return NextResponse.json({ success: true, data: order }, { status: 201 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, error: 'Server Error: ' + errorMessage }, { status: 500 });
    }
}