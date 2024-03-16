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

    if (!user[0].isEmailVerified) {
      return { error: "Email not verified!", key: "email_not_verified" };
    }

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
    const isOneMinPassed = msPassed > 60000;
    if (!isOneMinPassed) {
      return {
        error: "Request verification code too soon!",
        timeLeft: msPassed / 1000,
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
    console.log({ url });
    return { success: "Email sent!", url };
  } catch (error: any) {
    return { error: error?.message };
  }
};
