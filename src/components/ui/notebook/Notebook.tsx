import * as React from "react";
import { cn } from "@/lib/utils";
import "./notebook.css";

/**
 * Notebook — React equivalent of Notebook.astro. Same CSS, same API.
 *
 * Use inside React components (e.g. interactive sections) that need the
 * notebook grid system. For Astro-only contexts, prefer Notebook.astro.
 */

type Lines = "both" | "vertical" | "horizontal" | "none";
type RowAnchor = "top" | "bottom";

type ColsProp =
  | number
  | { base?: number; md?: number; lg?: number };

export interface NotebookProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  lines?: Lines;
  rowH?: string;
  colWMax?: string;
  cols?: ColsProp;
  /** Override --nb-cell-gap (total separator width between neighboring
   *  cells; each cell gets half on each side). Pass "0" to disable for
   *  sections where cells should fill edge-to-edge. */
  cellGap?: string;
  rowAnchor?: RowAnchor;
  innerClassName?: string;
  innerStyle?: React.CSSProperties;
  /** Tag for the outer (full-bleed) container. Defaults to 'div'. */
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

function buildVarStyle({
  rowH,
  colWMax,
  cols,
  cellGap,
}: Pick<
  NotebookProps,
  "rowH" | "colWMax" | "cols" | "cellGap"
>): React.CSSProperties {
  const style: Record<string, string> = {};
  if (rowH) style["--nb-row-h"] = rowH;
  if (colWMax) style["--nb-col-w-max"] = colWMax;
  if (cellGap != null) style["--nb-cell-gap"] = cellGap;
  if (typeof cols === "number") {
    style["--nb-cols-base"] = String(cols);
    style["--nb-cols-md"] = String(cols);
    style["--nb-cols-lg"] = String(cols);
  } else if (cols && typeof cols === "object") {
    if (cols.base != null) style["--nb-cols-base"] = String(cols.base);
    if (cols.md != null) style["--nb-cols-md"] = String(cols.md);
    if (cols.lg != null) style["--nb-cols-lg"] = String(cols.lg);
  }
  return style as React.CSSProperties;
}

export const Notebook = React.forwardRef<HTMLElement, NotebookProps>(
  (
    {
      lines = "both",
      rowH,
      colWMax,
      cols,
      cellGap,
      rowAnchor = "top",
      className,
      innerClassName,
      innerStyle,
      style,
      as = "div",
      children,
      ...rest
    },
    ref,
  ) => {
    const Tag = as as any;
    const mergedStyle = {
      ...buildVarStyle({ rowH, colWMax, cols, cellGap }),
      ...style,
    };
    return (
      <Tag
        ref={ref}
        className={cn(
          "notebook",
          `notebook--lines-${lines}`,
          `notebook--anchor-${rowAnchor}`,
          className,
        )}
        style={mergedStyle}
        {...rest}
      >
        <div className={cn("notebook-inner", innerClassName)} style={innerStyle}>
          {children}
        </div>
      </Tag>
    );
  },
);
Notebook.displayName = "Notebook";
