import type { Metadata } from "next";
import type { ReactNode } from "react";
import { WorkspaceTasksProvider } from "@/app/WorkspaceTasksProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackIt",
  description: "A little clarity for your day. Organise tasks and workspaces with TrackIt.",
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
