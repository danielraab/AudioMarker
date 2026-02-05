import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const file = formData.get('file') as File;

    if (!name || !file) {
      return NextResponse.json({ error: 'Name and file are required' }, { status: 400 });
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    // Validate file extension
    const fileExtension = path.extname(file.name).toLowerCase();
    if (fileExtension !== '.mp3') {
      return NextResponse.json({ error: 'Only .mp3 files are allowed' }, { status: 400 });
    }

    // Generate unique ID and file path
    const id = uuidv4();
    const outFileName = `${id}${fileExtension}`;
    const filePath = path.join(process.cwd(), 'data', 'uploads', outFileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create database record (store only filename)
    const audio = await db.audio.create({
      data: {
        id,
        name,
        description: description || undefined,
        originalFileName: file.name,
        filePath: outFileName,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ 
      success: true,
      id: audio.id 
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
