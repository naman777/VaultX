"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false, // Change to false if you want to handle redirection manually
    });

    if (!result?.ok) {
      toast.error("Invalid credentials. Please try again.");
      setIsLoading(false);
      return;
    } else {
      toast.success("Successfully logged in.");
      router.push("/dashboard");
      return;
    }
  }

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (session) {
      // toast.error("You need to be logged in to access this page.");
      router.push("/dashboard");
      return;
    }
  }, [session, status]);

  return (
    <div className="container  relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/signup"
        className="absolute right-4 top-4 md:right-8 md:top-8"
      >
        Sign Up
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-800 to-blue-600" />
        <motion.div
          className="relative z-20 flex items-center text-lg font-medium cursor-pointer"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => {
            router.push("/")
          }}
        >
          <Icons.logo className="mr-2 h-6 w-6" />
          VaultX
        </motion.div>
        <motion.div
          className="relative z-20 mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;VaultX provides the security and ease of use that we've
              always wanted in a file sharing platform.&rdquo;
            </p>
            <footer className="text-sm">Naman Kundra</footer>
          </blockquote>
        </motion.div>
      </div>
      <div className="lg:p-8">
        <motion.div
          className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={onSubmit}>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="password">
                    Password
                  </Label>
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <Button disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </div>
            </form>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/forgot-password"
              className="underline underline-offset-4 hover:text-primary"
            >
              Forgot your password?
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
