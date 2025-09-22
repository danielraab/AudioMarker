import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import path from "path";

export const audioRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(z.object({
      name: z.string(),
      fileBase64: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { name, fileBase64, fileName } = input;
      const id = uuidv4();
      const token = uuidv4();
      const fileExt = path.extname(fileName) || ".mp3";
      const outFileName = `${id}${fileExt}`;
      const filePath = path.join(process.cwd(), "public", "uploads", outFileName);
      // Decode base64 string to buffer
      const base64Data = fileBase64.replace(/^data:audio\/mp3;base64,/, "");
      await writeFile(filePath, Buffer.from(base64Data, "base64"));
      const audio = await ctx.db.audio.create({
        data: {
          id,
          name,
          filePath: `/uploads/${outFileName}`,
          token,
          createdById: ctx.session.user.id,
        },
      });
      return { token, id: audio.id };
    }),
});
