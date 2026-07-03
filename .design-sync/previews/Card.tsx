import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Progress,
} from "design-baseline";

// The canonical shape — header (title + description), content, footer with
// actions, as it renders atop a project or plan detail.
export function ProjectCard() {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Website redesign</CardTitle>
        <CardDescription>
          Due October 12 · Marketing workspace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">68%</span>
        </div>
        <Progress value={68} />
      </CardContent>
      <CardFooter className="justify-between">
        <Badge variant="secondary">In progress</Badge>
        <Button size="sm">View project</Button>
      </CardFooter>
    </Card>
  );
}

// A billing summary card — CardContent holding a key-value block, no footer
// actions beyond a single CTA.
export function InvoiceCard() {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Invoice #4821</CardTitle>
        <CardDescription>Billed to Acme Corp</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>$1,240.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>$99.20</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Total due</span>
          <span>$1,339.20</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Pay invoice</Button>
      </CardFooter>
    </Card>
  );
}

// A team card — an avatar row inside CardContent, footer with a secondary
// action, showing the card hosting composed molecules rather than plain text.
export function TeamCard() {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Growth pod</CardTitle>
        <CardDescription>4 members · 2 open roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex -space-x-2">
          <Avatar className="ring-2 ring-background">
            <AvatarFallback>PN</AvatarFallback>
          </Avatar>
          <Avatar className="ring-2 ring-background">
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <Avatar className="ring-2 ring-background">
            <AvatarFallback>JK</AvatarFallback>
          </Avatar>
          <Avatar className="ring-2 ring-background">
            <AvatarFallback className="bg-muted text-muted-foreground">+1</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">Last active 2h ago</span>
        <Button variant="outline" size="sm">Manage</Button>
      </CardFooter>
    </Card>
  );
}
