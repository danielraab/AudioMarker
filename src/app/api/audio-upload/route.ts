import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  // TODO: Replace with actual user id from session
  const createdById = "demo-user-id";

  if (!file || !name) {
    return NextResponse.json({ error: "Missing file or name." }, { status: 400 });
  }

  const id = uuidv4();
  const token = uuidv4();
  const fileExt = path.extname(file.name) || ".mp3";
  const fileName = `${id}${fileExt}`;
  const filePath = path.join(process.cwd(), "public", "uploads", fileName);

  // Ensure uploads directory exists
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  // Save metadata to DB
  const audio = await prisma.audio.create({
    data: {
      id,
      name,
      filePath: `/uploads/${fileName}`,
      token,
      createdById,
    },
  });

  return NextResponse.json({ token, id: audio.id });
}
