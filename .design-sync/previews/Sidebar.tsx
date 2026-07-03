import {
  Home,
  Inbox,
  Settings,
  Users,
  FileText,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "design-baseline";

// The raw shadcn Sidebar primitive (not the app-level AppSidebar wrapper),
// composed with a header search input, a labeled nav group, and a footer —
// the shape most consuming apps build on top of. Needs SidebarProvider
// context to size/position correctly.
export function WithNavAndFooter() {
  return (
    <SidebarProvider defaultOpen>
      <div
        className="flex overflow-hidden rounded-md border"
        style={{ height: 384, width: 320 }}
      >
        <Sidebar collapsible="none" className="h-full">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-semibold">Ledger</span>
            </div>
            <SidebarInput placeholder="Search..." />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <Home />
                      <span>Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Inbox />
                      <span>Inbox</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Users />
                      <span>Customers</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 p-4 text-sm text-muted-foreground">
          Page content
        </div>
      </div>
    </SidebarProvider>
  );
}

// Two nav groups, no search input — a slightly denser variant to show the
// group-label + multiple-section shape.
export function TwoGroups() {
  return (
    <SidebarProvider defaultOpen>
      <div
        className="flex overflow-hidden rounded-md border"
        style={{ height: 384, width: 320 }}
      >
        <Sidebar collapsible="none" className="h-full">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Search className="h-4 w-4" />
              </div>
              <span className="font-semibold">Atlas</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Reports</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <FileText />
                      <span>Revenue</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <FileText />
                      <span>Retention</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Users />
                      <span>Team</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 p-4 text-sm text-muted-foreground">
          Page content
        </div>
      </div>
    </SidebarProvider>
  );
}
