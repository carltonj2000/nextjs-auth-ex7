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

import { SignUpFormSchema } from "@/app/types";
import { signUp } from "./actions";
import { useRouter } from "next/navigation";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";

export default function SignUpForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      email: "carlton.joseph@gmail.com",
      password: "password",
      confirmPassword: "password",
    },
  });

  async function onSubmit(values: z.infer<typeof SignUpFormSchema>) {
    const result = await signUp(values);
    if (result.error) {
      toast({ variant: "destructive", description: result.error });
    } else {
      toast({
        variant: "default",
        description: "Verification Email Sent. Please verify your email!",
        action: (
          <ToastAction altText="Verify">
            <Link href={result.data?.url!}>Verify</Link>
          </ToastAction>
        ),
      });
      router.push("/");
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
    </Form>
  );
}
