"use client";
// Generic bar chart with one bar per hour. Knows nothing about prices or CO2: it gets numbers
// and finished labels, so the same chart is used for both (docs/architecture.md).
// Labels are formatted on the server, because functions cannot be passed to a Client Component.

import { cn } from "cn";
import { useFormatter } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";

// #region Types

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

// #endregion

// #region Components

const chartConfig = {
  value: { color: "var(--chart-2)" },
} satisfies ChartConfig;

/** The chart for sighted users and the same data as a table for screen readers. */
export function HourBarChart({
  bars,
  title,
  hourHeading,
  valueHeading,
}: HourBarChartProps) {
  return (
    <figure>
      <BarsChart bars={bars} />
      <HourTable
        bars={bars}
        caption={title}
        hourHeading={hourHeading}
        valueHeading={valueHeading}
      />
    </figure>
  );
}

function BarsChart({ bars }: { bars: HourBar[] }) {
  const format = useFormatter();

  return (
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
        <ChartTooltip cursor={false} content={HourTooltip} />
        <Bar dataKey="value" radius={4} isAnimationActive={false}>
          {bars.map((bar) => (
            <Cell key={bar.key} {...barStyle(bar)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

/** Shown when hovering or tapping a bar: the hour and its value. */
function HourTooltip({ active, payload }: TooltipContentProps) {
  const bar = payload?.[0]?.payload as HourBar | undefined;
  if (!active || !bar) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-footnote shadow-sm">
      <div className="text-muted-foreground">{bar.rangeLabel}</div>
      <div className="font-medium tabular-nums">{bar.valueLabel}</div>
    </div>
  );
}

interface HourTableProps {
  bars: HourBar[];
  caption: string;
  hourHeading: string;
  valueHeading: string;
}

/** Invisible on screen; screen readers read this instead of the chart. */
function HourTable({
  bars,
  caption,
  hourHeading,
  valueHeading,
}: HourTableProps) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
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
  );
}

// #endregion

// #region Helpers

/** Colour, fade and outline of one bar. Colours are tokens from globals.css. */
function barStyle(bar: HourBar) {
  return {
    fill: bar.highlighted ? "var(--color-highlight)" : "var(--color-value)",
    fillOpacity: bar.muted ? 0.45 : 1,
    stroke: bar.current ? "var(--color-foreground)" : undefined,
    strokeWidth: bar.current ? 2 : 0,
  };
}

// #endregion
