import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import StatsCard from "@/app/components/StatsCard";
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

const pad = (n: number) => String(n).padStart(2, "0");

export default function HomePage() {
  const openTasks = workspaces.reduce((sum, w) => sum + (w.total - w.done), 0);

  const stats = [
    { value: pad(workspaces.length), label: "Active workspaces", note: "Separate spaces. Clear focus." },
    { value: pad(openTasks), label: "Open tasks", note: "Across all your workspaces" },
    { value: "02", label: "Due today", note: "Both in Website Development" },
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
