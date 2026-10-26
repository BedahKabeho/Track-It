"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { apiRequest, getToken, type Account, type NotificationRecord, type WorkspaceRecord } from "@/lib/api";

export default function Notifications() {
  const [profile, setProfile] = useState<Account | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    let active = true;
    if (!getToken()) {
      setAuthRequired(true);
      setLoading(false);
      return () => { active = false; };
    }
    Promise.all([
      apiRequest<{ user: Account }>("/api/auth/me/"),
      apiRequest<WorkspaceRecord[]>("/api/workspaces/"),
      apiRequest<NotificationRecord[]>("/api/notifications/"),
    ]).then(([me, workspaceList, notificationList]) => {
      if (!active) return;
      setProfile(me.user);
      setWorkspaces(workspaceList);
      setNotifications(notificationList);
    }).catch((loadError) => {
      if (active) {
        setError(loadError instanceof Error ? loadError.message : "Could not load notifications.");
        if (!getToken()) setAuthRequired(true);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function markRead(notification: NotificationRecord) {
    setError("");
    try {
      const updated = await apiRequest<NotificationRecord>(`/api/notifications/${notification.id}/read/`, { method: "PATCH", body: JSON.stringify({}) });
      setNotifications((current) => current.map((item) => item.id === notification.id ? updated : item));
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Could not update this notification.");
    }
  }

  const body = authRequired ? (
    <section className="dashboard-welcome"><h1>Sign in required</h1><p className="sub">Sign in to view your notifications.</p><Link className="btn-primary" href="/login">Sign in</Link></section>
  ) : loading ? <p className="dashboard-state">Loading notifications…</p> : error && !notifications.length ? <p aria-live="polite" className="dashboard-state error">{error}</p> : (
    <>
      <div className="hero"><div><p className="eyebrow">Stay up to date</p><h1 className="home-greeting">Notifications</h1><p className="sub">Reminders and updates for your tasks.</p></div></div>
      {notifications.length ? <div className="notification-list">
        {notifications.map((notification) => (
          <article className={`notification-item ${notification.read_at ? "read" : "unread"}`} key={notification.id}>
            <div><p>{notification.message}</p><small>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.created_at))}</small></div>
            {!notification.read_at && <button className="notification-read" onClick={() => void markRead(notification)} type="button">Mark as read</button>}
          </article>
        ))}
      </div> : <div className="dashboard-empty"><h3>You’re all caught up</h3><p>Task reminders will show up here.</p></div>}
      {error && <p aria-live="polite" className="dashboard-state error">{error}</p>}
    </>
  );

  return <div className={`shell ${profile ? "" : "shell-no-sidebar"}`}>{profile && <Sidebar profile={profile} workspaces={workspaces} />}<div className="main"><Topbar /><main className="content">{body}</main></div></div>;
}
