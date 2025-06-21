// src/app/api/menu/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem, { IMenuItem } from '@/models/MenuItem';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Note: No validation logic here at the top level anymore.

// GET /api/menu - Fetches all menu items
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const menuItems = await MenuItem.find({}).sort({ createdAt: -1 });
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

    // --- START: Environment Variable Validation (Moved Inside 'try' block) ---
    const s3BucketName = process.env.AWS_S3_BUCKET;
    const s3Region = process.env.AWS_REGION;
    const s3AccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const s3SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!s3BucketName || !s3Region || !s3AccessKeyId || !s3SecretAccessKey) {
      // This will now be caught by the catch block below and returned as JSON
      throw new Error("Server configuration error: Missing AWS S3 environment variables.");
    }
    // --- END: Environment Variable Validation ---

    const formData = await request.formData();
    const file = formData.get("imageFile") as File | null;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;

    if (!file || !name || !description || !price) {
      return NextResponse.json({ success: false, error: 'Missing required fields or image file.' }, { status: 400 });
    }

    // Configure the S3 client inside the function to use the validated variables
    const s3Client = new S3Client({
      region: s3Region,
      credentials: {
        accessKeyId: s3AccessKeyId,
        secretAccessKey: s3SecretAccessKey,
      },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // --- START: S3 Upload Logic ---
    const key = `${Date.now()}-${file.name}`;
    const params = {
      Bucket: s3BucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const imageUrl = `https://${s3BucketName}.s3.${s3Region}.amazonaws.com/${key}`;
    // --- END: S3 Upload Logic ---

    const newMenuItemData: Partial<IMenuItem> = {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
    };

    const menuItem = await MenuItem.create(newMenuItemData);
    return NextResponse.json({ success: true, data: menuItem }, { status: 201 });

  } catch (error: any) {
    console.error("Error adding menu item:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err:any) => err.message);
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // This now correctly handles our custom validation error as well
    return NextResponse.json({ success: false, error: 'Server Error: ' + errorMessage }, { status: 500 });
  }
}