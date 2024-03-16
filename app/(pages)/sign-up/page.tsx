import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignUpForm from "./sign-up-form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SignUpPage() {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SignUp For A Free Account</CardTitle>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
      <CardFooter>
        <Link className="w-full" href="/sign-in">
          <Button variant="link" className="w-full">
            Already Sign Up?
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
