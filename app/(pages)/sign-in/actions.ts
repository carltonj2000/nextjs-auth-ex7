"use server";
import { z } from "zod";
import { SignInFormSchema } from "@/app/types";
import { Argon2id } from "oslo/password";
import db from "@/app/lib/db";
import { userTable } from "@/app/lib/db/schema";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

export const signIn = async (values: z.infer<typeof SignInFormSchema>) => {
  const result = SignInFormSchema.safeParse(values);
  if (!result.success) {
    return { error: "Invalid form data!" };
  }

  try {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, result.data.username));

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
  console.log({ values, result });
};
