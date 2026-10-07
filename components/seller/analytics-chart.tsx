"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function AnalyticsChart({ data }: { data: { date: string; earnings: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #D9DCE5" }}
          formatter={(v: number) => `$${v.toFixed(2)}`}
        />
        <Line type="monotone" dataKey="earnings" stroke="#1F2F6E" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
