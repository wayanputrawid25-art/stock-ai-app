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
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-white to-primary/5">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-[420px] animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light shadow-lg shadow-primary/25 mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 32 32" fill="none">
              <path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="16" r="4" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            4D Analyzer Pro
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Premium Frequency Analysis</p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-slate-200/50 bg-white/95 backdrop-blur-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary-light to-secondary"></div>
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-xl text-center font-semibold">{labels.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form action={formAction} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <Input 
                    id="email"
                    name="email" 
                    type="email" 
                    placeholder={labels.email} 
                    required 
                    className="pl-12 h-12 bg-slate-50/50 border-border/80 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <Input 
                    id="password"
                    name="password" 
                    type="password" 
                    placeholder={labels.password} 
                    required 
                    className="pl-12 h-12 bg-slate-50/50 border-border/80 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {state?.message ? (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3 animate-scale-in">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <p className="text-sm text-destructive">{state.message}</p>
                </div>
              ) : null}
              
              <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 transition-all duration-200" type="submit">
                {labels.button}
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </main>
  );
}
