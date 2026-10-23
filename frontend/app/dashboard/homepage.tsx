import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import StatsCard, { type StatItem } from "@/app/components/StatsCard";
import WorkspaceCard from "@/app/components/WorkspaceCard";
import { user, workspaces } from "@/lib/data";
import Icon from "@/app/components/Icon";

export const dynamic = "force-dynamic";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const totalCompleted = workspaces.reduce((sum, w) => sum + w.done, 0);
  const totalAllTasks = workspaces.reduce((sum, w) => sum + w.total, 0);
  const totalCompletionRate = totalAllTasks ? Math.round((totalCompleted / totalAllTasks) * 100) : 0;
  const openTasks = workspaces.reduce((sum, w) => sum + (w.total - w.done), 0);
  const dueToday = 2;

  const stats: StatItem[] = [
    {
      icon: "school",
      label: "Active workspaces",
      value: workspaces.length,
      note: "Separate spaces. Clear focus.",
    },
    {
      icon: "users",
      label: "Open tasks",
      value: openTasks,
      note: "Across all your workspaces",
    },
    {
      icon: "calendar",
      label: "Due today",
      value: dueToday,
      note: "Both in Website Development",
    },
    {
      icon: "check-circle",
      label: "Completed tasks",
      value: `${totalCompleted}/${totalAllTasks}`,
      note: `${totalCompletionRate}% completion rate`,
    },
  ];

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar />
        <main className="content">
          <div className="hero">
            <div>
              <p className="eyebrow">A little clarity for your day</p>
              <h1>
                {greeting()}, {user.firstName}.
              </h1>
              <p className="sub">Your ideas have a place. Pick a workspace and keep things moving.</p>
            </div>
            <button className="btn-primary">
              <Icon name="plus" size={14} /> Create workspace
            </button>
          </div>

          <StatsCard stats={stats} />

          <div className="section-head">
            <h2>
              Your workspaces <span className="count">{workspaces.length}</span>
            </h2>
            <button className="sort">Recently opened ▾</button>
          </div>

          <div className="grid">
            {workspaces.map((w) => (
              <WorkspaceCard key={w.id} workspace={w} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
