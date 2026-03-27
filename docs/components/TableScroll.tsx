import type { ReactNode } from "react";

/** Wrap markdown tables for horizontal scroll and single-line cells. See `.docs-table-scroll` in styles.css. */
export default function TableScroll({ children }: { children: ReactNode }) {
  return <div className="docs-table-scroll">{children}</div>;
}
