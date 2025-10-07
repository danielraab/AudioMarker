import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { requireAdmin } from "./utils";

export const systemSettingsRouter = createTRPCRouter({
  getRegistrationStatus: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    requireAdmin(ctx.session);

    return {
      registrationEnabled: env.MAIL_REGISTRATION_ENABLED,
    };
  }),
});