"use server";
import { z } from "zod";
import { SignInFormSchema } from "@/app/types";
import { Argon2id } from "oslo/password";
import db from "@/app/lib/db";
import { userTable } from "@/app/lib/db/schema";
import { lucia, validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

export const signOut = async () => {
  try {
    const { session } = await validateRequest();
    if (!session) {
      return {
        error: "Session not found!",
      };
    } else {
      await lucia.invalidateSession(session.id);
      const sessionCookie = lucia.createBlankSessionCookie();

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch (error: any) {
    return { error: error?.message };
  }
};
