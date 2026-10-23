"use client";

import Link from "next/link";
import Icon from "@/app/components/Icon";

const tasks = [
  ["Agree on brand direction", "Oct 17", "In progress"],
  ["Gather page content", "Oct 18", "In progress"],
  ["Build API", "Today, 5:00 PM", "In progress"],
  ["Review accessibility", "Today, 6:00 PM", "In progress"],
  ["Responsive navigation", "Oct 26, 5:00 PM", "In progress"],
  ["Connect contact form", "Oct 27, 5:00 PM", "Done"],
  ["Define sitemap", "Oct 19", "Done"],
  ["Create wireframes", "Oct 20", "Done"],
  ["Create design system", "Oct 20", "Done"],
];

function CheckMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" /></svg>;
}

function LandingPreview() {
  return (
    <div className="landing-preview" aria-label="Preview of a TrackIt task workspace">
      <aside className="landing-preview-sidebar">
        <span className="landing-preview-check"><CheckMark /></span>
        <span className="selected"><Icon name="check-square" size={14} /> Tasks</span>
        <span><Icon name="layers" size={14} /> Workspaces</span>
        <span><Icon name="calendar" size={14} /> Calendar</span>
        <span><Icon name="check-circle" size={14} /> Reports</span>
        <span><Icon name="help" size={14} /> Settings</span>
      </aside>
      <div className="landing-preview-main">
        <div className="landing-preview-title"><h2>Tasks</h2><small>Workspace preview</small></div>
        <div className="landing-preview-tabs"><span>All tasks (13)</span><span>Due today (2)</span></div>
        <div className="landing-preview-table-wrap">
          <table className="landing-preview-table">
            <thead><tr><th>Task name</th><th>Status</th><th>Deadline</th><th>Reminder</th></tr></thead>
            <tbody>{tasks.map(([name, deadline, status]) => <tr key={name}>
              <td>{name}</td>
              <td><span className={`landing-task-status ${status === "Done" ? "done" : "progress"}`}>{status}</span></td>
              <td className={deadline.startsWith("Today") ? "today" : ""}>{deadline}</td>
              <td className={status === "Done" ? "" : "reminder"}>{status === "Done" ? "—" : "● On"}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="landing-preview-add"><span>Add a task to this workspace</span><span>23/10/2026　▣</span><b>Add task</b></div>
      </div>
      <aside className="landing-preview-progress">
        <h3>Workspace progress</h3>
        <div className="landing-progress-summary"><span className="landing-progress-ring">54%</span><p><b>7 of 13</b><br />tasks complete. Keep it going.</p></div>
        <div><span>Done</span><b>7</b></div>
        <div><span>In progress</span><b>1</b></div>
        <div><span>To do</span><b>5</b></div>
        <p className="landing-preview-back">← Back to dashboard</p>
      </aside>
    </div>
  );
}

const benefits = [
  { icon: "bolt", title: "Stay organised", copy: "Keep track of your tasks and never miss a deadline." },
  { icon: "team", title: "Work together", copy: "Collaborate with your team across shared workspaces." },
  { icon: "shield", title: "Get things done", copy: "Stay focused with clear progress and reminders." },
  { icon: "chart", title: "Track your progress", copy: "See what's done, what's in progress and what's next." },
];

function BenefitIcon({ name }: { name: string }) {
  if (name === "bolt") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 2 4.8 13h5.7L9.7 22 19.2 10h-5.8L13.2 2Z" /></svg>;
  if (name === "team") return <Icon name="users" size={25} />;
  if (name === "shield") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V12h4v8M10 20V7h4v13M16 20V3h4v17M2 20h20" /></svg>;
}

export default function LandingPage() {
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Africa/Dar_es_Salaam",
  }).format(new Date());

  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="landing-brand" href="/" aria-label="TrackIt home"><span className="landing-brand-mark"><CheckMark /></span><span>Track<span>It</span></span></Link>
        <div className="landing-header-meta"><Link href="/login" className="landing-header-bell" aria-label="Sign in to view notifications"><Icon name="bell" size={20} /></Link><time>{date}</time></div>
      </header>
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">A little clarity for your day</p>
          <h1>Welcome to <span>TrackIt</span></h1>
          <p className="landing-description">Sign in to load your workspaces and tasks from your account.</p>
          <div className="landing-actions"><Link className="landing-button primary" href="/login">Sign in</Link><Link className="landing-button secondary" href="/signup"><Icon name="plus" size={21} />Create an account</Link></div>
        </div>
        <LandingPreview />
      </section>
      <section className="landing-benefits" aria-label="TrackIt benefits">{benefits.map((benefit) => <article className="landing-benefit" key={benefit.title}><span className="landing-benefit-icon"><BenefitIcon name={benefit.icon} /></span><div><h2>{benefit.title}</h2><p>{benefit.copy}</p></div></article>)}</section>
    </main>
  );
}
