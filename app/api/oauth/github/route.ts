import db from "@/app/lib/db";
import { oauthAccountTable, userTable } from "@/app/lib/db/schema";
import { github } from "@/lib/oauth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { lucia } from "@/lib/auth";

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const savedState = cookies().get("state")?.value;

    if (!savedState) {
      return Response.json({ error: "Invalid request 2" }, { status: 400 });
    }

    if (savedState !== state) {
      return Response.json({ error: "Invalid request 3" }, { status: 400 });
    }

    const authResp = await github.validateAuthorizationCode(code);
    const { accessToken } = authResp;

    const githubRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "GET",
    });

    const githubData = (await githubRes.json()) as any;

    console.log({ githubData });
    await db.transaction(async (trx) => {
      const user = await trx.query.userTable.findFirst({
        where: eq(userTable.id, githubData.id),
      });

      if (!user) {
        const createdUserRes = await trx
          .insert(userTable)
          .values({
            id: githubData.id,
            name: githubData.name,
            profilePictureUrl: githubData.avatar_url,
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
            id: githubData.id,
            provider: "github",
            providerUserId: githubData.id,
            userId: githubData.id,
          });

        if (createdOAuthAccountRes.rowCount === 0) {
          trx.rollback();
          return Response.json({ error: "Invalid request 5" }, { status: 400 });
        }
      } else {
        const createdOAuthAccountRes = await trx.update(oauthAccountTable).set({
          accessToken,
        });
      }
    });

    const session = await lucia.createSession(githubData.id, {
      expiresIn: 60 * 60 * 24 * 30,
    });
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    cookies().set("state", "", { expires: new Date(0) });
    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_BASE_URL),
      { status: 302 }
    );
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
