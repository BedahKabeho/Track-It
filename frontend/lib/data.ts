export type WorkspaceIcon = "code" | "book" | "briefcase";
export type WorkspaceTaskStatus = "prog" | "done";

export type WorkspaceTask = {
  id: string;
  title: string;
  status: WorkspaceTaskStatus;
  dueDate: string;
  dueTime?: string;
  reminder: boolean;
};

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
  { id: "website-development", name: "Website Development", icon: "code", tagline: "Build and ship the new site", done: 7, total: 12, footer: { kind: "due", text: "2 tasks due today" } },
  { id: "learning", name: "Learning", icon: "book", tagline: "Make time for steady growth", done: 5, total: 9, footer: { kind: "quiet", text: "Updated yesterday" } },
  { id: "freelance", name: "Freelance", icon: "briefcase", tagline: "Keep client work on track", done: 3, total: 7, footer: { kind: "quiet", text: "Updated this week" } },
];

// Temporary UI data for the workspace pages. Keep IDs aligned with the
// dashboard links; replace this seed source with tasksApi when backend routes land.
export const workspaceTasks: Record<string, WorkspaceTask[]> = {
  "website-development": [
    { id: "web-1", title: "Build homepage", status: "prog", dueDate: "2026-10-23", dueTime: "5:00 PM", reminder: true },
    { id: "web-2", title: "Review accessibility", status: "prog", dueDate: "2026-10-23", dueTime: "6:00 PM", reminder: true },
    { id: "web-3", title: "Responsive navigation", status: "prog", dueDate: "2026-10-26", dueTime: "5:00 PM", reminder: true },
    { id: "web-4", title: "Connect contact form", status: "prog", dueDate: "2026-10-27", dueTime: "5:00 PM", reminder: true },
    { id: "web-5", title: "Launch QA", status: "prog", dueDate: "2026-10-30", dueTime: "3:00 PM", reminder: true },
    { id: "web-6", title: "Define sitemap", status: "done", dueDate: "2026-10-19", reminder: false },
    { id: "web-7", title: "Create wireframes", status: "done", dueDate: "2026-10-20", reminder: false },
    { id: "web-8", title: "Set up repository", status: "done", dueDate: "2026-10-21", reminder: false },
    { id: "web-9", title: "Agree on brand direction", status: "done", dueDate: "2026-10-17", reminder: false },
    { id: "web-10", title: "Gather page content", status: "done", dueDate: "2026-10-18", reminder: false },
    { id: "web-11", title: "Create design system", status: "done", dueDate: "2026-10-20", reminder: false },
    { id: "web-12", title: "Review first prototype", status: "done", dueDate: "2026-10-22", reminder: false },
  ],
  learning: [
    { id: "learn-1", title: "Math problem set 5", status: "prog", dueDate: "2026-10-26", dueTime: "11:59 PM", reminder: true },
    { id: "learn-2", title: "History essay draft", status: "prog", dueDate: "2026-10-28", dueTime: "5:00 PM", reminder: true },
    { id: "learn-3", title: "Prepare presentation slides", status: "prog", dueDate: "2026-10-29", dueTime: "9:00 AM", reminder: true },
    { id: "learn-4", title: "Read chapter 4", status: "done", dueDate: "2026-10-20", reminder: false },
    { id: "learn-5", title: "Outline history essay", status: "done", dueDate: "2026-10-21", reminder: false },
    { id: "learn-6", title: "Submit lab report", status: "done", dueDate: "2026-10-22", reminder: false },
    { id: "learn-7", title: "Review lecture notes", status: "done", dueDate: "2026-10-18", reminder: false },
    { id: "learn-8", title: "Complete practice quiz", status: "done", dueDate: "2026-10-19", reminder: false },
    { id: "learn-9", title: "Plan study schedule", status: "prog", dueDate: "2026-10-27", dueTime: "4:00 PM", reminder: true },
  ],
  freelance: [
    { id: "free-1", title: "Draft business model canvas", status: "prog", dueDate: "2026-10-28", dueTime: "5:00 PM", reminder: true },
    { id: "free-2", title: "Research competitors", status: "prog", dueDate: "2026-10-30", dueTime: "5:00 PM", reminder: true },
    { id: "free-3", title: "Estimate project costs", status: "prog", dueDate: "2026-11-02", dueTime: "5:00 PM", reminder: true },
    { id: "free-4", title: "Prepare client proposal", status: "prog", dueDate: "2026-11-05", dueTime: "5:00 PM", reminder: true },
    { id: "free-5", title: "Define project scope", status: "done", dueDate: "2026-10-21", reminder: false },
    { id: "free-6", title: "Confirm client requirements", status: "done", dueDate: "2026-10-19", reminder: false },
    { id: "free-7", title: "Set project milestones", status: "done", dueDate: "2026-10-22", reminder: false },
  ],
};
