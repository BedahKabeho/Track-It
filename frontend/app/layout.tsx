import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/app/ThemeProvider";
import { WorkspaceTasksProvider } from "@/app/WorkspaceTasksProvider";
import ThemeToggle from "@/app/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackIt",
  description: "A little clarity for your day. Organise tasks and workspaces with TrackIt.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ThemeToggle className="auth-theme-toggle" />
          <WorkspaceTasksProvider>{children}</WorkspaceTasksProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
