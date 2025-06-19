import { NextRequest, NextResponse } from 'next/server';
import { getOrdersDbConnection } from '@/lib/mongodb'; // Import new connection function
import { OrderSchema, IOrder } from '@/models/Order'; // Import OrderSchema and IOrder interface
import { Model } from 'mongoose';

// GET /api/orders - Fetches all orders
export async function GET(request: NextRequest) {
  try {
    const ordersConnection = await getOrdersDbConnection();
    // Compile model on the specific connection
    const Order: Model<IOrder> = ordersConnection.models.Order || ordersConnection.model<IOrder>('Order', OrderSchema);

    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: 'Server Error: ' + errorMessage }, { status: 500 });
  }
}

// POST /api/orders - Adds a new order
export async function POST(request: NextRequest) {
  try {
    const ordersConnection = await getOrdersDbConnection();
    const body = await request.json();

    // Compile model on the specific connection
    const Order: Model<IOrder> = ordersConnection.models.Order || ordersConnection.model<IOrder>('Order', OrderSchema);

    // Add your validation for order data here
    // For example:
    if (!body.orderNumber || !body.customerEmail || !body.items || body.items.length === 0 || !body.totalAmount) {
      return NextResponse.json({ success: false, error: 'Missing required order fields.' }, { status: 400 });
    }

    const newOrderData: Partial<IOrder> = {
      orderNumber: body.orderNumber,
      customerEmail: body.customerEmail,
      items: body.items,
      totalAmount: body.totalAmount,
      status: body.status || 'pending',
    };

    const order = await Order.create(newOrderData);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    console.error("Error adding order:", error);
    // Add more specific error handling, e.g., for Mongoose ValidationErrors
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: 'Server Error: ' + errorMessage }, { status: 500 });
  }
}