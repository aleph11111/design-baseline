import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "design-baseline";

export function Default() {
  return (
    <Tabs defaultValue="details" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="text-sm text-muted-foreground">
        Serves 4 · Prep 15 min · Cook 20 min · Italian.
      </TabsContent>
      <TabsContent value="ingredients" className="text-sm text-muted-foreground">
        Guanciale, eggs, pecorino romano, spaghetti, black pepper.
      </TabsContent>
      <TabsContent value="notes" className="text-sm text-muted-foreground">
        Render the guanciale slowly. Temper the eggs off-heat.
      </TabsContent>
    </Tabs>
  );
}

export function WithDisabled() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="archived" disabled>
          Archived
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-muted-foreground">
        3 recipes published this week.
      </TabsContent>
      <TabsContent value="activity" className="text-sm text-muted-foreground">
        Bo Chen duplicated “Sushi Rolls” · 2h ago.
      </TabsContent>
    </Tabs>
  );
}
