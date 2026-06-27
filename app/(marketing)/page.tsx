import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/locale";

export default async function HomePage() {
  const t = await getDictionary();
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary/5">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full"></div>
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl content-center gap-12 px-4 py-16 sm:px-6 lg:px-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t.marketing.eyebrow}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  Frequency Analyzer
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                  4D Pro Edition
                </span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                {t.marketing.hero}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-12 px-6 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25">
                <Link href="/contact" className="gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {t.marketing.contactAdmin}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 border-2 hover:bg-primary/5 hover:border-primary">
                <Link href="/login" className="gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                  {t.marketing.login}
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">500+ Active Users</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative animate-fade-in">
            <div className="relative rounded-3xl bg-white p-6 shadow-2xl shadow-slate-200/50 border border-border/50 overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Live Analysis</h3>
                    <p className="text-xs text-muted-foreground">Real-time frequency tracking</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">Live</Badge>
              </div>

              {/* Progress bars */}
              <div className="space-y-4">
                {[
                  { name: "AS", value: 91, color: "from-primary to-primary-light" },
                  { name: "KOP", value: 82, color: "from-secondary to-secondary-light" },
                  { name: "KEPALA", value: 73, color: "from-info to-cyan-400" },
                  { name: "EKOR", value: 64, color: "from-success to-emerald-400" },
                ].map((item, index) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm font-bold text-primary">{item.value}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-secondary"></div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl backdrop-blur-sm border border-secondary/20 flex items-center justify-center animate-bounce-slow">
              <svg className="w-10 h-10 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Powerful Features
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for comprehensive 4D frequency analysis and predictions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {t.marketing.featureCards.map((title, index) => (
            <Card key={title} hover className="group relative overflow-hidden border-border/60">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                index === 0 ? "from-primary to-primary-light" :
                index === 1 ? "from-secondary to-secondary-light" :
                "from-info to-cyan-400"
              }`} />
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                  index === 0 ? "bg-primary/10" :
                  index === 1 ? "bg-secondary/10" :
                  "bg-info/10"
                }`}>
                  {index === 0 && (
                    <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z" />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg className="w-6 h-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg className="w-6 h-6 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t.marketing.featureCardBody}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-primary p-8 sm:p-12">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Join hundreds of users who trust our platform for accurate 4D frequency analysis
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="h-12 px-8 shadow-lg">
                <Link href="/contact">
                  Contact Admin
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Link href="/login">
                  Sign In Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
