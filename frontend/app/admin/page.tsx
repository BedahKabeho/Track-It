"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, getToken, type Account } from "@/lib/api";
import { getAdminStats, getAdminTasks, getAdminUsers, setAdminUserRole, type AdminStats, type AdminTask, type AdminUser } from "@/lib/admin";
import ThemeToggle from "@/app/components/ThemeToggle";
import "./admin.css";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatLastLogin(value: string | null) {
  return value ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "Never";
}

const statusLabels: Record<AdminTask["status"], string> = {
  pending: "Pending",
  in_progress: "In progress",
  done: "Completed",
};

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Account | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [section, setSection] = useState<"users" | "tasks">("users");
  const [userQuery, setUserQuery] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleSavingUserId, setRoleSavingUserId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadAdmin() {
      if (!getToken()) {
        setError("Sign in with an administrator account to view this page.");
        setLoading(false);
        return;
      }
      try {
        const me = await apiRequest<{ user: Account }>("/api/auth/me/");
        if (!active) return;
        if (!me.user.is_admin) {
          router.replace("/dashboard");
          return;
        }
        setProfile(me.user);
        setAuthorized(true);
        const summary = await getAdminStats();
        if (active) setStats(summary);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load admin data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadAdmin();
    return () => { active = false; };
  }, [router]);

  async function changeUserRole(user: AdminUser) {
    setRoleSavingUserId(user.id);
    setError("");
    try {
      const { user: updatedUser } = await setAdminUserRole(
        user.id,
        user.is_admin ? "USER" : "ADMIN",
      );
      setUsers((current) => current.map((item) => item.id === user.id
        ? { ...item, ...updatedUser }
        : item));
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : "Could not update this user's role.");
    } finally {
      setRoleSavingUserId(null);
    }
  }

  useEffect(() => {
    if (!authorized || section !== "users") return;
    let active = true;
    const timer = window.setTimeout(() => {
      setUsersLoading(true);
      getAdminUsers(userQuery).then((data) => {
        if (active) setUsers(data);
      }).catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load users.");
      }).finally(() => {
        if (active) setUsersLoading(false);
      });
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [authorized, section, userQuery]);

  useEffect(() => {
    if (!authorized || section !== "tasks") return;
    let active = true;
    const timer = window.setTimeout(() => {
      setTasksLoading(true);
      getAdminTasks({ search: query, status }).then((data) => {
        if (active) setTasks(data);
      }).catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load tasks.");
      }).finally(() => {
        if (active) setTasksLoading(false);
      });
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [authorized, section, query, status]);

  const date = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  if (loading) return <main className="admin-state">Loading administrator dashboard...</main>;
  if (!authorized) return (
    <main className="admin-state">
      <h1>Admin access required</h1>
      <p>{error || "Sign in with an administrator account to continue."}</p>
      <Link className="admin-primary" href="/login">Go to sign in</Link>
    </main>
  );

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin"><span className="admin-brand-mark">✓</span><span>TrackItz</span></Link>
        <nav className="admin-nav" aria-label="Admin navigation">
          <p className="admin-nav-label">Administration</p>
          <Link href="/admin" aria-current="page" className="admin-nav-item active">Admin home</Link>
        </nav>
        <div className="admin-account"><span className="admin-avatar">{initials(profile?.full_name ?? "Admin")}</span><span><strong>{profile?.full_name}</strong><small>Administrator</small></span></div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar"><strong>Admin home</strong><div><time>{date}</time><ThemeToggle /></div></header>
        <main className="admin-content">
          <section className="admin-hero">
            <div><p className="admin-nav-label">Administration</p><h1>Admin home</h1><p>Manage platform users and review account activity.</p></div>
          </section>

          <section className="admin-stats" aria-label="Platform summary">
            <div className="admin-stat"><strong>{stats?.total_users ?? 0}</strong><span>Total users<small>Registered accounts</small></span></div>
            <div className="admin-stat"><strong>{stats?.total_workspaces ?? 0}</strong><span>Workspaces<small>Across the platform</small></span></div>
            <div className="admin-stat"><strong>{stats?.total_tasks ?? 0}</strong><span>Total tasks<small>Across all workspaces</small></span></div>
            <div className="admin-stat"><strong>{stats?.pending_tasks ?? 0}</strong><span>Pending tasks<small>Waiting to be started</small></span></div>
            <div className="admin-stat"><strong>{stats?.in_progress_tasks ?? 0}</strong><span>In progress<small>Currently being worked on</small></span></div>
            <div className="admin-stat"><strong>{stats?.completed_tasks ?? 0}</strong><span>Completed tasks<small>Marked as complete</small></span></div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading"><div><h2>Platform directory</h2><p>Account details, access, and activity at a glance.</p></div><span className="admin-task-total">{section === "users" ? `${users.length} users` : `${tasks.length} tasks`}</span></div>
            <div className="admin-tabs" role="tablist" aria-label="Admin sections">
              <button type="button" role="tab" aria-selected={section === "users"} className={section === "users" ? "active" : ""} onClick={() => setSection("users")}>Users</button>
              <button type="button" role="tab" aria-selected={section === "tasks"} className={section === "tasks" ? "active" : ""} onClick={() => setSection("tasks")}>Tasks</button>
            </div>
            <div className="admin-toolbar">
              {section === "users" ? (
                <input type="search" value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder="Search name or email" aria-label="Search users" />
              ) : (
                <>
                  <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search task, user, or workspace" aria-label="Search tasks, users, and workspaces" />
                  <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter tasks by status">
                    <option value="all">All statuses</option><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="done">Completed</option>
                  </select>
                </>
              )}
            </div>
            {error && <p aria-live="polite" className="admin-error">{error}</p>}
            {section === "users" ? (
              <>
                <div className="admin-table-scroll"><table className="admin-table admin-user-table">
                  <thead><tr><th>User</th><th>Access</th><th>Account</th><th>Workspaces</th><th>Tasks</th><th>Joined</th><th>Last active</th>{profile?.is_superuser && <th>Role management</th>}</tr></thead>
                  <tbody aria-busy={usersLoading}>
                    {users.map((user) => <tr key={user.id}>
                      <td><div className="admin-user"><span className="admin-avatar">{initials(user.full_name)}</span><span><strong>{user.full_name}</strong><small>{user.email || "No email provided"}</small></span></div></td>
                      <td><span className={`admin-pill ${user.is_admin ? "admin" : "member"}`}>{user.is_superuser ? "Superadmin" : user.is_admin ? "Administrator" : "Member"}</span></td>
                      <td><span className={`admin-pill ${user.is_active ? "active" : "suspended"}`}>{user.is_active ? "Active" : "Inactive"}</span></td>
                      <td>{user.workspace_count}</td><td>{user.task_count}</td><td>{formatDate(user.date_joined)}</td><td>{formatLastLogin(user.last_login)}</td>
                      {profile?.is_superuser && <td>{user.is_superuser ? "Managed in Django" : <button type="button" disabled={roleSavingUserId === user.id} onClick={() => void changeUserRole(user)}>{roleSavingUserId === user.id ? "Saving..." : user.is_admin ? "Demote to user" : "Promote to admin"}</button>}</td>}
                    </tr>)}
                  </tbody>
                </table></div>
                {usersLoading && users.length === 0 ? <p className="admin-empty">Loading users...</p> : !usersLoading && users.length === 0 ? <p className="admin-empty">No users match this search.</p> : null}
              </>
            ) : (
              <>
                <div className="admin-table-scroll"><table className="admin-table">
                  <thead><tr><th>Task</th><th>Created by</th><th>Workspace</th><th>Status</th><th>Due date</th></tr></thead>
                  <tbody aria-busy={tasksLoading}>
                    {tasks.map((task) => <tr key={task.id}>
                      <td className="admin-task-title"><strong>{task.title}</strong>{task.description && <small>{task.description}</small>}</td>
                      <td><div className="admin-user"><span className="admin-avatar">{initials(task.user_name)}</span><span><strong>{task.user_name}</strong><small>{task.user_email}</small></span></div></td>
                      <td>{task.workspace_name}</td>
                      <td><span className={`admin-pill ${task.status}`}>{statusLabels[task.status]}</span></td>
                      <td>{formatDate(task.due_date)}</td>
                    </tr>)}
                  </tbody>
                </table></div>
                {tasksLoading && tasks.length === 0 ? <p className="admin-empty">Loading tasks...</p> : !tasksLoading && tasks.length === 0 ? <p className="admin-empty">No tasks match these filters.</p> : null}
              </>
            )}
            <footer className="admin-foot">
              <span>{section === "users" ? `${users.length} users shown` : `${tasks.length} tasks shown`}</span>
              <span>{section === "users" ? `${stats?.total_users ?? 0} total accounts` : `${stats?.total_workspaces ?? 0} workspaces · ${stats?.in_progress_tasks ?? 0} in progress`}</span>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}
