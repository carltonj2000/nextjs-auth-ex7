import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignInForm from "./sign-in-form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  );
}
