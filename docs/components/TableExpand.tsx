import { useState, type ReactNode } from "react";

/**
 * Wraps a markdown table in a collapsible container.
 * Shows a preview (first few rows) with a toggle to expand/collapse.
 */
export default function TableExpand({
  children,
  title = "View table",
  defaultOpen = false,
}: {
  children: ReactNode;
  title?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="docs-table-expand">
      <button
        type="button"
        className="docs-table-expand-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="docs-table-expand-icon">{open ? "▾" : "▸"}</span>
        <span>{title}</span>
      </button>
      {open && <div className="docs-table-expand-content">{children}</div>}
    </div>
  );
}
