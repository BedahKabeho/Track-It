import type { Metadata } from "next";
import type { ReactNode } from "react";
import { WorkspaceTasksProvider } from "@/app/WorkspaceTasksProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackItz",
  description: "Organise your tasks and workspaces with TrackItz.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WorkspaceTasksProvider>{children}</WorkspaceTasksProvider>
      </body>
    </html>
  );
}
