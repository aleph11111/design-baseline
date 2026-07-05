import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ThemeToggleLabels {
  toggle?: string;
  light?: string;
  dark?: string;
  system?: string;
}

const DEFAULT_LABELS: Required<ThemeToggleLabels> = {
  toggle: "Toggle color scheme",
  light: "Light",
  dark: "Dark",
  system: "System",
};

export interface ThemeToggleProps {
  labels?: ThemeToggleLabels;
}

export function ThemeToggle({ labels }: ThemeToggleProps = {}) {
  const { setTheme } = useTheme();
  const { toggle, light, dark, system } = { ...DEFAULT_LABELS, ...labels };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={toggle} className="relative">
          <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>{light}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>{dark}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>{system}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
