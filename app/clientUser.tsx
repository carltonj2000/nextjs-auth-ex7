"use client";

import { lucia, validateRequest } from "@/lib/auth";
import { useEffect } from "react";
import { useSession } from "./session.provider";

export default function ClientUser() {
  const session = useSession();
  console.log({ session });
  return (
    <div>
      <h1>Client User</h1>
      {session && session.user && session.user.profilePictureUrl && (
        <img
          className="rounded-full w-20"
          src={session.user?.profilePictureUrl}
          alt="profile picture"
        />
      )}
    </div>
  );
}
