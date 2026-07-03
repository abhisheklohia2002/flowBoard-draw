import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, Network, PenTool, Shapes, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLogin, useRegister } from "../hooks/useAuth";

type AuthMode = "login" | "register";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const register = useRegister();
  const isRegister = mode === "register";
  const isPending = login.isPending || register.isPending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (isRegister) {
      register.mutate({ full_name: fullName, email, password });
      return;
    }

    login.mutate({ email, password });
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute left-10 top-16 hidden rounded-3xl border border-primary/20 bg-primary/10 p-5 blur-[0.2px] lg:block">
        <Shapes className="h-10 w-10 text-primary" />
      </div>
      <div className="absolute bottom-16 right-14 hidden rounded-3xl border border-primary/20 bg-primary/10 p-5 lg:block">
        <PenTool className="h-10 w-10 text-primary" />
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_30%)]" />

      <Card className="w-full max-w-md border-border/70 bg-card/85 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Network className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">FlowBoard</CardTitle>
          <CardDescription>
            {isRegister ? "Create your diagram workspace." : "Welcome back. Your diagrams missed you."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-secondary p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cn("rounded-lg px-3 py-2 text-sm text-muted-foreground transition", mode === "login" && "bg-background text-foreground shadow")}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={cn("rounded-lg px-3 py-2 text-sm text-muted-foreground transition", mode === "register" && "bg-background text-foreground shadow")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" placeholder="Abhishek Lohia" required />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="Minimum 8 characters" required minLength={8} />
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Please wait..." : isRegister ? "Create account" : "Login"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
