import Link from "next/link";
import { user, workspaces } from "@/lib/data";
import Icon from "./Icon";
import WorkspaceIcon from "./workspace-icon";

export default function Sidebar({ activeWorkspaceId }: { activeWorkspaceId?: string } = {}) {
  return (
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="TrackItz home">
        <span className="brand-mark">
          <Icon name="check-square" size={16} strokeWidth={2.25} />
        </span>
        <span className="brand-name">TrackItz</span>
      </Link>

      <nav className="nav" aria-label="Main">
        <Link href="/" className={`nav-item ${activeWorkspaceId ? "" : "active"}`} aria-current={!activeWorkspaceId ? "page" : undefined}>
          <Icon name="home" />
          <span>Home</span>
        </Link>
        <Link href="/notifications" className="nav-item">
          <Icon name="bell" />
          <span>Notifications</span>
          <span className="nav-badge">{user.unreadNotifications}</span>
        </Link>
      </nav>

      <div className="nav-section">
        <span className="nav-section-label">Workspaces</span>
        <button className="icon-btn" aria-label="Create workspace">
          <Icon name="plus" size={14} />
        </button>
      </div>

      <nav className="nav" aria-label="Workspaces">
        {workspaces.map((w) => (
          <Link key={w.id} href={`/workspaces/${w.id}`} className={`nav-item ${activeWorkspaceId === w.id ? "active" : ""}`} aria-current={activeWorkspaceId === w.id ? "page" : undefined}>
            <WorkspaceIcon name={w.icon} />
            <span>{w.name}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <Link href="/help" className="nav-item">
          <Icon name="help" />
          <span>Help &amp; getting started</span>
        </Link>
        <button className="account">
          <span className="avatar">{user.initials}</span>
          <span className="account-text">
            <strong>{user.fullName}</strong>
            <small>{user.account}</small>
          </span>
          <Icon name="chevrons-up-down" size={14} />
        </button>
      </div>
    </aside>
  );
}
