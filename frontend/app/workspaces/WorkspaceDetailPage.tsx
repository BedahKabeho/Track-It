"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/app/components/Icon";
import Sidebar from "@/app/components/Sidebar";
import StatsCard, { type StatItem } from "@/app/components/StatsCard";
import StatusDropdown from "@/app/components/StatusDropdown";
import Topbar from "@/app/components/Topbar";
import WorkspaceIcon from "@/app/components/workspace-icon";
import { useWorkspaceTasks } from "@/app/WorkspaceTasksProvider";
import { workspaces, type WorkspaceTask } from "@/lib/data";

type TaskFilter = "all" | "today";

function localDateString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export default function WorkspaceDetailPage({ workspaceId }: { workspaceId: string }) {
  const workspace = workspaces.find((item) => item.id === workspaceId);
  const { tasks, setTasks } = useWorkspaceTasks(workspaceId);
  const [filter, setFilter] = useState<TaskFilter>("all");

  const today = localDateString();
  const counts = useMemo(() => {
    const done = tasks.filter((task) => task.status === "done").length;
    const inProgress = tasks.filter((task) => task.status === "prog").length;
    const todo = tasks.filter((task) => (task.status as string) === "todo").length;
    const dueToday = tasks.filter((task) => task.dueDate === today && task.status !== "done").length;
    return { total: tasks.length, done, inProgress, todo, dueToday };
  }, [tasks, today]);
  const progress = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;
  const visibleTasks = tasks
    .filter((task) => filter === "all" || (task.dueDate === today && task.status !== "done"))
    .slice()
    .sort((left, right) => Number(left.status === "done") - Number(right.status === "done") || left.dueDate.localeCompare(right.dueDate));

  if (!workspace) {
    return (
      <main className="workspace-not-found">
        <h1>Workspace not found</h1>
        <p>This workspace may have been removed.</p>
        <Link className="btn-primary" href="/">Return to dashboard</Link>
      </main>
    );
  }

  function updateTask(taskId: string, update: Partial<WorkspaceTask>) {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, ...update } : task));
  }

  const detailStats: StatItem[] = [
    {
      icon: "school",
      label: "Total tasks",
      value: counts.total,
      note: `${counts.inProgress} in progress`,
    },
    {
      icon: "users",
      label: "In progress",
      value: counts.inProgress,
      note: counts.total ? `${Math.round((counts.inProgress / counts.total) * 100)}% of total` : "No active tasks",
    },
    {
      icon: "calendar",
      label: "Due today",
      value: counts.dueToday,
      note: counts.dueToday === 0 ? "All caught up" : `${counts.dueToday} task${counts.dueToday > 1 ? "s" : ""} remaining`,
    },
    {
      icon: "check-circle",
      label: "Completed",
      value: counts.total > 0 ? `${counts.done}/${counts.total}` : 0,
      note: `${progress}% completion rate`,
    },
  ];

  return (
    <div className="shell">
      <Sidebar activeWorkspaceId={workspace.id} />
      <div className="main">
        <Topbar title={workspace.name} />
        <main className="content">
          <div className="workspace-detail-hero">
            <div>
              <Link className="back-link" href="/">← All workspaces</Link>
              <div className="workspace-detail-title">
                <span className={`tile tile-${workspace.icon}`}>
                  <WorkspaceIcon name={workspace.icon} size={20} />
                </span>
                <div>
                  <p className="eyebrow">Workspace</p>
                  <h1>{workspace.name}</h1>
                </div>
              </div>
              <p className="sub">{workspace.tagline}</p>
            </div>
          </div>

          <StatsCard stats={detailStats} />

          <div className="workspace-task-layout">
            <section className="workspace-task-section">
              <div className="workspace-tabs">
                <span>Tasks {counts.total}</span>
                <span className="workspace-tab-muted">Activity</span>
              </div>
              <div className="workspace-task-toolbar">
                <div className="workspace-segment" aria-label="Filter tasks">
                  <button type="button" className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>All tasks {counts.total}</button>
                  <button type="button" className={filter === "today" ? "selected" : ""} onClick={() => setFilter("today")}>Due today {counts.dueToday}</button>
                </div>
              </div>
              <div className="workspace-table-wrap">
                <table className="workspace-task-table">
                  <thead><tr><th scope="col">Task name</th><th scope="col">Status</th><th scope="col">Deadline</th><th scope="col">Reminder</th></tr></thead>
                  <tbody>
                    {visibleTasks.length === 0 ? (
                      <tr><td colSpan={4} className="workspace-empty-row">{filter === "today" ? "Nothing due today. Enjoy the breathing room." : "No tasks yet."}</td></tr>
                    ) : visibleTasks.map((task) => {
                      const dueToday = task.dueDate === today && task.status !== "done";
                      return (
                        <tr key={task.id} className={`${dueToday ? "due-today" : ""} ${task.status === "done" ? "task-complete" : ""}`}>
                          <td className="workspace-task-name">{task.title}</td>
                          <td>
                            <StatusDropdown
                              status={task.status}
                              onChange={(status) => updateTask(task.id, { status, reminder: status === "done" ? false : task.reminder })}
                              taskTitle={task.title}
                            />
                          </td>
                          <td className={dueToday ? "late" : "workspace-task-date"}>{dueToday ? "Today" : formatDate(task.dueDate)}{task.status !== "done" && task.dueTime ? `, ${task.dueTime}` : ""}</td>
                          <td>{task.status === "done" ? <span className="workspace-reminder-off">—</span> : <button type="button" className={`workspace-reminder ${task.reminder ? "enabled" : ""}`} onClick={() => updateTask(task.id, { reminder: !task.reminder })} aria-label={`${task.reminder ? "Turn off" : "Turn on"} reminder for ${task.title}`}>♧ {task.reminder ? "On" : "Off"}</button>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="workspace-task-footer"><span>{counts.total} tasks · {counts.done} completed · {counts.total - counts.done} remaining</span><span>Click a status to update it</span></div>
            </section>

            <aside className="workspace-progress-card">
              <h2>Workspace progress</h2>
              <div className="workspace-progress-ring">
                <svg width="76" height="76" viewBox="0 0 76 76" role="img" aria-label={`${progress}% complete`}>
                  <circle cx="38" cy="38" r="30" fill="none" stroke="var(--grey)" strokeWidth="6" />
                  <circle cx="38" cy="38" r="30" fill="none" stroke="var(--teal)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 30 * progress / 100} ${2 * Math.PI * 30}`} transform="rotate(-90 38 38)" />
                  <text x="38" y="42" textAnchor="middle" fontSize="15" fill="var(--ink)">{progress}%</text>
                </svg>
                <div><strong>{counts.done} of {counts.total}</strong><small>tasks complete{progress === 100 ? ". All done!" : ". Keep it going."}</small></div>
              </div>
              <div className="workspace-progress-legend"><span>Done</span><b>{counts.done}</b></div>
              <div className="workspace-progress-legend"><span>In progress</span><b>{counts.inProgress}</b></div>
              {counts.todo > 0 ? (
                <div className="workspace-progress-legend"><span>To do</span><b>{counts.todo}</b></div>
              ) : null}
              <Link className="workspace-dashboard-link" href="/">← Back to dashboard</Link>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
