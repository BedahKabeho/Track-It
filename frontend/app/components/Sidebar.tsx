import Link from "next/link";
import { user, workspaces } from "@/lib/data";
import Icon from "./Icon";
import WorkspaceIcon from "./workspace-icon";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Icon name="check-square" size={16} strokeWidth={2.25} />
        </span>
        <span className="brand-name">TrackItz</span>
      </div>

      <nav className="nav" aria-label="Main">
        <Link href="/" className="nav-item active" aria-current="page">
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
          <Link key={w.id} href={`/workspaces/${w.id}`} className="nav-item">
            <WorkspaceIcon name={w.icon} />
            <span>{w.name}</span>
          </Link>
        ))}
        <button className="nav-item muted">
          <Icon name="plus" />
          <span>New workspace</span>
        </button>
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
