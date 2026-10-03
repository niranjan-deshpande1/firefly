"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dayLabel, type DayCount } from "@/lib/evidence/timeline";

// Flat bars in content tokens; blue stays reserved for links and focus. No animation (manual 10).
const TICK = { fill: "var(--semantic-color-content-secondary)" };
const LINE = "var(--semantic-color-border-default)";

/** Visual only; the text list after it carries the same data in DOM order (manual 13.4). */
export function CommitChart({ days }: { days: DayCount[] }) {
  return (
    <div aria-hidden="true" className="type-label h-48 w-full tablet:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={days} margin={{ top: 8, right: 0, bottom: 0, left: -24 }}>
          <CartesianGrid vertical={false} stroke={LINE} />
          <XAxis dataKey="day" tickFormatter={dayLabel} tick={TICK} stroke={LINE} tickLine={false} minTickGap={24} />
          <YAxis allowDecimals={false} tick={TICK} stroke={LINE} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            cursor={{ fill: "var(--semantic-color-surface-raised-2)" }}
            isAnimationActive={false}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <p className="type-label rounded-control bg-raised-2 px-3 py-2">
                  {dayLabel(String(label))}: {String(payload[0].value)}
                </p>
              ) : null
            }
          />
          <Bar dataKey="count" fill="var(--semantic-color-content-primary)" isAnimationActive={false} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
