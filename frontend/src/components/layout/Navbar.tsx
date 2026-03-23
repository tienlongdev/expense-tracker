import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Icon name="wallet" className="w-6 h-6" />
          <span>Expense Tracker</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/"
            className="text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/transactions"
            className="text-muted-foreground hover:text-foreground transition-colors">
            Transactions
          </Link>
          <Link href="/calendar"
            className="text-muted-foreground hover:text-foreground transition-colors">
            Calendar
          </Link>
          <Link href="/report"
            className="text-muted-foreground hover:text-foreground transition-colors">
            Report
          </Link>
        </nav>
      </div>
      <Separator />
    </header>
  );
}