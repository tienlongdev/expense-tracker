"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import AppSidebar from "@/components/layout/AppSidebar";
import NotificationBell from "@/components/layout/NotificationBell";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const publicPaths = new Set(["/login"]);

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isPublicPage = publicPaths.has(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.replace("/login");
    }
  }, [isPublicPage, loading, router, user]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-xl border border-border/50 bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
          Đang kiểm tra phiên đăng nhập...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-50 hidden h-14 shrink-0 items-center justify-end gap-1.5 border-b border-border/30 bg-background/70 px-6 backdrop-blur-xl lg:flex">
          <NotificationBell />
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-4 pt-20 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShellContent>{children}</ShellContent>
    </AuthProvider>
  );
}
