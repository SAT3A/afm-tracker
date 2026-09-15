"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            AFM Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buat akun untuk memulai manajemen affiliate Anda
          </p>
        </div>

        <Card className="shadow-xl border-border bg-card/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">Buat Akun Baru</CardTitle>
            <CardDescription>
              Isi data berikut untuk mendaftar akun AFM Tracker
            </CardDescription>
          </CardHeader>

          <form action={action}>
            <CardContent className="space-y-4">
              {/* Alert global message if any */}
              {state?.message && (
                <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive font-medium">
                  {state.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Satria"
                    autoComplete="name"
                    required
                    className="pl-9"
                    defaultValue=""
                  />
                </div>
                {state?.errors?.name && (
                  <p className="text-xs text-destructive font-medium">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    autoComplete="email"
                    required
                    className="pl-9"
                    defaultValue=""
                  />
                </div>
                {state?.errors?.email && (
                  <p className="text-xs text-destructive font-medium">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                    required
                    className="pl-9"
                    defaultValue=""
                  />
                </div>
                {state?.errors?.password && (
                  <p className="text-xs text-destructive font-medium">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  <>
                    Daftar Sekarang
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center text-xs text-muted-foreground mt-2">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Masuk ke akun
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
