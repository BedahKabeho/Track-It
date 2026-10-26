"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import StatsCard from "@/app/components/StatsCard";
import NewTaskButton from "@/app/components/NewTaskButton";
import { apiRequest, getToken, type Account, type TaskRecord, type WorkspaceRecord } from "@/lib/api";

type TaskFilter = "all" | "today";

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDueToday(value: string) {
  return localDateKey(new Date(value)) === localDateKey(new Date());
}

function formatDueDate(value: string) {
  const due = new Date(value);
  const date = isDueToday(value)
    ? "Today"
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(due);
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(due);
  return `${date}, ${time}`;
}

export default function WorkspaceDetails() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Account | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceRecord | null>(null);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authRequired, setAuthRequired] = useState(false);
  const [filter, setFilter] = useState<TaskFilter>("all");

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
      apiRequest<TaskRecord[]>(`/api/tasks/?workspace=${encodeURIComponent(id)}`),
    ]).then(([me, workspaceList, taskList]) => {
      if (!active) return;
      setProfile(me.user);
      setWorkspaces(workspaceList);
      setWorkspace(workspaceList.find((item) => String(item.id) === id) ?? null);
      setTasks(taskList);
    }).catch((loadError) => {
      if (active) {
        setError(loadError instanceof Error ? loadError.message : "Could not load this workspace.");
        if (!getToken()) setAuthRequired(true);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  async function updateStatus(task: TaskRecord, status: TaskRecord["status"]) {
    setError("");
    try {
      const updated = await apiRequest<TaskRecord>(`/api/tasks/${task.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update the task.");
    }
  }

  const completed = tasks.filter((task) => task.status === "done").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const dueToday = tasks.filter((task) => task.status !== "done" && isDueToday(task.due_date)).length;
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const visibleTasks = useMemo(() => tasks
    .filter((task) => filter === "all" || (task.status !== "done" && isDueToday(task.due_date)))
    .slice()
    .sort((left, right) => Number(left.status === "done") - Number(right.status === "done") || left.due_date.localeCompare(right.due_date)), [tasks, filter]);

  const content = authRequired ? (
    <section className="dashboard-welcome"><h1>Sign in required</h1><p className="sub">Sign in to view your workspace tasks.</p><Link className="btn-primary" href="/login">Sign in</Link></section>
  ) : loading ? <p className="dashboard-state">Loading workspace…</p> : error && !workspace ? <p aria-live="polite" className="dashboard-state error">{error}</p> : !workspace ? (
    <div className="dashboard-empty"><h2>Workspace not found</h2><Link className="open-link" href="/">Return to home</Link></div>
  ) : (
    <>
      <div className="workspace-detail-hero">
        <div>
          <p className="eyebrow"><Link href="/">Your workspaces</Link></p>
          <h1 className="workspace-page-title">{workspace.name}</h1>
          <p className="sub">{workspace.description || "Build and track the work in this workspace."}</p>
        </div>
        <NewTaskButton workspaceId={id} onCreated={(task) => setTasks((current) => [...current, task].sort((a, b) => a.due_date.localeCompare(b.due_date)))} />
      </div>

      <StatsCard className="workspace-detail-stats" stats={[
        { icon: "layers", label: "Total tasks", value: tasks.length, note: "In this workspace" },
        { icon: "clock", label: "In progress", value: inProgress, note: "Tasks being worked on" },
        { icon: "calendar", label: "Due today", value: dueToday, note: "Tasks needing attention" },
        { icon: "check-circle", label: "Completed", value: `${completed}/${tasks.length}`, note: `${completion}% completion rate` },
      ]} />

      <div className="workspace-task-layout">
        <section className="workspace-task-section">
          <div className="workspace-tabs"><span>Tasks <small>{tasks.length}</small></span></div>
          <div className="workspace-task-toolbar">
            <div aria-label="Filter tasks" className="workspace-segment">
              <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")} type="button">All tasks {tasks.length}</button>
              <button className={filter === "today" ? "selected" : ""} onClick={() => setFilter("today")} type="button">Due today {dueToday}</button>
            </div>
          </div>
          <div className="workspace-table-wrap">
            <table className="workspace-task-table">
              <thead><tr><th scope="col">Task name</th><th scope="col">Status</th><th scope="col">Deadline</th></tr></thead>
              <tbody>
                {visibleTasks.length === 0 ? (
                  <tr><td className="workspace-empty-row" colSpan={3}>{filter === "today" ? "No tasks due today." : "No tasks in this workspace yet. Add your first task."}</td></tr>
                ) : visibleTasks.map((task) => (
                  <tr className={`${isDueToday(task.due_date) && task.status !== "done" ? "due-today" : ""} ${task.status === "done" ? "task-complete" : ""}`} key={task.id}>
                    <td className="workspace-task-name-cell"><span className="workspace-task-name">{task.title}</span>{task.description && <small>{task.description}</small>}</td>
                    <td><select aria-label={`Status for ${task.title}`} className={`api-task-status status-${task.status}`} onChange={(event) => void updateStatus(task, event.target.value as TaskRecord["status"])} value={task.status}>
                      <option value="pending">To do</option><option value="in_progress">In progress</option><option value="done">Done</option>
                    </select></td>
                    <td className="workspace-task-date">{formatDueDate(task.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="workspace-task-footer"><span>Showing {visibleTasks.length} of {tasks.length} tasks</span><span>Sorted by deadline</span></div>
        </section>

        <aside className="workspace-progress-card">
          <h2>Workspace progress</h2>
          <div className="workspace-progress-ring">
            <svg aria-label={`${completion}% complete`} height="54" role="img" viewBox="0 0 48 48" width="54">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#e7eceb" strokeWidth="5" />
              <circle className="workspace-progress-ring-value" cx="24" cy="24" r="20" fill="none" stroke="var(--teal)" strokeDasharray={`${(completion / 100) * 125.66} 125.66`} strokeLinecap="round" strokeWidth="5" transform="rotate(-90 24 24)" />
            </svg>
            <div><strong>{completed} of {tasks.length}</strong><small>tasks complete</small></div>
          </div>
          <div className="workspace-progress-legend"><span>To do</span><b>{tasks.filter((task) => task.status === "pending").length}</b></div>
          <div className="workspace-progress-legend"><span>In progress</span><b>{inProgress}</b></div>
          <div className="workspace-progress-legend"><span>Completed</span><b>{completed}</b></div>
          <Link className="workspace-dashboard-link" href="/">← Back to dashboard</Link>
        </aside>
      </div>
      {error && <p aria-live="polite" className="dashboard-state error">{error}</p>}
    </>
  );

  return <div className={`shell ${profile ? "" : "shell-no-sidebar"}`}>{profile && <Sidebar profile={profile} workspaces={workspaces} />}<div className="main"><Topbar title={workspace?.name ?? "Workspace"} /><main className="content">{content}</main></div></div>;
}
