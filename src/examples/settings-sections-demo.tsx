/**
 * settings-sections-demo.tsx
 *
 * Sandbox second consumer for the D3 (settings-sections) archetype.
 * Domain: an observatory's night-session settings — deliberately far from the
 * brickshop source nouns (no sourcing / templates / carriers / numbering).
 *
 * Types are defined FIRST, with zero reference to the source pages, then fed
 * into <SettingsSectionsShell> / <SettingsSection>.
 *
 * Exercises:
 *   - The page frame (ADR-0008): title + subtitle once, one page verb
 *     ("Sync sky catalog") in the header's actions slot
 *   - Independent sections stacked in the one surface, each titled once
 *   - Per-section save at the section foot: gated on a dirty draft, with an
 *     in-flight saving label (Telescope)
 *   - A section with a title-bar control and no save — a read-only reference
 *     panel (Mirror temperature)
 */

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { SettingsSection, SettingsSectionsShell } from "@/components/archetypes/settings-sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// ---------------------------------------------------------------------------
// Domain types (defined first — no primitive coupling)
// ---------------------------------------------------------------------------

type TelescopeSettings = { slewSpeed: number; parkAltitude: number };
type SessionSettings = { autoCloseDome: boolean; minimumSeeing: number };

const INITIAL_TELESCOPE: TelescopeSettings = { slewSpeed: 4, parkAltitude: 15 };
const INITIAL_SESSION: SessionSettings = { autoCloseDome: true, minimumSeeing: 2.5 };

// ---------------------------------------------------------------------------
// One section's draft + save state (stands in for the app's mutation layer)
// ---------------------------------------------------------------------------

function useSectionDraft<T>(initial: T) {
  const [saved, setSaved] = React.useState(initial);
  const [draft, setDraft] = React.useState(initial);
  const [isSaving, setIsSaving] = React.useState(false);
  const save = () => {
    setIsSaving(true);
    window.setTimeout(() => {
      setSaved(draft);
      setIsSaving(false);
    }, 800);
  };
  return { draft, setDraft, isSaving, save, dirty: JSON.stringify(draft) !== JSON.stringify(saved) };
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid max-w-sm gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo
// ---------------------------------------------------------------------------

export function SettingsSectionsDemo() {
  const telescope = useSectionDraft(INITIAL_TELESCOPE);
  const session = useSectionDraft(INITIAL_SESSION);
  const [mirrorReadAt, setMirrorReadAt] = React.useState("21:04");

  return (
    <SettingsSectionsShell
      title="Observatory"
      subtitle="Telescope, night-session and sensor defaults."
      actions={<Button variant="outline">Sync sky catalog</Button>}
    >
      <SettingsSection
        title="Telescope"
        description="Mount motion and the parking position."
        onSave={telescope.save}
        isSaving={telescope.isSaving}
        saveDisabled={!telescope.dirty}
      >
        <div className="space-y-4">
          <NumberField
            id="slew-speed"
            label="Slew speed (°/s)"
            value={telescope.draft.slewSpeed}
            onChange={(slewSpeed) => telescope.setDraft({ ...telescope.draft, slewSpeed })}
          />
          <NumberField
            id="park-altitude"
            label="Park altitude (°)"
            value={telescope.draft.parkAltitude}
            onChange={(parkAltitude) => telescope.setDraft({ ...telescope.draft, parkAltitude })}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Night session"
        onSave={session.save}
        isSaving={session.isSaving}
        saveDisabled={!session.dirty}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="auto-close-dome"
              checked={session.draft.autoCloseDome}
              onCheckedChange={(autoCloseDome) => session.setDraft({ ...session.draft, autoCloseDome })}
            />
            <Label htmlFor="auto-close-dome">Close the dome when clouds are detected</Label>
          </div>
          <NumberField
            id="minimum-seeing"
            label="Minimum seeing (arcsec)"
            value={session.draft.minimumSeeing}
            onChange={(minimumSeeing) => session.setDraft({ ...session.draft, minimumSeeing })}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Mirror temperature"
        description="Read-only — reported by the primary mirror sensor."
        actions={
          <Button
            variant="ghost"
            size="sm"
            className="-my-1.5 h-7 text-xs"
            onClick={() => setMirrorReadAt(new Date().toTimeString().slice(0, 5))}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-read
          </Button>
        }
      >
        <p className="text-sm">
          4.2 °C, 0.8 °C above ambient <span className="text-muted-foreground">· read at {mirrorReadAt}</span>
        </p>
      </SettingsSection>
    </SettingsSectionsShell>
  );
}
