import React, { useEffect, useState } from "react";
import { BsCartCheckFill } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { FaQuoteLeft } from "react-icons/fa6";
import { Link } from "react-router-dom";

import Header from "../components/partials/header";
import ChartOne from "../components/dashboard/ChartOne";
import {
  getDashboardCounts,
  getUsersTimeSeries,
  WINDOW_PRESETS,
} from "../features/db/dashboard/api";
import StatCardSkeleton from "../components/dashboard/StatCardSkeleton";
import ChartSkeleton from "../components/dashboard/ChartSkeleton";
import RangeTabs from "../components/dashboard/RangeTabs";

function DeltaBadge({ value }) {
  const up = value >= 0;
  const val = Number.isFinite(value) ? `${value.toFixed(2)}%` : "—";
  return (
    <span
      className={`flex items-center gap-1 text-sm font-medium ${
        up ? "text-green-600" : "text-red-600"
      }`}
    >
      {up ? "▲" : "▼"} {val}
    </span>
  );
}

function StatCard({ to, icon, label, value, delta }) {
  return (
    <Link to={to} className="w-full">
      <div className="rounded-sm bg-white text-black py-6 px-7 shadow-lg">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20">
          {icon}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h4 className="text-title-md font-bold text-gray-700">{value}</h4>
            <span className="text-sm font-medium">{label}</span>
          </div>
          {typeof delta === "number" ? <DeltaBadge value={delta} /> : <span />}
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  // filter: day | week | month | year
  const [windowKey, setWindowKey] = useState("month");

  const [counts, setCounts] = useState({
    users: 0,
    feedback: 0,
    faqs: 0,
    appContent: 0,
  });
  const [deltas, setDeltas] = useState({ usersPct: 0, feedbackPct: 0 });
  const [rangeLabel, setRangeLabel] = useState("");

  const [chartData, setChartData] = useState([]);
  const [chartRange, setChartRange] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const windowDays = WINDOW_PRESETS[windowKey] ?? 30;

        // Totals & deltas for the selected window
        const { totals, deltas, rangeLabel } = await getDashboardCounts({
          usersColl: "users",
          feedbackColl: "userFeedback",
          faqsColl: "faqs",
          appContentColl: "appContent",
          windowDays,
        });
        if (!alive) return;
        setCounts(totals);
        setDeltas(deltas);
        setRangeLabel(rangeLabel);

        // Time-series for the selected window
        const { data, rangeLabel: chartRL } = await getUsersTimeSeries({
          days: windowDays,
          usersColl: "users",
        });
        if (!alive) return;
        setChartData(data);
        setChartRange(chartRL);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [windowKey]);

  return (
    <>
      <Header header={"Dashboard"} />

      <div className="max-w-screen-2xl mx-auto">
        <div className="mx-4 sm:mx-9 my-5">
          {/* Filter row */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Range: <span className="font-medium">{chartRange || rangeLabel}</span>
            </div>
            <RangeTabs value={windowKey} onChange={setWindowKey} />
          </div>

          {/* Stat cards row */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 md:gap-6 2xl:grid-cols-4 2xl:gap-7">
              {[...Array(3)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 md:gap-6 2xl:grid-cols-4 2xl:gap-7">
              <StatCard
                to="/users"
                icon={<BsCartCheckFill className="w-6 h-6 text-primary" />}
                label="Users"
                value={counts.users}
                delta={deltas.usersPct}
              />
              <StatCard
                to="/content"
                icon={<IoSettingsOutline className="w-6 h-6 text-primary" />}
                label="App Settings"
                value={counts.appContent}
              />
              <StatCard
                to="/faqs"
                icon={<FaQuoteLeft className="w-6 h-6 text-primary" />}
                label="FAQs"
                value={counts.faqs}
              />
            </div>
          )}

          {/* Chart row */}
          <div className="mt-8 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7 2xl:gap-7">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ChartOne
                title="New Users (daily)"
                rangeLabel={chartRange || rangeLabel}
                data={chartData}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
