"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function TelegramPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const handleTestConnection = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConnected(true);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Telegram</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Connect Telegram bot for notifications</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-1">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium bg-white shadow-md text-blue-600 border border-blue-200">
                <span className="p-2 rounded-lg bg-blue-100">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </span>
                Telegram Bot
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/50 transition-colors">
                <span className="p-2 rounded-lg bg-white/50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </span>
                Notifications
              </button>
            </nav>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.234.169.333.016.098.035.32.019.493z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl">Telegram Bot Setup</CardTitle>
                  <CardDescription>Connect your Telegram bot to receive alerts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-800">Status: {isConnected ? "Connected" : "Not Connected"}</p>
                  <p className="text-sm text-green-600">{isConnected ? "Your bot is ready to send notifications" : "Configure your bot settings below"}</p>
                </div>
                <Badge variant={isConnected ? "success" : "secondary"} className={isConnected ? "bg-green-100 text-green-700" : ""}>
                  {isConnected ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Bot Token</label>
                  <div className="relative">
                    <Input 
                      type="password" 
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxYZ" 
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      className="h-12 rounded-xl border-2 focus:border-blue-500/50 pr-20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Required</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Get your bot token from @BotFather on Telegram</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Chat ID</label>
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="123456789" 
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      className="h-12 rounded-xl border-2 focus:border-blue-500/50 pr-20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Required</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Your Telegram Chat ID (get it from @userinfobot)</p>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isSaving || !botToken || !chatId}
                  variant="outline"
                  className="rounded-xl flex-1 border-2 hover:border-blue-500 hover:text-blue-600"
                >
                  Test Connection
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="rounded-xl flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg shadow-blue-500/20"
                >
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50">
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Choose what alerts you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {[
                { title: "New Analysis Ready", desc: "Get notified when analysis completes", enabled: true },
                { title: "Prediction Alerts", desc: "Receive prediction updates", enabled: true },
                { title: "Daily Summary", desc: "Daily recap of your activity", enabled: false },
                { title: "System Updates", desc: "Important system notifications", enabled: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                    <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all shadow-md"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
