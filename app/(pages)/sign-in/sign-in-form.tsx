"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

import { SignInFormSchema } from "@/app/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";
import { useCountdown } from "usehooks-ts";

import {
  createGoogleAuthorizationURL,
  sendVerificationLink,
  signIn,
} from "./actions";
import { CounterStartDefault } from "./vars";

export default function SignInForm() {
  const [showVerificationLink, showVerificationLinkSet] = useState(false);
  const router = useRouter();
  const [countStart, countStartSet] = useState(CounterStartDefault);
  const [runCount, runCountSet] = useState(false);
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart,
      intervalMs: 1000,
    });

  useEffect(() => {
    if (runCount) {
      resetCountdown();
      startCountdown();
      showVerificationLinkSet(true);
      runCountSet(false);
    }
  }, [
    countStart,
    resetCountdown,
    startCountdown,
    showVerificationLink,
    runCount,
    runCountSet,
  ]);

  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "carlton.joseph@gmail.com",
      password: "password",
    },
  });

  async function onSubmit(values: z.infer<typeof SignInFormSchema>) {
    const result = await signIn(values);
    ({ from: "onSubmit", result });
    if (result.error) {
      toast({ variant: "destructive", description: result.error });
      if (result?.key === "email_not_verified") {
        showVerificationLinkSet(true);
        return;
      }
      if (result.timeLeft) {
        countStartSet(result.timeLeft);
        runCountSet(true);
        return;
      }
    } else {
      toast({
        variant: "default",
        description: "Signed In Successfully!",
      });
      router.push("/");
    }
  }

  async function onReqVerification() {
    startCountdown();
    const result = await sendVerificationLink(
      form.getValues("email"),
      form.getValues("password")
    );
    if (result.timeLeft) {
      countStartSet(result.timeLeft);
      runCountSet(true);
      return;
    }
    if (result.error) {
      toast({ variant: "destructive", description: result.error });
    } else {
      countStartSet(CounterStartDefault);
      runCountSet(true);
      toast({
        variant: "default",
        description: "New verification link sent!",
        action: (
          <ToastAction altText="Verify">
            <Link href={result?.url!}>Verify</Link>
          </ToastAction>
        ),
      });
    }
  }

  const onGoogleSignInClicked = async () => {
    const res = await createGoogleAuthorizationURL();
    if (!res.success) {
      toast({ variant: "destructive", description: res.message });
    } else {
      window.location.href = res.data?.toString()!;
    }
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <Button className="w-full" onClick={() => onGoogleSignInClicked()}>
          Sign in with Google
        </Button>
      </div>
      <div className="w-full flex justify-center py-2 border-t border-b border-gray-300 my-5">
        Or with your email and password
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="******" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
        {showVerificationLink && (
          <Button
            type="submit"
            className="w-full mt-1"
            onClick={onReqVerification}
            disabled={count > 0 && count <= CounterStartDefault}
          >
            Resend Verification Link {count == 0 ? "" : `In ${count}s`}
          </Button>
        )}
      </Form>
    </>
  );
}
