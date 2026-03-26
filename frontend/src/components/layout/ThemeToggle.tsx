"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <span className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Icon name="sun" className="h-4 w-4 transition-all hover:scale-110" />
      ) : (
        <Icon name="moon" className="h-4 w-4 transition-all hover:scale-110" />
      )}
    </Button>
  );
}
