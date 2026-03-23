"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9">
        <span className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9 rounded-full"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Icon name="sun" className="w-4 h-4 transition-all hover:scale-110" />
      ) : (
        <Icon name="moon" className="w-4 h-4 transition-all hover:scale-110" />
      )}
    </Button>
  );
}
