"use server";
import { z } from "zod";
import { SignUpFormSchema } from "@/app/types";
import { Argon2id } from "oslo/password";
import { generateId } from "lucia";
import db from "@/app/lib/db";
import { userTable } from "@/app/lib/db/schema";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

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
        username: result.data.username,
        hashedPassword,
      })
      .returning({
        id: userTable.id,
        username: userTable.username,
      });

    const session = await lucia.createSession(userId, {
      expiresIn: 60 * 60 * 24 * 30,
    });

    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true, data: { userId } };
  } catch (error: any) {
    return { error: error?.message };
  }
  console.log({ values, result });
};
