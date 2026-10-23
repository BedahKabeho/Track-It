"use client";

import { useEffect, useMemo, useState } from "react";
import "./admin.css";

type User = { id: number; name: string; email: string; role: "Admin" | "Member"; status: "Active" | "Pending" | "Suspended"; workspaces: number };
type Workspace = { id: number; name: string; owner: string; done: number; total: number };

const initialUsers: User[] = [
  { id: 1, name: "Alex Morgan", email: "alex@trackitz.app", role: "Admin", status: "Active", workspaces: 3 },
  { id: 2, name: "Priya Nair", email: "priya@trackitz.app", role: "Member", status: "Active", workspaces: 2 },
  { id: 3, name: "Daan de Vries", email: "daan@trackitz.app", role: "Member", status: "Pending", workspaces: 0 },
  { id: 4, name: "Sofia Reyes", email: "sofia@trackitz.app", role: "Member", status: "Suspended", workspaces: 1 },
  { id: 5, name: "Liam Okafor", email: "liam@trackitz.app", role: "Member", status: "Active", workspaces: 2 },
];

const initialWorkspaces: Workspace[] = [
  { id: 1, name: "Website Development", owner: "Alex Morgan", done: 3, total: 8 },
  { id: 2, name: "School Assignments", owner: "Priya Nair", done: 3, total: 6 },
  { id: 3, name: "Business Planning", owner: "Liam Okafor", done: 1, total: 5 },
];

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export default function AdminPage() {
  const [users, setUsers] = useState(initialUsers);
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [activity, setActivity] = useState<[string, string][]>([
    ["Priya Nair completed ‘Define sitemap’", "2 hours ago"],
    ["Daan de Vries was invited", "Yesterday"],
    ["Sofia Reyes was suspended", "Oct 21"],
  ]);
  const [tab, setTab] = useState<"users" | "workspaces">("users");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
  }, []);

  const filteredUsers = useMemo(() => users.filter((user) =>
    (filter === "All statuses" || user.status === filter) &&
    `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [users, query, filter]);
  const totalTasks = workspaces.reduce((sum, workspace) => sum + workspace.total, 0);
  const completedTasks = workspaces.reduce((sum, workspace) => sum + workspace.done, 0);
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  function log(message: string) {
    const entry: [string, string] = [message, "Just now"];
    setActivity((current) => [entry, ...current].slice(0, 6));
  }

  function inviteUser() {
    const email = window.prompt("Enter the email address to invite:")?.trim();
    if (!email || !email.includes("@")) return;
    const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    setUsers((current) => [...current, { id: Date.now(), name, email, role: "Member", status: "Pending", workspaces: 0 }]);
    log(`${email} was invited`);
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/dashboard"><span className="admin-brand-mark">✓</span><span>TrackItz</span></a>
        <nav className="admin-nav" aria-label="Main navigation">
          <a href="/dashboard" className="admin-nav-item">Home</a>
          <a href="/dashboard" className="admin-nav-item">Notifications <span className="admin-nav-badge">2</span></a>
          <p className="admin-nav-label">Administration</p>
          <a href="/admin" aria-current="page" className="admin-nav-item active">Admin overview</a>
          <a href="/admin" className="admin-nav-item">Users</a>
          <a href="/admin" className="admin-nav-item">Workspaces</a>
          <a href="/admin" className="admin-nav-item">Settings</a>
        </nav>
        <div className="admin-account"><span className="admin-avatar">AM</span><span><strong>Alex Morgan</strong><small>Administrator</small></span></div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar"><span>Home <span aria-hidden="true">/</span> <strong>Admin</strong></span><time>{today}</time></header>
        <main className="admin-content">
          <section className="admin-hero">
            <div><h1>Admin</h1><p>Manage people and workspaces across TrackItz.</p></div>
            <button className="admin-primary" onClick={inviteUser}>＋ Invite user</button>
          </section>

          <section className="admin-stats" aria-label="Platform summary">
            <div className="admin-stat"><strong>{users.length}</strong><span>Total users<small>Across all workspaces</small></span></div>
            <div className="admin-stat"><strong>{workspaces.length}</strong><span>Workspaces<small>Active and archived</small></span></div>
            <div className="admin-stat"><strong>{totalTasks - completedTasks}</strong><span>Open tasks<small>Across the platform</small></span></div>
            <div className="admin-stat"><strong>{users.filter((user) => user.status === "Pending").length}</strong><span>Pending invites<small>Waiting for a reply</small></span></div>
          </section>

          <div className="admin-layout">
            <section className="admin-panel">
              <div className="admin-tabs" role="tablist" aria-label="Admin data">
                <button role="tab" aria-selected={tab === "users"} className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Users</button>
                <button role="tab" aria-selected={tab === "workspaces"} className={tab === "workspaces" ? "active" : ""} onClick={() => setTab("workspaces")}>Workspaces</button>
              </div>
              {tab === "users" ? <>
                <div className="admin-toolbar">
                  <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users by name or email" aria-label="Search users" />
                  <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter users by status"><option>All statuses</option><option>Active</option><option>Pending</option><option>Suspended</option></select>
                </div>
                <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Workspaces</th><th>Actions</th></tr></thead><tbody>
                  {filteredUsers.map((user) => <tr key={user.id}>
                    <td><div className="admin-user"><span className="admin-avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td>
                    <td><span className={`admin-pill ${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td><span className={`admin-pill ${user.status.toLowerCase()}`}>{user.status}</span></td><td>{user.workspaces}</td>
                    <td className="admin-actions"><button onClick={() => { const role = user.role === "Admin" ? "Member" : "Admin"; setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role } : item)); log(`${user.name} is now ${user.role === "Admin" ? "a member" : "an admin"}`); }}>{user.role === "Admin" ? "Make member" : "Make admin"}</button><button className="danger" onClick={() => { const status = user.status === "Suspended" ? "Active" : "Suspended"; setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status } : item)); log(`${user.name} was ${status === "Active" ? "reactivated" : "suspended"}`); }}>{user.status === "Suspended" ? "Reactivate" : "Suspend"}</button></td>
                  </tr>)}
                </tbody></table></div>
                {filteredUsers.length === 0 && <p className="admin-empty">No users match your search. Try a different name or status.</p>}
                <footer className="admin-foot"><span>{filteredUsers.length} of {users.length} users</span><span>Choose an action to update a user</span></footer>
              </> : <>
                <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Workspace</th><th>Owner</th><th>Tasks</th><th>Progress</th><th>Actions</th></tr></thead><tbody>
                  {workspaces.map((workspace) => { const pct = workspace.total ? Math.round(workspace.done / workspace.total * 100) : 0; return <tr key={workspace.id}><td><strong>{workspace.name}</strong></td><td>{workspace.owner}</td><td>{workspace.done} of {workspace.total}</td><td><div className="admin-progress-label">{pct}%</div><div className="admin-progress"><span style={{ width: `${pct}%` }} /></div></td><td><button className="admin-link" onClick={() => log(`${workspace.name} was opened`)}>Open workspace</button><button className="admin-link danger" onClick={() => { if (window.confirm(`Delete “${workspace.name}”? This cannot be undone.`)) { setWorkspaces((current) => current.filter((item) => item.id !== workspace.id)); log(`${workspace.name} was deleted`); } }}>Delete</button></td></tr>; })}
                </tbody></table></div><footer className="admin-foot">{workspaces.length} workspaces</footer>
              </>}
            </section>

            <aside className="admin-aside">
              <section className="admin-side-card"><h2>Platform progress</h2><div className="admin-row"><span>Tasks complete</span><strong>{progress}%</strong></div><div className="admin-progress"><span style={{ width: `${progress}%` }} /></div><div className="admin-row"><span>Active users</span><strong>{users.filter((user) => user.status === "Active").length}</strong></div></section>
              <section className="admin-side-card"><h2>Recent activity</h2><ul className="admin-activity">{activity.map(([message, time], index) => <li key={`${message}-${index}`}>{message}<small>{time}</small></li>)}</ul></section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
