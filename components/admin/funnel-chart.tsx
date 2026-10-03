"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { FunnelRow } from "@/lib/admin/funnel";

const ROW_HEIGHT = 40;
const LABEL_WIDTH = 150;

/**
 * Flat horizontal bars, one per funnel step, value printed at the bar end. No animation, no
 * tooltip: the same numbers are in the figures above, so the chart is hidden from screen readers.
 */
export function FunnelChart({ rows }: { rows: FunnelRow[] }) {
  return (
    <div aria-hidden="true" className="type-label w-full">
      <ResponsiveContainer width="100%" height={rows.length * ROW_HEIGHT + 16}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap={8}>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis
            type="category"
            dataKey="label"
            width={LABEL_WIDTH}
            tickLine={false}
            axisLine={{ stroke: "var(--color-line)" }}
            tick={{ fill: "var(--color-secondary)" }}
          />
          <Bar dataKey="value" fill="var(--color-primary)" radius={0} isAnimationActive={false}>
            <LabelList dataKey="value" position="right" fill="var(--color-primary)" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
