/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getMenuDbConnection } from '@/lib/mongodb';
import { getMenuItemModel } from '@/models/MenuItem';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function GET() {
  try {
    const menuConnection = await getMenuDbConnection();
    const MenuItem = getMenuItemModel(menuConnection);

    const menuItems = await MenuItem.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: menuItems }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: 'Server Error: ' + errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const menuConnection = await getMenuDbConnection();
    const MenuItem = getMenuItemModel(menuConnection);

    const s3BucketName = process.env.AWS_S3_BUCKET;
    const s3Region = process.env.AWS_REGION;
    const s3AccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const s3SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!s3BucketName || !s3Region || !s3AccessKeyId || !s3SecretAccessKey) {
      throw new Error("Server configuration error: Missing AWS S3 environment variables.");
    }

    const formData = await request.formData();
    const file = formData.get("imageFile") as File | null;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;

    if (!file || !name || !description || !price) {
      return NextResponse.json({ success: false, error: 'Missing required fields or image file.' }, { status: 400 });
    }

    const s3Client = new S3Client({
      region: s3Region,
      credentials: {
        accessKeyId: s3AccessKeyId,
        secretAccessKey: s3SecretAccessKey,
      },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    
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

    const newMenuItemData = { name, description, price: parseFloat(price), imageUrl };

    const menuItem = await MenuItem.create(newMenuItemData);
    return NextResponse.json({ success: true, data: menuItem }, { status: 201 });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err:any) => err.message);
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: 'Server Error: ' + errorMessage }, { status: 500 });
  }
}