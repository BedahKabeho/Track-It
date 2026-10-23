"use client";

import { useEffect, useState, type FormEvent } from "react";
import Icon from "./Icon";
import { apiRequest, type TaskRecord } from "@/lib/api";

function todayValue() {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
}

export default function NewTaskButton({ workspaceId, onCreated }: {
  workspaceId: string;
  onCreated: (task: TaskRecord) => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, submitting]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setError("");
    const data = new FormData(form);
    const dueDate = String(data.get("due_date") ?? "");
    const workspace = Number(workspaceId);

    if (!dueDate || dueDate < todayValue()) {
      setError("Due date cannot be in the past.");
      setSubmitting(false);
      return;
    }

    if (!Number.isInteger(workspace) || workspace < 1) {
      setError("This workspace has an invalid ID. Return to your workspace list and try again.");
      setSubmitting(false);
      return;
    }

    try {
      const task = await apiRequest<TaskRecord>("/api/tasks/", {
        method: "POST",
        body: JSON.stringify({
          workspace,
          title: String(data.get("title")).trim(),
          description: String(data.get("description") ?? "").trim(),
          due_date: new Date(`${dueDate}T23:59:00`).toISOString(),
        }),
      });
      onCreated(task);
      form.reset();
      setOpen(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create the task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button className="btn-primary new-task-trigger" onClick={() => { setError(""); setOpen(true); }} type="button">
        <Icon name="plus" size={14} /> Add task
      </button>
      {open && (
        <div className="new-task-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !submitting) setOpen(false);
        }}>
          <section aria-labelledby="new-task-title" aria-modal="true" className="new-task-dialog" role="dialog">
            <form onSubmit={submit}>
              <div className="new-task-dialog-heading">
                <h2 id="new-task-title">Create New Task</h2>
                <button aria-label="Close dialog" className="icon-btn new-task-close" disabled={submitting} onClick={() => setOpen(false)} type="button">×</button>
              </div>
              <label className="new-task-title-field" htmlFor="new-task-name">
                <span className="visually-hidden">Task title</span>
                <input autoFocus id="new-task-name" maxLength={200} name="title" required />
              </label>
              <label className="new-task-description-field" htmlFor="new-task-description">
                <span>Description</span>
                <textarea id="new-task-description" name="description" rows={5} />
              </label>
              <label className="new-task-due-field" htmlFor="new-task-due-date">
                <span>Due Date</span>
                <input id="new-task-due-date" min={todayValue()} name="due_date" required type="date" />
              </label>
              <p aria-live="polite" className="new-task-error">{error}</p>
              <div className="new-task-actions">
                <button className="new-task-cancel" disabled={submitting} onClick={() => setOpen(false)} type="button">Cancel</button>
                <button className="new-task-submit" disabled={submitting} type="submit">{submitting ? "Creating…" : "Create New Task"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
