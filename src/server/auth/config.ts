import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import { env } from "~/env";
import Authentik from "next-auth/providers/authentik";
import Nodemailer from "next-auth/providers/nodemailer";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    isAdmin: boolean;
    // ...other properties
    // role: UserRole;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    isAdmin: boolean;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    ...(env.AUTH_AUTHENTIK_ID ? [
      Authentik({
        name: env.AUTH_AUTHENTIK_LABEL ?? "Authentik",
        clientId: env.AUTH_AUTHENTIK_ID,
        clientSecret: env.AUTH_AUTHENTIK_SECRET,
        issuer: env.AUTH_AUTHENTIK_ISSUER,
      }),
    ] : []),
    ...(env.EMAIL_SERVER_HOST ? [
      Nodemailer({
        server: {
          host: env.EMAIL_SERVER_HOST,
          port: parseInt(env.EMAIL_SERVER_PORT ?? "587"),
          auth: {
            user: env.EMAIL_SERVER_USER,
            pass: env.EMAIL_SERVER_PASSWORD,
          },
        },
        from: env.EMAIL_FROM,
      }),
    ] : []),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        isAdmin: user.isAdmin,
      },
    }),
  },
} satisfies NextAuthConfig;
