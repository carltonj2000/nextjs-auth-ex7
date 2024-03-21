"use server";
import { z } from "zod";
import { SignInFormSchema } from "@/app/types";
import { Argon2id } from "oslo/password";
import db from "@/app/lib/db";
import { emailVerificationTable, userTable } from "@/app/lib/db/schema";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import jwt from "jsonwebtoken";
import { CounterStartDefault } from "./vars";
import { SendEmail } from "@/lib/email";
import { generateCodeVerifier, generateState } from "arctic";
import { google } from "@/lib/oauth";

export const signIn = async (values: z.infer<typeof SignInFormSchema>) => {
  const result = SignInFormSchema.safeParse(values);
  if (!result.success) {
    return { error: "Invalid form data!" };
  }

  try {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, result.data.email));

    if (!user || user.length === 0 || !user[0].hashedPassword) {
      return { error: "Invalid user credentials!" };
    }

    const pwOk = await new Argon2id().verify(
      user[0].hashedPassword,
      result.data.password
    );

    if (!pwOk) {
      return { error: "Invalid user credentials!" };
    }

    if (user[0].isEmailVerified) {
      const session = await lucia.createSession(user[0].id, {
        expiresIn: 60 * 60 * 24 * 30,
      });

      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      return { success: true };
    }

    const email_verification = await db
      .select()
      .from(emailVerificationTable)
      .where(eq(emailVerificationTable.userId, user[0].id));
    if (!email_verification || email_verification.length === 0) {
      const code = Math.random().toString(36).substring(2, 8);
      await db.insert(emailVerificationTable).values({
        id: generateId(15),
        userId: user[0].id,
        code,
        sentAt: new Date(),
      });
      if (!process.env.JWT_SECRET) {
        console.error("JWT Secrete Not Set In Env.");
        return { success: false };
      }
      const token = jwt.sign(
        { email: result.data.email, code },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
      );

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${token}`;
      await SendEmail({
        to: "carlton.joseph@gmail.com",
        subject: "Activate Account",
        html: `<a href="${url}">Active Account</a>`,
      });
      return { success: true, data: { user: user[0].id, url } };
    } else {
      const sentAt = new Date(email_verification[0].sentAt);
      const msPassed = new Date().getTime() - sentAt.getTime();
      const isOneMinPassed = msPassed > CounterStartDefault * 1000;
      if (isOneMinPassed) {
        return { error: "Email not verified!", key: "email_not_verified" };
      }
      return {
        error: "Request verification code too soon!",
        timeLeft: Math.round(CounterStartDefault - msPassed / 1000),
      };
    }
  } catch (error: any) {
    return { error: error?.message };
  }
};

export const sendVerificationLink = async (email: string, password: string) => {
  try {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (!user || user.length === 0) {
      return { error: "Invalid user!" };
    }
    const pwOk = await new Argon2id().verify(user[0].hashedPassword!, password);

    if (!pwOk) {
      return { error: "Invalid user credentials!" };
    }
    if (user[0].isEmailVerified) {
      return { error: "Email already verified!" };
    }

    const oldVerification = await db.query.emailVerificationTable.findFirst({
      where: eq(emailVerificationTable.userId, user[0].id),
    });

    if (!oldVerification) {
      return { error: "Email verification not found!" };
    }

    const sentAt = new Date(oldVerification.sentAt);
    const msPassed = new Date().getTime() - sentAt.getTime();
    const isOneMinPassed = msPassed > CounterStartDefault * 1000;
    if (!isOneMinPassed) {
      return {
        error: "Request verification code too soon!",
        timeLeft: Math.round(CounterStartDefault - msPassed / 1000),
      };
    }

    const code = Math.random().toString(36).substring(2, 8);
    await db
      .update(emailVerificationTable)
      .set({ code, sentAt: new Date() })
      .where(eq(emailVerificationTable.userId, user[0].id));

    if (!process.env.JWT_SECRET) {
      console.error("JWT Secrete Not Set In Env.");
      return { success: false };
    }
    const token = jwt.sign({ email: email, code }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${token}`;
    await SendEmail({
      to: "carlton.joseph@gmail.com",
      subject: "Activate Account",
      html: `<a href="${url}">Active Account</a>`,
    });
    return { success: "Email sent!", url };
  } catch (error: any) {
    return { error: error?.message };
  }
};

export const createGoogleAuthorizationURL = async () => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    cookies().set("codeVerifier", codeVerifier, { httpOnly: true });

    cookies().set("state", state, { httpOnly: true });

    const authorizationURL = await google.createAuthorizationURL(
      state,
      codeVerifier,
      {
        scopes: ["profile", "email"],
      }
    );
    // const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    return {
      success: true,
      data: authorizationURL.toString(),
    };
  } catch (e: any) {
    return { success: false, message: e?.message };
  }
};
