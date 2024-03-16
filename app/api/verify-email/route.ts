import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { emailVerificationTable, userTable } from "@/app/lib/db/schema";
import db from "@/app/lib/db";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return Response.json({ error: "Token not found!" }, { status: 400 });
  }
  if (!process.env.JWT_SECRET) {
    return Response.json({ error: "jwt secret env not set!" }, { status: 400 });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      email: string;
      code: string;
    };
    const user = await db.query.userTable.findFirst({
      where:
        eq(userTable.id, emailVerificationTable.userId) &&
        eq(userTable.email, decoded.email),
    });
    if (!user) {
      return Response.json({ error: "User is invalid!" }, { status: 400 });
    }

    const ev = await db.query.emailVerificationTable.findFirst({
      where:
        eq(emailVerificationTable.userId, user.id) &&
        eq(emailVerificationTable.code, decoded.code),
    });
    if (!ev) {
      return Response.json({ error: "Token is invalid!" }, { status: 400 });
    }

    await db
      .update(userTable)
      .set({ isEmailVerified: true })
      .where(eq(userTable.id, user.id));

    await db
      .delete(emailVerificationTable)
      .where(eq(emailVerificationTable.id, ev.id));

    const session = await lucia.createSession(decoded.email, {
      expiresIn: 60 * 60 * 24 * 30,
    });

    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return Response.json(
        { error: "Redirect URL is invalid!" },
        { status: 400 }
      );
    }
    return Response.redirect(new URL(process.env.NEXT_PUBLIC_BASE_URL), 302);
  } catch (error) {
    console.error({ error });
    return Response.json({ error }, { status: 400 });
  }
};
