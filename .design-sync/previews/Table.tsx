import * as React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "design-baseline";

const RECIPES = [
  { id: "r1", name: "Pasta Carbonara", cuisine: "Italian", prep: 25, servings: 2 },
  { id: "r2", name: "Chicken Tikka Masala", cuisine: "Indian", prep: 45, servings: 4 },
  { id: "r3", name: "Sushi Rolls", cuisine: "Japanese", prep: 60, servings: 2 },
  { id: "r4", name: "Tacos al Pastor", cuisine: "Mexican", prep: 35, servings: 6 },
  { id: "r5", name: "Crème Brûlée", cuisine: "French", prep: 50, servings: 4 },
];

// OVERRIDE target: a realistic data table is wide; render as a column card.
export function DataTable() {
  return (
    <Table>
      <TableCaption>Recipe collection — 5 entries</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Cuisine</TableHead>
          <TableHead className="text-right">Prep time</TableHead>
          <TableHead className="text-right">Servings</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {RECIPES.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium text-primary">{r.name}</TableCell>
            <TableCell className="text-muted-foreground">{r.cuisine}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{r.prep} min</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{r.servings}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total prep time</TableCell>
          <TableCell className="text-right font-mono tabular-nums">
            {RECIPES.reduce((sum, r) => sum + r.prep, 0)} min
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
