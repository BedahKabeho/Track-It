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
        <div className="page-background" aria-hidden="true">
          <svg viewBox="0 0 440 250" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50 250 C50 160 160 180 270 215 C340 238 390 238 440 240 L-50 250 Z" fill="#b9e7ea" fillOpacity="0.32" />
            <path d="M-70 250 C30 115 190 145 300 200 C360 225 400 232 440 242 L-70 250 Z" fill="#cef0f1" fillOpacity="0.45" />
            <path d="M-90 250 C10 70 210 110 330 180 C380 210 410 225 440 245 L-90 250 Z" fill="#e7f8f8" fillOpacity="0.55" />
          </svg>
        </div>
        <ThemeProvider>
          <ThemeToggle className="auth-theme-toggle" />
          <WorkspaceTasksProvider>{children}</WorkspaceTasksProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
