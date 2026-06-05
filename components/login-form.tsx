"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginLabels = {
  title: string;
  email: string;
  password: string;
  button: string;
};

export function LoginForm({ initialMessage, labels }: { initialMessage?: string; labels: LoginLabels }) {
  const [state, formAction] = useActionState(loginAction, initialMessage ? { message: initialMessage } : undefined);
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <Input name="email" type="email" placeholder={labels.email} required />
            <Input name="password" type="password" placeholder={labels.password} required />
            {state?.message ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p> : null}
            <Button>{labels.button}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
