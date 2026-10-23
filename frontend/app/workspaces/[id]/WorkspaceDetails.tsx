"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import NewTaskButton from "@/app/components/NewTaskButton";
import { apiRequest, getToken, type Account, type TaskRecord, type WorkspaceRecord } from "@/lib/api";

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
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

  const content = authRequired ? (
    <section className="dashboard-welcome"><h1>Sign in required</h1><p className="sub">Sign in to view your workspace tasks.</p><Link className="btn-primary" href="/login">Sign in</Link></section>
  ) : loading ? <p className="dashboard-state">Loading workspace…</p> : error ? <p aria-live="polite" className="dashboard-state error">{error}</p> : !workspace ? (
    <div className="dashboard-empty"><h2>Workspace not found</h2><Link className="open-link" href="/">Return to home</Link></div>
  ) : (
    <>
      <div className="hero workspace-hero">
        <div><p className="eyebrow"><Link href="/">Your workspaces</Link></p><h1>{workspace.name}</h1><p className="sub">{workspace.description || "Tasks for this workspace."}</p></div>
        <NewTaskButton workspaceId={id} onCreated={(task) => setTasks((current) => [...current, task].sort((a, b) => a.due_date.localeCompare(b.due_date)))} />
      </div>
      <div className="section-head"><h2>Tasks <span className="count">{tasks.length}</span></h2></div>
      {tasks.length ? (
        <div className="task-list">
          {tasks.map((task) => (
            <article className="task-list-item" key={task.id}>
              <div className="task-list-copy"><h3>{task.title}</h3><p>{task.description || "No description"}</p><small>Due {formatDueDate(task.due_date)}</small></div>
              <label className="task-status-label" htmlFor={`task-status-${task.id}`}>Status</label>
              <select aria-label={`Status for ${task.title}`} className="task-status-select" id={`task-status-${task.id}`} onChange={(event) => void updateStatus(task, event.target.value as TaskRecord["status"])} value={task.status}>
                <option value="pending">Pending</option><option value="in_progress">In progress</option><option value="done">Done</option>
              </select>
            </article>
          ))}
        </div>
      ) : <div className="dashboard-empty"><h3>No tasks in this workspace yet</h3><p>Tasks you add to this workspace will appear here.</p></div>}
      {error && <p aria-live="polite" className="dashboard-state error">{error}</p>}
    </>
  );

  return <div className={`shell ${profile ? "" : "shell-no-sidebar"}`}>{profile && <Sidebar profile={profile} workspaces={workspaces} />}<div className="main"><Topbar /><main className="content">{content}</main></div></div>;
}
