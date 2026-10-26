"use client";

import { useState, type FormEvent } from "react";
import Icon from "./Icon";
import { apiRequest, type WorkspaceRecord } from "@/lib/api";

export default function WorkspaceCreateButton({ onCreated, compact = false }: {
  onCreated: (workspace: WorkspaceRecord) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setSubmitting(true);
    const data = new FormData(form);
    try {
      const workspace = await apiRequest<WorkspaceRecord>("/api/workspaces/", {
        method: "POST",
        body: JSON.stringify({ name: data.get("name") }),
      });
      onCreated(workspace);
      setOpen(false);
      form.reset();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create the workspace.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        aria-label={compact ? "Create workspace" : undefined}
        className={compact ? "workspace-add-btn" : "btn-primary"}
        onClick={() => { setError(""); setOpen(true); }}
        title={compact ? "Create workspace" : undefined}
        type="button"
      >
        <Icon name="plus" size={compact ? 15 : 14} />{!compact && " Create workspace"}
      </button>
      {open && (
        <div className="workspace-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !submitting) setOpen(false);
        }}>
          <section aria-labelledby="workspace-dialog-title" aria-modal="true" className="workspace-modal" role="dialog">
            <form onSubmit={submit}>
              <div className="workspace-modal-heading">
                <h2 id="workspace-dialog-title">Create Workspace</h2>
                <button aria-label="Close dialog" className="icon-btn" disabled={submitting} onClick={() => setOpen(false)} type="button">×</button>
              </div>
              <label className="workspace-form-field" htmlFor="workspace-title">
                <span>Title</span>
                <input autoFocus id="workspace-title" maxLength={200} name="name" required />
              </label>
              <p aria-live="polite" className="workspace-form-message">{error}</p>
              <div className="workspace-modal-actions">
                <button className="workspace-cancel" disabled={submitting} onClick={() => setOpen(false)} type="button">Cancel</button>
                <button className="btn-primary" disabled={submitting} type="submit">{submitting ? "Creating…" : "Create workspace"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
