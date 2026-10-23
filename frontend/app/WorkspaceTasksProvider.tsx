"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { workspaceTasks, type WorkspaceTask } from "@/lib/data";

const STORAGE_KEY = "track_it_workspace_tasks";

function normalizeTasksRecord(data: Record<string, WorkspaceTask[]>): Record<string, WorkspaceTask[]> {
  const normalized: Record<string, WorkspaceTask[]> = {};
  for (const [workspaceId, tasks] of Object.entries(data)) {
    if (Array.isArray(tasks)) {
      normalized[workspaceId] = tasks.map((t) => ({
        ...t,
        status: t.status === "done" ? "done" : "prog",
      }));
    }
  }
  return normalized;
}

function loadInitialTasks(): Record<string, WorkspaceTask[]> {
  if (typeof window === "undefined") {
    return workspaceTasks;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return normalizeTasksRecord({ ...workspaceTasks, ...parsed });
      }
    }
  } catch (err) {
    console.error("Failed to load tasks from localStorage:", err);
  }
  return normalizeTasksRecord(workspaceTasks);
}

let currentTasks: Record<string, WorkspaceTask[]> = normalizeTasksRecord(workspaceTasks);
if (typeof window !== "undefined") {
  currentTasks = loadInitialTasks();
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return currentTasks;
}

function getServerSnapshot() {
  return workspaceTasks;
}

function saveTasks(updated: Record<string, WorkspaceTask[]>) {
  currentTasks = normalizeTasksRecord(updated);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTasks));
    } catch (err) {
      console.error("Failed to save tasks to localStorage:", err);
    }
  }
  listeners.forEach((listener) => listener());
}

type WorkspaceTaskState = {
  tasksByWorkspace: Record<string, WorkspaceTask[]>;
  setTasksForWorkspace: Dispatch<SetStateAction<Record<string, WorkspaceTask[]>>>;
};

const WorkspaceTasksContext = createContext<WorkspaceTaskState | null>(null);

export function WorkspaceTasksProvider({ children }: { children: ReactNode }) {
  const tasksByWorkspace = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTasksForWorkspace: Dispatch<SetStateAction<Record<string, WorkspaceTask[]>>> = useCallback(
    (action) => {
      const nextTasks = typeof action === "function" ? action(currentTasks) : action;
      saveTasks(nextTasks);
    },
    []
  );

  return (
    <WorkspaceTasksContext.Provider value={{ tasksByWorkspace, setTasksForWorkspace }}>
      {children}
    </WorkspaceTasksContext.Provider>
  );
}

export function useWorkspaceTasks(workspaceId: string) {
  const context = useContext(WorkspaceTasksContext);
  if (!context) throw new Error("useWorkspaceTasks must be used inside WorkspaceTasksProvider");

  const tasks = context.tasksByWorkspace[workspaceId] ?? [];
  const setTasks: Dispatch<SetStateAction<WorkspaceTask[]>> = (update) => {
    context.setTasksForWorkspace((current) => ({
      ...current,
      [workspaceId]: typeof update === "function" ? update(current[workspaceId] ?? []) : update,
    }));
  };

  return { tasks, setTasks };
}
