import AppSidebar from "@/components/layout/AppSidebar";
import NotificationBell from "@/components/layout/NotificationBell";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import ThemeToggle from "@/components/layout/ThemeToggle";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Personal Finance Management App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <div className="flex h-screen overflow-hidden bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Glassy header — desktop only */}
              <header className="relative z-50 hidden lg:flex h-14 shrink-0 items-center justify-end gap-1.5 px-6 border-b border-border/30 bg-background/70 backdrop-blur-xl">
                <NotificationBell />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-y-auto p-4 pt-20 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}