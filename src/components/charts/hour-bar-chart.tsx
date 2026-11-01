"use client";
// Generic bar chart with one bar per hour. Knows nothing about prices or CO2: it gets numbers
// and finished labels, so the same chart is used for both (docs/architecture.md).
// Labels are formatted on the server, because functions cannot be passed to a Client Component.

import { cn } from "cn";
import { useFormatter } from "next-intl";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";

export interface HourBar {
  /** Unique per bar, e.g. the ISO start time (a 25-hour day has two "02" hours). */
  key: string;
  /** Short label on the x axis, e.g. "17". */
  label: string;
  /** Longer label for the tooltip and table, e.g. "kl. 17-18". */
  rangeLabel: string;
  value: number;
  /** The value with unit, e.g. "1,16 kr./kWh". */
  valueLabel: string;
  /** Drawn in the accent colour, e.g. one of the cheapest hours. */
  highlighted?: boolean;
  /** The hour we are in now; gets an outline. */
  current?: boolean;
  /** Drawn faded, e.g. a forecast. */
  muted?: boolean;
}

interface HourBarChartProps {
  bars: HourBar[];
  /** What the chart shows. Used as caption for the screen reader table. */
  title: string;
  hourHeading: string;
  valueHeading: string;
}

const chartConfig = {
  value: { color: "var(--chart-2)" },
} satisfies ChartConfig;

export function HourBarChart({
  bars,
  title,
  hourHeading,
  valueHeading,
}: HourBarChartProps) {
  const format = useFormatter();
  return (
    <figure>
      {/* The chart is for sighted users; screen readers get the same data as a table below. */}
      <ChartContainer
        config={chartConfig}
        aria-hidden
        className="aspect-video w-full md:aspect-[3/1]"
      >
        <BarChart data={bars} margin={{ left: 0, right: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            // Recharts skips labels that would overlap, so narrow screens show fewer hours.
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width="auto"
            // "1,1" in Danish, "1.1" in English: numbers follow the chosen language.
            tickFormatter={(value: number) => format.number(value)}
          />
          <ChartTooltip
            cursor={false}
            content={({ active, payload }) => {
              const bar = payload?.[0]?.payload as HourBar | undefined;
              if (!active || !bar) return null;
              return (
                <div className="rounded-lg border bg-background px-3 py-2 text-footnote shadow-sm">
                  <div className="text-muted-foreground">{bar.rangeLabel}</div>
                  <div className="font-medium tabular-nums">
                    {bar.valueLabel}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={4} isAnimationActive={false}>
            {bars.map((bar) => (
              <Cell
                key={bar.key}
                fill={
                  bar.highlighted
                    ? "var(--color-highlight)"
                    : "var(--color-value)"
                }
                fillOpacity={bar.muted ? 0.45 : 1}
                stroke={bar.current ? "var(--color-foreground)" : undefined}
                strokeWidth={bar.current ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{hourHeading}</th>
            <th scope="col">{valueHeading}</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((bar) => (
            <tr key={bar.key} className={cn(bar.current && "font-medium")}>
              <td>{bar.rangeLabel}</td>
              <td>{bar.valueLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
