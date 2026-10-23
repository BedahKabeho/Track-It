export type WorkspaceIcon = "code" | "book" | "briefcase";

export type Workspace = {
  id: string;
  name: string;
  icon: WorkspaceIcon;
  tagline: string;
  done: number;
  total: number;
  footer: { kind: "due" | "quiet"; text: string };
};

export const user = {
  firstName: "Alex",
  fullName: "Alex Morgan",
  initials: "AM",
  account: "Personal workspace",
  unreadNotifications: 3,
};

export const workspaces: Workspace[] = [
  { id: "website-development", name: "Website Development", icon: "code", tagline: "Build and ship the new site", done: 8, total: 12, footer: { kind: "due", text: "2 tasks due today" } },
  { id: "learning", name: "Learning", icon: "book", tagline: "Make time for steady growth", done: 5, total: 9, footer: { kind: "quiet", text: "Updated yesterday" } },
  { id: "freelance", name: "Freelance", icon: "briefcase", tagline: "Keep client work on track", done: 3, total: 7, footer: { kind: "quiet", text: "Updated this week" } },
];
