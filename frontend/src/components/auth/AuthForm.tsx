"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { LoginDto, RegisterDto } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthMode = "login" | "register";

export default function AuthForm() {
  const router = useRouter();
  const { user, loading, error, login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [localError, setLocalError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    try {
      if (mode === "login") {
        const payload: LoginDto = { email, password };
        await login(payload);
      } else {
        const payload: RegisterDto = { fullName, email, password };
        await register(payload);
      }

      router.replace("/");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50 bg-background/90 shadow-xl backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="inline-flex rounded-full border border-border/60 bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              mode === "login"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              mode === "register"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đăng ký
          </button>
        </div>
        <div>
          <CardTitle>
            {mode === "login" ? "Truy cập tài khoản" : "Tạo tài khoản mới"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Đăng nhập để truy cập dữ liệu tài chính riêng của bạn."
              : "Mỗi tài khoản có dữ liệu hoàn toàn tách biệt theo UserId."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
            />
          </div>

          {(localError || error) && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {localError || error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Đang xử lý..."
              : mode === "login"
              ? "Đăng nhập"
              : "Tạo tài khoản"}
          </Button>

          {mode === "login" && (
            <p className="text-xs text-muted-foreground">
              Tài khoản demo mặc định: `demo@expense-tracker.local` / `Demo@123`
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

