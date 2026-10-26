"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Account, WorkspaceRecord } from "@/lib/api";
import { apiRequest, TOKEN_KEY } from "@/lib/api";
import { user as sampleUser, workspaces as sampleWorkspaces } from "@/lib/data";
import Icon from "./Icon";
import WorkspaceIcon from "./workspace-icon";
import WorkspaceCreateButton from "./WorkspaceCreateButton";

export default function Sidebar({ profile, workspaces, activeWorkspaceId, onWorkspaceCreated }: {
  profile?: Account;
  workspaces?: WorkspaceRecord[];
  activeWorkspaceId?: string;
  onWorkspaceCreated?: (workspace: WorkspaceRecord) => void;
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const account = profile ?? { id: 0, full_name: sampleUser.fullName, email: "" };
  const workspaceList = useMemo(() => workspaces ?? sampleWorkspaces.map((workspace) => ({
    id: Number.isNaN(Number(workspace.id)) ? workspace.id : Number(workspace.id),
    name: workspace.name,
    description: workspace.tagline,
    created_at: "",
    updated_at: "",
  })), [workspaces]);
  const [sidebarWorkspaces, setSidebarWorkspaces] = useState(workspaceList);
  const initials = account.full_name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  useEffect(() => setSidebarWorkspaces(workspaceList), [workspaceList]);

  async function signOut() {
    setSigningOut(true);
    try {
      await apiRequest("/api/auth/logout/", { method: "POST" });
    } catch {
      // Clear local credentials even if the server is unavailable.
    } finally {
      window.localStorage.removeItem(TOKEN_KEY);
      router.replace("/login");
    }
  }

  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="brand" aria-label="TrackIt dashboard">
        <span className="brand-mark"><Icon name="check-square" size={16} strokeWidth={2.25} /></span>
        <span className="brand-name">TrackItz</span>
      </Link>
      <nav className="nav" aria-label="Main">
        <Link href="/dashboard" className={`nav-item ${pathname === "/dashboard" ? "active" : ""}`} aria-current={pathname === "/dashboard" ? "page" : undefined}>
          <Icon name="home" /><span>Home</span>
        </Link>
        <Link href="/notifications" className={`nav-item ${pathname.startsWith("/notifications") ? "active" : ""}`} aria-current={pathname.startsWith("/notifications") ? "page" : undefined}>
          <Icon name="bell" /><span>Notifications</span>
        </Link>
        {profile?.is_admin && <Link href="/admin" className={`nav-item ${pathname.startsWith("/admin") ? "active" : ""}`} aria-current={pathname.startsWith("/admin") ? "page" : undefined}>
          <Icon name="users" /><span>Admin</span>
        </Link>}
      </nav>
      <div className="nav-section">
        <span className="nav-section-label">Workspaces</span>
        <WorkspaceCreateButton compact onCreated={(workspace) => {
          setSidebarWorkspaces((current) => [...current, workspace].sort((a, b) => a.name.localeCompare(b.name)));
          onWorkspaceCreated?.(workspace);
        }} />
      </div>
      <nav className="nav" aria-label="Workspaces">
        {sidebarWorkspaces.map((workspace, index) => {
          const href = `/workspaces/${workspace.id}`;
          const active = pathname === href || pathname.startsWith(`${href}/`) || (activeWorkspaceId === String(workspace.id) && pathname.startsWith("/workspaces/"));
          return (
            <Link key={workspace.id} href={href} className={`nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
              <WorkspaceIcon name={(["code", "book", "briefcase"] as const)[index % 3]} />
              <span>{workspace.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="account">
          <span className="avatar">{initials || "U"}</span>
          <span className="account-text"><strong>{account.full_name}</strong><small>{account.email}</small></span>
        </div>
        <button className="nav-item muted sign-out" disabled={signingOut} onClick={signOut} type="button">
          <Icon name="chevrons-up-down" size={14} /><span>{signingOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </aside>
  );
}
