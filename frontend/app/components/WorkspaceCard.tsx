"use client";

import Link from "next/link";
import type { Workspace } from "@/lib/data";
import { useWorkspaceTasks } from "@/app/WorkspaceTasksProvider";
import Icon from "./Icon";
import WorkspaceIcon from "./workspace-icon";

export default function WorkspaceCard({ workspace: w }: { workspace: Workspace }) {
  const { tasks } = useWorkspaceTasks(w.id);
  const done = tasks.filter((task) => task.status === "done").length;
  const total = tasks.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <article className="card">
      <div className="card-head">
        <span className={`tile tile-${w.icon}`}>
          <WorkspaceIcon name={w.icon} size={18} />
        </span>
        <button className="icon-btn" aria-label={`More options for ${w.name}`}>
          <Icon name="more" size={16} />
        </button>
      </div>

      <h3 className="card-title"><Link className="card-title-link" href={`/workspaces/${w.id}`}>{w.name}</Link></h3>
      <p className="card-tagline">{w.tagline}</p>

      <div className="progress-row">
        <span>
          {done} of {total} tasks complete
        </span>
        <strong>{percent}%</strong>
      </div>
      <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${percent}%` }} />
      </div>

      <div className="card-foot">
        <span className={`foot-note ${w.footer.kind}`}>
          <Icon name="calendar" size={12} />
          {w.footer.text}
        </span>
        <Link href={`/workspaces/${w.id}`} className="open-link">
          Open workspace <Icon name="arrow-up-right" size={12} />
        </Link>
      </div>
    </article>
  );
}
