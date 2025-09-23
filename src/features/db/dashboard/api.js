import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getCountFromServer,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseStore } from "../../../lib/firebase";

/** Public presets to reuse in the UI */
export const WINDOW_PRESETS = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

/** Count docs in a collection with optional constraints */
export async function countDocs(collName, constraints = []) {
  const db = getFirebaseStore();
  const base = collection(db, collName);
  const q = constraints.length ? query(base, ...constraints) : base;
  const snap = await getCountFromServer(q);
  return snap.data().count || 0;
}

function toTs(d) {
  return Timestamp.fromDate(d instanceof Date ? d : new Date(d));
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmtShort(d) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(d);
}
function pctChange(curr, prev) {
  if (!prev) return curr ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

/**
 * Dashboard counts + deltas for a given window
 * @param {Object} cfg
 *  - usersColl='users', feedbackColl='userFeedback', faqsColl='faqs', appContentColl='appContent'
 *  - windowDays=7  (compare last N days vs previous N days)
 */
export async function getDashboardCounts(cfg = {}) {
  const {
    usersColl = "users",
    feedbackColl = "userFeedback",
    faqsColl = "faqs",
    appContentColl = "appContent",
    windowDays = 7,
  } = cfg;

  const now = new Date();
  const startCurr = addDays(now, -(windowDays - 1)); // inclusive
  const startPrev = addDays(now, -(2 * windowDays - 1));
  const endPrev = addDays(now, -windowDays);

  // totals (lifetime)
  const [usersTotal, feedbackTotal, faqsTotal, appContentTotal] = await Promise.all([
    countDocs(usersColl),
    countDocs(feedbackColl),
    countDocs(faqsColl),
    countDocs(appContentColl),
  ]);

  // window: current vs previous (Users + Feedback)
  const [usersCurr, usersPrev, fbCurr, fbPrev] = await Promise.all([
    countDocs(usersColl, [where("createdAt", ">=", toTs(startCurr))]),
    countDocs(usersColl, [where("createdAt", ">=", toTs(startPrev)), where("createdAt", "<", toTs(endPrev))]),
    countDocs(feedbackColl, [where("createdAt", ">=", toTs(startCurr))]),
    countDocs(feedbackColl, [where("createdAt", ">=", toTs(startPrev)), where("createdAt", "<", toTs(endPrev))]),
  ]);

  return {
    totals: {
      users: usersTotal,
      feedback: feedbackTotal,
      faqs: faqsTotal,
      appContent: appContentTotal,
    },
    deltas: {
      usersPct: pctChange(usersCurr, usersPrev),
      feedbackPct: pctChange(fbCurr, fbPrev),
    },
    rangeLabel: `${fmtShort(startCurr)} - ${fmtShort(now)}`,
  };
}

/**
 * Build a daily time-series of new users for the last N days (default 30)
 * @returns [{ name: 'Sep 01', pv: 5, amt: 5 }, ...]
 */
export async function getUsersTimeSeries({ days = 30, usersColl = "users" } = {}) {
  const db = getFirebaseStore();
  const end = new Date();
  const start = addDays(end, -(days - 1)); // inclusive window

  const q = query(
    collection(db, usersColl),
    where("createdAt", ">=", toTs(start)),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);

  // initialize buckets for each day in range
  const buckets = new Map();
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    buckets.set(key, { date: new Date(d), count: 0 });
  }

  snap.forEach((doc) => {
    const ts = doc.data()?.createdAt;
    const d = typeof ts?.toDate === "function" ? ts.toDate() : new Date(ts);
    const key = d.toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.get(key).count += 1;
    }
  });

  // convert to chart format and compute a running total (amt)
  let running = 0;
  const series = Array.from(buckets.values()).map(({ date, count }) => {
    running += count;
    return {
      name: new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(date),
      pv: count,
      amt: running,
    };
  });

  return {
    data: series,
    rangeLabel: `${new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(start)} - ${new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(end)}`,
  };
}
