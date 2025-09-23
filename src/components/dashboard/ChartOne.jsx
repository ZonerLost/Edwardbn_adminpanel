import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

/**
 * Props:
 * - title: string
 * - rangeLabel: string
 * - data: [{ name, pv, amt }]
 */
export default function ChartOne({ title = "Total Users", rangeLabel = "", data = [] }) {
  return (
    <div className="col-span-12 xl:col-span-8 rounded-sm border border-gray-400/20 bg-white px-5 pt-7 pb-5 shadow-xl sm:px-7 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-4 items-center justify-center rounded-full border border-green-500">
              <span className="block h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <div className="w-full">
              <p className="font-semibold text-green-600">{title}</p>
              {rangeLabel && <p className="text-sm font-medium text-gray-500">{rangeLabel}</p>}
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300} className="col-span-12 lg:col-span-8 rounded-sm">
        <AreaChart data={data} margin={{ top: 5, right: 1, left: 1, bottom: 5 }}>
          <CartesianGrid strokeDasharray="5 5" />
          <XAxis dataKey="name" tick={{ fill: "#000000" }} />
          <YAxis tick={{ fill: "#000000" }} />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="pv"
            stroke="#82ca9d"
            fill="url(#colorUv)"
            activeDot={{ r: 6 }}
          />
          <defs>
            <linearGradient id="colorUv" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
