"use server";
import { z } from "zod";
import { SignUpFormSchema } from "@/app/types";
import { Argon2id } from "oslo/password";
import { generateId } from "lucia";
import db from "@/app/lib/db";
import { emailVerificationTable, userTable } from "@/app/lib/db/schema";
// import { lucia } from "@/lib/auth";
// import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { SendEmail } from "@/lib/email";

export const signUp = async (values: z.infer<typeof SignUpFormSchema>) => {
  const result = SignUpFormSchema.safeParse(values);
  if (!result.success) {
    return { error: "Invalid form data!" };
  }

  const hashedPassword = await new Argon2id().hash(result.data.password);
  const userId = generateId(15);

  try {
    await db
      .insert(userTable)
      .values({
        id: userId,
        email: result.data.email,
        hashedPassword,
      })
      .returning({
        id: userTable.id,
        email: userTable.email,
      });

    // const session = await lucia.createSession(userId, {
    //   expiresIn: 60 * 60 * 24 * 30,
    // });

    // const sessionCookie = lucia.createSessionCookie(session.id);
    // cookies().set(
    //   sessionCookie.name,
    //   sessionCookie.value,
    //   sessionCookie.attributes
    // );

    const code = Math.random().toString(36).substring(2, 8);
    await db.insert(emailVerificationTable).values({
      id: generateId(15),
      userId: userId,
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
    console.log({ url });
    return { success: true, data: { userId, url } };
  } catch (error: any) {
    return { error: error?.message };
  }
  console.log({ values, result });
};
