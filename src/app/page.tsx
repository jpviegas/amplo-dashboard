"use client";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center">
      <div className="w-full max-w-sm md:max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}
