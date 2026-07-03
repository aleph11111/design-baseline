import * as React from "react";
import {
  CellInput,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "design-baseline";

const ROWS = [
  { id: "r1", name: "Homework Club", note: "" },
  { id: "r2", name: "Choir Rehearsal", note: "Retake pending" },
  { id: "r3", name: "Repair Café", note: "" },
];

export function InTableRow() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Session</TableHead>
          <TableHead>Note</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">
              <CellInput defaultValue={r.name} />
            </TableCell>
            <TableCell>
              <CellInput defaultValue={r.note} placeholder="Add a note…" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function States() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Field</TableHead>
          <TableHead>Control</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-muted-foreground">Default</TableCell>
          <TableCell>
            <CellInput defaultValue="Board Game Night" />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-muted-foreground">Placeholder</TableCell>
          <TableCell>
            <CellInput placeholder="Untitled session" />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-muted-foreground">Disabled</TableCell>
          <TableCell>
            <CellInput defaultValue="Locked value" disabled />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
