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
import { sendVerificationLink, signIn } from "./actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";
import { useCountdown } from "usehooks-ts";

export default function SignInForm() {
  const [showVerificationLink, showVerificationLinkSet] = useState(false);
  const router = useRouter();
  const [countStart, countStartSet] = useState(60);
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart,
      intervalMs: 1000,
    });

  useEffect(() => {
    if (count === 0) {
      resetCountdown();
      showVerificationLinkSet(true);
    }
  }, [count, resetCountdown]);

  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "carlton.joseph@gmail.com",
      password: "password",
    },
  });

  async function onSubmit(values: z.infer<typeof SignInFormSchema>) {
    const result = await signIn(values);
    console.log({ from: "onSubmit", result });
    if (result.error) {
      toast({ variant: "destructive", description: result.error });
      if (result?.key === "email_not_verified") {
        showVerificationLinkSet(true);
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
    console.log({ from: "onReqVerification", result });
    if (result.timeLeft) {
      countStartSet(result.timeLeft);
      resetCountdown();
      return;
    }
    if (result.error) {
      toast({ variant: "destructive", description: result.error });
    } else {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>email</FormLabel>
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
          disabled={count > 0 && count < 60}
        >
          Resend Verification Link {count == 60 ? "" : `In ${count}s`}
        </Button>
      )}
    </Form>
  );
}
