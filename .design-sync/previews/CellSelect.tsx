import * as React from "react";
import {
  CellSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "design-baseline";

const ROWS = [
  { id: "r1", name: "Ana Reyes", grade: "A" },
  { id: "r2", name: "Bo Chen", grade: "B" },
  { id: "r3", name: "Cyrus Ali", grade: "C" },
];

const GRADES = ["A", "B", "C", "D", "F"];

export function InTableRow() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead className="w-24">Grade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell>
              <CellSelect defaultValue={r.grade} className="text-center font-mono tabular-nums">
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </CellSelect>
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
          <TableCell className="text-muted-foreground">Status</TableCell>
          <TableCell>
            <CellSelect defaultValue="active">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </CellSelect>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-muted-foreground">Disabled</TableCell>
          <TableCell>
            <CellSelect defaultValue="locked" disabled>
              <option value="locked">Locked</option>
            </CellSelect>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
