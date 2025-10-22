"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Provider = "aws_ec2" | "gcp_compute";
type BlobProvider = "s3" | "gcs";

interface ComputeCost { base: number }
interface BlobCost { storage_per_gb: number; egress_per_gb: number }

const COMPUTE_COSTS: Record<Provider, ComputeCost> = {
  aws_ec2: { base: 80 },
  gcp_compute: { base: 70 },
};
const BLOB_COSTS: Record<BlobProvider, BlobCost> = {
  s3: { storage_per_gb: 0.023, egress_per_gb: 0.09 },
  gcs: { storage_per_gb: 0.020, egress_per_gb: 0.12 },
};

export default function ValidatorEconomicsChart() {
  const [provider, setProvider] = useState<Provider>("aws_ec2");
  const [blob, setBlob] = useState<BlobProvider>("s3");
  const [audioPrice, setAudioPrice] = useState<number>(0.27);
  const [totalStake, setTotalStake] = useState<number>(280_000_000);
  const [userStake, setUserStake] = useState<number>(2_000_000);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Detect system theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setDarkMode(media.matches);
      const listener = (e: MediaQueryListEvent) => setDarkMode(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  const storageGB = 200;
  const egressGB = 400;
  const annualRewardRate = 0.07;
  const weeks = 12;

  const data = useMemo(() => {
    const blobCost = BLOB_COSTS[blob];
    const computeCost = COMPUTE_COSTS[provider];
    const weeklyRewardRate = annualRewardRate / 52;
    const monthlyToWeekly = 1 / 4.345;

    let cumulativeEarnings = 0;
    let cumulativeCosts = 0;

    return Array.from({ length: weeks }, (_, i) => {
      const week = i + 1;

      // Simulate AUDIO price drift ±10 %
      const priceDrift = audioPrice * (1 + 0.1 * Math.sin(week / 3));

      // Reward rate variation ±5 %
      const rewardVariance = weeklyRewardRate * (1 + 0.05 * Math.cos(week / 2));

      // Weekly rewards fluctuate
      const weeklyEarningsUSD = userStake * rewardVariance * priceDrift;
      cumulativeEarnings += weeklyEarningsUSD;

      // Weekly infra cost grows slightly
      const costGrowth = 1 + week * 0.015; // +1.5 % per week
      const weeklyInfraCostUSD =
        (computeCost.base * monthlyToWeekly +
          blobCost.storage_per_gb * storageGB +
          blobCost.egress_per_gb * egressGB) * costGrowth;

      cumulativeCosts += weeklyInfraCostUSD;
      const netUSD = weeklyEarningsUSD - weeklyInfraCostUSD;
      const cumulativeNetUSD = cumulativeEarnings - cumulativeCosts;

      return {
        week,
        weeklyEarningsUSD,
        weeklyInfraCostUSD,
        netUSD,
        cumulativeNetUSD,
      };
    });
  }, [provider, blob, audioPrice, totalStake, userStake]);

  // Theme colors
  const colors = darkMode
    ? {
      bg: "#0a0a0a",
      text: "#f5f5f5",
      grid: "#a78bfa33",
      accent: "#a78bfa",
      tooltipBg: "#1c1c1c",
      tooltipBorder: "#a78bfa66",
    }
    : {
      bg: "#ffffff",
      text: "#1a1a1a",
      grid: "#c4b5fd55",
      accent: "#7c3aed",
      tooltipBg: "#f9f9f9",
      tooltipBorder: "#c4b5fd99",
    };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <label>
          Compute:
          <select
            className="ml-2 border rounded p-1"
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
          >
            <option value="aws_ec2">AWS EC2</option>
            <option value="gcp_compute">GCP Compute</option>
          </select>
        </label>

        <label>
          Storage:
          <select
            className="ml-2 border rounded p-1"
            value={blob}
            onChange={(e) => setBlob(e.target.value as BlobProvider)}
          >
            <option value="s3">AWS S3</option>
            <option value="gcs">Google Cloud Storage</option>
          </select>
        </label>

        <label>
          AUDIO Price ($):
          <input
            type="number"
            step="0.01"
            className="ml-2 w-20 border rounded p-1"
            value={audioPrice}
            onChange={(e) => setAudioPrice(parseFloat(e.target.value))}
          />
        </label>

        <label>
          Your Stake (AUDIO):
          <input
            type="number"
            className="ml-2 w-28 border rounded p-1"
            value={userStake}
            onChange={(e) => setUserStake(parseFloat(e.target.value))}
          />
        </label>
      </div>

      <div
        style={{
          backgroundColor: colors.bg,
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={data}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              stroke={colors.text}
              label={{ value: "Week", position: "bottom", fill: colors.text }}
            />
            <YAxis
              stroke={colors.text}
              label={{
                value: "USD",
                angle: -90,
                position: "insideLeft",
                fill: colors.text,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                color: colors.text,
              }}
              formatter={(v: number) => `$${v.toFixed(2)}`}
              labelFormatter={(v) => `Week ${v}`}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
            <ReferenceLine y={0} stroke={colors.text} strokeDasharray="4 4" />

            <Line
              type="monotone"
              dataKey="weeklyEarningsUSD"
              stroke="#22c55e"
              name="Earnings / week"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="weeklyInfraCostUSD"
              stroke="#ef4444"
              name="Costs / week"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="netUSD"
              stroke="#3b82f6"
              name="Net / week"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="cumulativeNetUSD"
              stroke={colors.accent}
              name="Cumulative Net"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
