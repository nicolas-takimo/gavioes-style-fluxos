import React, { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";

export type CanvasHostTheme = {
  bg: { base: string; elevated: string };
  fill: { secondary: string; tertiary: string };
  stroke: { primary: string; secondary: string };
  accent: { primary: string };
  text: { primary: string; secondary: string; tertiary: string };
};

const LIGHT: CanvasHostTheme = {
  bg: { base: "#fafaf9", elevated: "#ffffff" },
  fill: { secondary: "#eef2ff", tertiary: "#f1f1ef" },
  stroke: { primary: "#c9c9c4", secondary: "#e4e4e0" },
  accent: { primary: "#4f46e5" },
  text: { primary: "#1c1c1a", secondary: "#55554f", tertiary: "#8a8a83" },
};

const DARK: CanvasHostTheme = {
  bg: { base: "#141414", elevated: "#1e1e1e" },
  fill: { secondary: "#1f2240", tertiary: "#2a2a2a" },
  stroke: { primary: "#4a4a4a", secondary: "#333333" },
  accent: { primary: "#8b85ff" },
  text: { primary: "#ededed", secondary: "#b0b0b0", tertiary: "#808080" },
};

const ThemeCtx = createContext<CanvasHostTheme>(LIGHT);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mq = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const [dark, setDark] = useState(mq?.matches ?? false);
  useEffect(() => {
    if (!mq) return;
    const h = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  const theme = dark ? DARK : LIGHT;
  useEffect(() => {
    document.body.style.background = theme.bg.base;
    document.body.style.color = theme.text.primary;
  }, [theme]);
  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
}

export const useHostTheme = () => useContext(ThemeCtx);

export function Stack({ gap = 8, children }: { gap?: number; children?: ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>;
}

export function Row({ gap = 8, align, wrap, children }: { gap?: number; align?: string; wrap?: boolean; children?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap, alignItems: align, flexWrap: wrap ? "wrap" : "nowrap" }}>
      {children}
    </div>
  );
}

export function H1({ children }: { children?: ReactNode }) {
  return <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>{children}</h1>;
}
export function H2({ children }: { children?: ReactNode }) {
  return <h2 style={{ fontSize: 20, fontWeight: 650, margin: 0 }}>{children}</h2>;
}
export function H3({ children }: { children?: ReactNode }) {
  return <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{children}</h3>;
}

export function Text({ tone, size, children }: { tone?: "secondary" | "primary"; size?: "small"; children?: ReactNode }) {
  const t = useHostTheme();
  return (
    <p style={{ margin: 0, fontSize: size === "small" ? 13 : 15, lineHeight: 1.55, color: tone === "secondary" ? t.text.secondary : t.text.primary }}>
      {children}
    </p>
  );
}

export function Divider() {
  const t = useHostTheme();
  return <hr style={{ border: 0, borderTop: `1px solid ${t.stroke.secondary}`, margin: 0, width: "100%" }} />;
}

export function Card({ children }: { children?: ReactNode }) {
  const t = useHostTheme();
  return (
    <div style={{ border: `1px solid ${t.stroke.secondary}`, borderRadius: 8, background: t.bg.elevated, overflow: "hidden" }}>
      {children}
    </div>
  );
}
export function CardHeader({ children }: { children?: ReactNode }) {
  const t = useHostTheme();
  return (
    <div style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14, borderBottom: `1px solid ${t.stroke.secondary}` }}>{children}</div>
  );
}
export function CardBody({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <div style={{ padding: 16, ...style }}>{children}</div>;
}

export function Table({ headers, rows, columnAlign }: { headers: string[]; rows: ReactNode[][]; columnAlign?: Array<"left" | "right" | "center"> }) {
  const t = useHostTheme();
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: columnAlign?.[i] ?? "left", padding: "10px 16px", color: t.text.secondary, fontWeight: 600, borderBottom: `1px solid ${t.stroke.secondary}`, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => (
                <td key={ci} style={{ textAlign: columnAlign?.[ci] ?? "left", padding: "10px 16px", borderBottom: ri === rows.length - 1 ? 0 : `1px solid ${t.stroke.secondary}`, verticalAlign: "top", fontWeight: ci === 0 ? 550 : 400 }}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Callout({ title, children }: { tone?: string; title?: string; children?: ReactNode }) {
  const t = useHostTheme();
  return (
    <div style={{ borderLeft: `3px solid ${t.accent.primary}`, background: t.fill.tertiary, borderRadius: 6, padding: "12px 16px" }}>
      {title && <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>}
      <div style={{ fontSize: 14, color: t.text.secondary, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

// ---- DAG layout (layered, top-down) ----
export type DAGLayoutEdge = {
  from: string;
  to: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isBackEdge: boolean;
};

export function computeDAGLayout(opts: {
  nodes: Array<{ id: string }>;
  edges: Array<{ from: string; to: string }>;
  direction?: "vertical";
  nodeWidth: number;
  nodeHeight: number;
  rankGap: number;
  nodeGap: number;
  padding: number;
}) {
  const { nodes, edges, nodeWidth: W, nodeHeight: H, rankGap, nodeGap, padding } = opts;
  const order = new Map(nodes.map((n, i) => [n.id, i]));
  const rank = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  const forward = edges.filter((e) => (order.get(e.from) ?? 0) < (order.get(e.to) ?? 0));
  // longest path ranking (nodes are given in topological order)
  for (const n of nodes) {
    for (const e of forward) {
      if (e.from === n.id) rank.set(e.to, Math.max(rank.get(e.to)!, rank.get(n.id)! + 1));
    }
  }
  const layers: string[][] = [];
  for (const n of nodes) {
    const r = rank.get(n.id)!;
    (layers[r] ||= []).push(n.id);
  }
  const maxCount = Math.max(...layers.map((l) => l.length));
  const width = padding * 2 + maxCount * W + (maxCount - 1) * nodeGap;
  const pos = new Map<string, { x: number; y: number }>();
  layers.forEach((layer, r) => {
    const lw = layer.length * W + (layer.length - 1) * nodeGap;
    const x0 = (width - lw) / 2;
    layer.forEach((id, i) => pos.set(id, { x: x0 + i * (W + nodeGap), y: padding + r * (H + rankGap) }));
  });
  const height = padding * 2 + layers.length * H + (layers.length - 1) * rankGap;
  return {
    width,
    height,
    nodes: nodes.map((n) => ({ id: n.id, ...pos.get(n.id)! })),
    edges: edges.map((e) => {
      const s = pos.get(e.from)!;
      const t = pos.get(e.to)!;
      const back = !forward.includes(e);
      return {
        from: e.from,
        to: e.to,
        sourceX: s.x + W / 2,
        sourceY: s.y + H,
        targetX: t.x + W / 2,
        targetY: t.y - 2,
        isBackEdge: back,
      } as DAGLayoutEdge;
    }),
  };
}
