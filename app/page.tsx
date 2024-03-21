import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "./actions";
import ClientUser from "./clientUser";

export default async function Home() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/sign-in");
  }
  return (
    <main>
      <h1 className="text-xl font-semibold">Main Page</h1>
      <p>Should put something more exciting on this page.</p>
      <code>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </code>

      <form action={signOut}>
        <Button type="submit">Sign Out</Button>
      </form>

      <ClientUser />
    </main>
  );
}
