import db from "@/app/lib/db";
import { oauthAccountTable, userTable } from "@/app/lib/db/schema";
import { google } from "@/lib/oauth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { lucia } from "@/lib/auth";

interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  picture: string;
  locale: string;
}

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const codeVerifier = cookies().get("codeVerifier")?.value;
    const savedState = cookies().get("state")?.value;

    if (!codeVerifier || !savedState) {
      return Response.json({ error: "Invalid request 2" }, { status: 400 });
    }

    if (savedState !== state) {
      return Response.json({ error: "Invalid request 3" }, { status: 400 });
    }

    const authResp = await google.validateAuthorizationCode(code, codeVerifier);
    const { accessToken, idToken, accessTokenExpiresAt, refreshToken } =
      authResp;

    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        method: "GET",
      }
    );

    const googleData = (await googleRes.json()) as GoogleUser;

    await db.transaction(async (trx) => {
      const user = await trx.query.userTable.findFirst({
        where: eq(userTable.id, googleData.id),
      });

      let session = null;
      if (!user) {
        const createdUserRes = await trx
          .insert(userTable)
          .values({
            email: googleData.email,
            id: googleData.id,
            name: googleData.name,
            profilePictureUrl: googleData.picture,
          })
          .returning({ id: userTable.id });

        if (createdUserRes.length === 0) {
          trx.rollback();
          return Response.json({ error: "Invalid request 4" }, { status: 400 });
        }

        const createdOAuthAccountRes = await trx
          .insert(oauthAccountTable)
          .values({
            accessToken,
            expiresAt: accessTokenExpiresAt,
            id: googleData.id,
            provider: "google",
            providerUserId: googleData.id,
            userId: googleData.id,
            refreshToken,
          });

        if (createdOAuthAccountRes.rowCount === 0) {
          trx.rollback();
          return Response.json({ error: "Invalid request 5" }, { status: 400 });
        }
      } else {
        const createdOAuthAccountRes = await trx.update(oauthAccountTable).set({
          accessToken,
          expiresAt: accessTokenExpiresAt,
          refreshToken,
        });
      }
    });

    const session = await lucia.createSession(googleData.id, {
      expiresIn: 60 * 60 * 24 * 30,
    });
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    cookies().set("codeVerifier", "", { expires: new Date(0) });
    cookies().set("state", "", { expires: new Date(0) });
    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_BASE_URL),
      { status: 302 }
    );
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
