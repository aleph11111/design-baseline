import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { useLabels } from "../../lib/labels";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface ThemeToggleLabels {
  toggle?: string;
  light?: string;
  dark?: string;
  system?: string;
}

export interface ThemeToggleProps {
  labels?: ThemeToggleLabels;
}

export function ThemeToggle({ labels }: ThemeToggleProps = {}) {
  const { setTheme } = useTheme();
  const L = useLabels();
  const toggle = labels?.toggle ?? L.toggleTheme;
  const light = labels?.light ?? L.light;
  const dark = labels?.dark ?? L.dark;
  const system = labels?.system ?? L.system;
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
