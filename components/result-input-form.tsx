"use client";

import { useActionState } from "react";
import { saveManualResultsAction } from "@/app/actions/results";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ResultInputForm({ buttonLabel }: { buttonLabel: string }) {
  const [state, formAction] = useActionState(saveManualResultsAction, undefined);
  return (
    <form action={formAction} className="grid gap-4">
      <Input name="drawDate" type="date" required />
      <Textarea name="raw" placeholder={"1234\n5678\n9012\n1111\n2222"} required />
      {state?.message ? <p className="rounded-md bg-accent p-3 text-sm">{state.message}</p> : null}
      <Button className="w-fit">{buttonLabel}</Button>
    </form>
  );
}
