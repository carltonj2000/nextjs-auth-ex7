import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignInForm from "./sign-in-form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SignInPage() {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SignIn To An Account</CardTitle>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
      <CardFooter>
        <Link className="w-full" href="/sign-up">
          <Button variant="link" className="w-full">
            No Account?
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
