"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import type { WorkspaceTaskStatus } from "@/lib/data";

interface StatusDropdownProps {
  status: WorkspaceTaskStatus;
  onChange: (status: WorkspaceTaskStatus) => void;
  taskTitle: string;
}

const STATUS_CONFIG: Record<WorkspaceTaskStatus, { label: string; className: string }> = {
  prog: { label: "In progress", className: "prog" },
  done: { label: "Done", className: "done" },
};

const OPTIONS: { value: WorkspaceTaskStatus; label: string }[] = [
  { value: "prog", label: "In progress" },
  { value: "done", label: "Done" },
];

export default function StatusDropdown({ status, onChange, taskTitle }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.prog;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleSelect(newStatus: WorkspaceTaskStatus) {
    if (newStatus !== status) {
      onChange(newStatus);
    }
    setIsOpen(false);
  }

  return (
    <div className="status-dropdown-container" ref={containerRef}>
      <button
        type="button"
        className={`status-dropdown-btn ${currentConfig.className} ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Status for ${taskTitle}: ${currentConfig.label}`}
      >
        <span>{currentConfig.label}</span>
        <span className={`status-dropdown-chevron ${isOpen ? "open" : ""}`}>
          <Icon name="chevron-down" size={11} strokeWidth={2.2} />
        </span>
      </button>

      {isOpen && (
        <div className="status-dropdown-menu" role="listbox" aria-label={`Select status for ${taskTitle}`}>
          {OPTIONS.map((option) => {
            const isSelected = option.value === status;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`status-dropdown-item ${isSelected ? `selected ${option.value}` : ""}`}
                onClick={() => handleSelect(option.value)}
              >
                <div className="status-dropdown-item-left">
                  <span className={`status-dot ${option.value}`} />
                  <span>{option.label}</span>
                </div>
                {isSelected && (
                  <span className="status-check-icon">
                    <Icon name="check" size={12} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
