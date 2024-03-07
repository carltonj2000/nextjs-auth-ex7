import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignUpForm from "./sign-up-form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create A Free Account</CardTitle>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
