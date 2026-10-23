"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import StatsCard, { type StatItem } from "@/app/components/StatsCard";
import WorkspaceCard from "@/app/components/WorkspaceCard";
import WorkspaceCreateButton from "@/app/components/WorkspaceCreateButton";
import { apiRequest, getToken, type Account, type TaskRecord, type WorkspaceRecord } from "@/lib/api";
import type { Workspace, WorkspaceIcon } from "@/lib/data";

export const dynamic = "force-dynamic";

const pad = (value: number) => String(value).padStart(2, "0");

function isDueToday(value: string) {
  const due = new Date(value);
  const today = new Date();
  return due.getFullYear() === today.getFullYear()
    && due.getMonth() === today.getMonth()
    && due.getDate() === today.getDate();
}

export default function HomePage() {
  const [profile, setProfile] = useState<Account | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const authenticated = Boolean(getToken());

  useEffect(() => {
    let active = true;
    if (!getToken()) {
      setLoading(false);
      return () => { active = false; };
    }

    Promise.all([
      apiRequest<{ user: Account }>("/api/auth/me/"),
      apiRequest<WorkspaceRecord[]>("/api/workspaces/"),
      apiRequest<TaskRecord[]>("/api/tasks/"),
    ]).then(([me, workspaceList, taskList]) => {
      if (!active) return;
      setProfile(me.user);
      setWorkspaces(workspaceList);
      setTasks(taskList);
    }).catch((loadError) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "Could not load your account data.");
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, []);

  const cards = useMemo<Workspace[]>(() => workspaces.map((workspace, index) => {
    const workspaceTasks = tasks.filter((task) => task.workspace === workspace.id);
    const done = workspaceTasks.filter((task) => task.status === "done").length;
    const dueToday = workspaceTasks.filter((task) => task.status !== "done" && isDueToday(task.due_date)).length;
    return {
      id: String(workspace.id),
      name: workspace.name,
      icon: (["code", "book", "briefcase"] as const)[index % 3] as WorkspaceIcon,
      tagline: workspace.description || "Keep related tasks organised in one place.",
      done,
      total: workspaceTasks.length,
      footer: dueToday
        ? { kind: "due", text: `${dueToday} ${dueToday === 1 ? "task" : "tasks"} due today` }
        : { kind: "quiet", text: workspaceTasks.length ? "No tasks due today" : "Ready for your first task" },
    };
  }), [workspaces, tasks]);

  const dueTodayCount = tasks.filter((task) => task.status !== "done" && isDueToday(task.due_date)).length;
  const openTasks = tasks.filter((task) => task.status !== "done").length;
  const stats = [
    { value: pad(workspaces.length), label: "Active workspaces", note: "Your task spaces" },
    { value: pad(openTasks), label: "Open tasks", note: "Across your workspaces" },
    { value: pad(dueTodayCount), label: "Due today", note: "Tasks that need attention" },
  ];

  return (
    <div className={`shell ${profile ? "" : "shell-no-sidebar"}`}>
      {profile && <Sidebar profile={profile} workspaces={workspaces} />}
      <div className="main">
        <Topbar />
        <main className="content">
          {profile ? (
            <>
              <div className="hero">
                <div>
                  <p className="eyebrow">A little clarity for your day</p>
                  <h1 className="home-greeting">Hello, {profile.full_name.trim().split(/\s+/)[0]}.</h1>
                  <p className="sub">Your ideas have a place. Pick a workspace and keep things moving.</p>
                </div>
                <WorkspaceCreateButton onCreated={(workspace) => setWorkspaces((current) => [...current, workspace].sort((a, b) => a.name.localeCompare(b.name)))} />
              </div>
              <StatsCard stats={stats} />
              <div className="section-head">
                <h2>Your workspaces <span className="count">{workspaces.length}</span></h2>
              </div>
              {loading ? <p className="dashboard-state">Loading your workspaces…</p> : error ? <p aria-live="polite" className="dashboard-state error">{error}</p> : cards.length ? (
                <div className="grid">{cards.map((workspace) => <WorkspaceCard key={workspace.id} workspace={workspace} />)}</div>
              ) : (
                <div className="dashboard-empty">
                  <h3>No workspaces yet</h3>
                  <p>Create a workspace to start organising your tasks.</p>
                </div>
              )}
            </>
          ) : (
            <section className="dashboard-welcome">
              <p className="eyebrow">A little clarity for your day</p>
              <h1>Welcome to Trackitz</h1>
              <p className="sub">Sign in to load your workspaces and tasks from your account.</p>
              {error && <p aria-live="polite" className="dashboard-state error">{error}</p>}
              {!loading && !authenticated && <div className="welcome-actions"><Link className="btn-primary" href="/login">Sign in</Link><Link className="welcome-signup" href="/signup">Create an account</Link></div>}
              {loading && <p className="dashboard-state">Loading your account…</p>}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
