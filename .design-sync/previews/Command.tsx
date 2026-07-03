import * as React from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "design-baseline";
import { Calendar, Dumbbell, Plus, Settings, User } from "lucide-react";

// Command palette rendered inline (not via CommandDialog) with realistic
// grouped commands, so the card shows the real list/item styling rather
// than an empty shell.
export function Open() {
  return (
    <div className="rounded-lg border bg-popover shadow-md">
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Plus className="mr-2 h-4 w-4" />
              <span>Log a new workout</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Jump to today</span>
            </CommandItem>
            <CommandItem>
              <Dumbbell className="mr-2 h-4 w-4" />
              <span>View training plan</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
