import { type NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { auth } from '~/server/auth';
import { db } from '~/server/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file || !name) {
      return NextResponse.json({ error: 'Missing file or name' }, { status: 400 });
    }

    // Validate file type - only MP3 files allowed
    if (!file.type.includes('audio/mpeg') && !file.type.includes('audio/mp3')) {
      return NextResponse.json({ error: 'Only MP3 files are allowed' }, { status: 400 });
    }

    // Additional validation: check file extension
    const fileExtension = path.extname(file.name).toLowerCase();
    if (fileExtension !== '.mp3') {
      return NextResponse.json({ error: 'Only .mp3 files are allowed' }, { status: 400 });
    }

    const id = uuidv4();
    const readonlyToken = uuidv4();
    const fileExt = path.extname(file.name) || '.mp3';
    const outFileName = `${id}${fileExt}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', outFileName);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Create database record
    const audio = await db.audio.create({
      data: {
        id,
        name,
        originalFileName: file.name,
        filePath: `/uploads/${outFileName}`,
        readonlyToken,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ readonlyToken, id: audio.id });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
