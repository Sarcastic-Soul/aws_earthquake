import React, { useEffect, useState, useMemo } from "react";
import {
  Activity,
  GitCommit,
  Globe,
  RefreshCw,
  AlertTriangle,
  Terminal,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { format, subHours, subDays, startOfHour, startOfDay } from "date-fns";

// Import local components
import { THEME, GlobalStyles } from "./theme";
import RepoSelector from "./components/RepoSelector";
import StatsCard from "./components/StatsCard";
import DualLineChart from "./components/DualLineChart";
import EventFeed from "./components/EventFeed";

export default function Dashboard() {
  const [repo, setRepo] = useState("aws/aws-sdk-js");
  const [timeRange, setTimeRange] = useState("24h");
  const [commits, setCommits] = useState([]);
  const [quakes, setQuakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. Fetching Logic ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const now = new Date();
    let startDate;
    if (timeRange === "24h") startDate = subHours(now, 24);
    else if (timeRange === "7d") startDate = subDays(now, 7);
    else startDate = subDays(now, 30);

    const isoDate = startDate.toISOString();

    try {
      const [commitRes, quakeRes] = await Promise.all([
        fetch(
          `https://api.github.com/repos/${repo}/commits?since=${isoDate}&per_page=100`,
        ),
        fetch(
          `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${isoDate}&orderby=time&limit=200&minmagnitude=2.5`,
        ),
      ]);

      if (!commitRes.ok) {
        if (commitRes.status === 404)
          throw new Error(`Repo "${repo}" not found.`);
        if (commitRes.status === 403)
          throw new Error("GitHub API rate limit exceeded.");
        throw new Error("GitHub API Error");
      }
      if (!quakeRes.ok) throw new Error("USGS API connection failed.");

      setCommits(await commitRes.json());
      const qData = await quakeRes.json();
      setQuakes(qData.features);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [repo, timeRange]);

  // --- 2. Data Processing ---
  const chartData = useMemo(() => {
    if (loading) return [];

    const now = new Date();
    let start, bucketSize;

    if (timeRange === "24h") {
      start = subHours(now, 24);
      bucketSize = 60 * 60 * 1000;
    } else if (timeRange === "7d") {
      start = subDays(now, 7);
      bucketSize = 24 * 60 * 60 * 1000;
    } else {
      start = subDays(now, 30);
      bucketSize = 24 * 60 * 60 * 1000;
    }

    const map = new Map();
    let current = start;
    while (current <= now) {
      const key =
        timeRange === "24h"
          ? format(startOfHour(current), "yyyy-MM-dd HH:mm")
          : format(startOfDay(current), "yyyy-MM-dd");
      map.set(key, { timestamp: key, commits: 0, quakes: 0 });
      current = new Date(current.getTime() + bucketSize);
    }

    const getKey = (d) =>
      timeRange === "24h"
        ? format(startOfHour(new Date(d)), "yyyy-MM-dd HH:mm")
        : format(startOfDay(new Date(d)), "yyyy-MM-dd");

    commits.forEach((c) => {
      const k = getKey(c.commit.author.date);
      if (map.has(k)) map.get(k).commits++;
    });

    quakes.forEach((q) => {
      const k = getKey(q.properties.time);
      if (map.has(k)) map.get(k).quakes++;
    });

    return Array.from(map.values());
  }, [commits, quakes, timeRange, loading]);

  // --- 3. Derived Stats & Feed ---
  const correlation = useMemo(() => {
    if (chartData.length < 2) return 0;
    let synced = 0;
    for (let i = 1; i < chartData.length; i++) {
      const cD = chartData[i].commits - chartData[i - 1].commits;
      const qD = chartData[i].quakes - chartData[i - 1].quakes;
      if ((cD > 0 && qD > 0) || (cD < 0 && qD < 0)) synced++;
    }
    return Math.floor((synced / (chartData.length - 1)) * 100);
  }, [chartData]);

  const feedItems = useMemo(
    () =>
      [
        ...commits.map((c) => ({
          id: c.sha,
          type: "commit",
          date: c.commit.author.date,
          desc: c.commit.message,
        })),
        ...quakes.map((q) => ({
          id: q.id,
          type: "quake",
          date: q.properties.time,
          desc: `${q.properties.place} (Mag ${q.properties.mag})`,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [commits, quakes],
  );

  const totalMag = quakes.reduce((a, q) => a + q.properties.mag, 0);
  const avgMag = quakes.length ? (totalMag / quakes.length).toFixed(2) : 0;
  const chaosRatio = quakes.length
    ? (commits.length / quakes.length).toFixed(1)
    : 0;

  return (
    <>
      <GlobalStyles />
      <div
        className={`min-h-screen ${THEME.bg} ${THEME.textMain} font-mono pb-20 selection:bg-[#d79921] selection:text-white antialiased`}
      >
        {/* HEADER */}
        <header
          className={`${THEME.cardBg} border-b ${THEME.border} sticky top-0 z-50 shadow-sm`}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <div className="bg-[#3c3836] text-[#fbf1c7] p-2 rounded-sm shadow-sm">
                <Terminal size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter">
                  Code vs Tectonics
                </h1>
                <p className={`text-[10px] ${THEME.textSub} tracking-widest`}>
                  GLOBAL SYNCHRONICITY DASHBOARD
                </p>
              </div>
            </div>

            {/* Controls Area */}
            <div className="flex items-center gap-4">
              <RepoSelector currentRepo={repo} onRepoChange={setRepo} />

              <div className="relative group z-10">
                <button
                  className={`flex items-center gap-2 ${THEME.inputBg} px-3 py-2 text-xs font-bold border ${THEME.border} hover:border-[#d79921] transition rounded-sm text-[#3c3836]`}
                >
                  <Calendar size={14} className="text-[#d79921]" />
                  <span>
                    {timeRange === "24h"
                      ? "24 HOURS"
                      : timeRange === "7d"
                        ? "7 DAYS"
                        : "30 DAYS"}
                  </span>
                  <ChevronDown size={14} />
                </button>
                <div
                  className={`absolute top-full right-0 w-32 ${THEME.cardBg} border ${THEME.border} shadow-xl hidden group-hover:block pt-1`}
                >
                  {["24h", "7d", "30d"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeRange(t)}
                      className={`block w-full text-left px-4 py-3 text-xs font-bold hover:bg-[#d79921] hover:text-[#fbf1c7] uppercase ${THEME.textMain}`}
                    >
                      Last {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={fetchData}
                className={`p-2 border ${THEME.border} bg-[#fbf1c7] hover:bg-[#d79921] hover:text-[#fbf1c7] transition rounded-sm shadow-sm`}
                title="Refresh Data"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 flex items-center gap-3 text-sm font-bold shadow-sm rounded-sm">
              <AlertTriangle size={18} />
              DATA STREAM ERROR: {error}
            </div>
          )}

          {/* INSIGHT BANNER */}
          <div className="mb-8 border-l-4 border-[#d79921] bg-[#282828] text-[#fbf1c7] p-6 flex flex-col md:flex-row items-center justify-between shadow-md rounded-r-sm gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tighter mb-1 text-[#d79921]">
                SYNCH SCORE: {correlation}%
              </h2>
              <p className="text-xs text-[#a89984] uppercase tracking-wider">
                Correlating{" "}
                <span className="text-white border-b border-[#d79921] mx-1">
                  {repo}
                </span>{" "}
                velocity with Global Seismic Activity
              </p>
            </div>
            <div className="flex gap-4 opacity-50">
              <GitCommit size={32} />
              <Activity size={32} />
              <Globe size={32} />
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Commits"
              value={commits.length}
              subtext={`IN LAST ${timeRange}`}
              icon={GitCommit}
              colorClass="text-[#458588]"
            />
            <StatsCard
              title="Seismic Events"
              value={quakes.length}
              subtext="MAGNITUDE > 2.5"
              icon={Globe}
              colorClass="text-[#cc241d]"
            />
            <StatsCard
              title="Avg Magnitude"
              value={avgMag}
              subtext="LOGARITHMIC SCALE"
              icon={Activity}
              colorClass="text-[#b16286]"
            />
            <StatsCard
              title="Chaos Ratio"
              value={chaosRatio}
              subtext="COMMITS PER QUAKE"
              icon={AlertTriangle}
              colorClass="text-[#d79921]"
            />
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={`md:col-span-2 ${THEME.cardBg} border ${THEME.border} p-6 shadow-sm rounded-sm`}
            >
              <div className="flex justify-between items-end mb-8">
                <h3
                  className={`font-bold text-lg uppercase tracking-tight ${THEME.textMain}`}
                >
                  Correlation Timeline
                </h3>
                <div className={`text-[10px] ${THEME.textSub} font-mono`}>
                  X: TIME / Y: FREQUENCY
                </div>
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center animate-pulse opacity-50 font-mono text-sm tracking-widest text-[#7c6f64]">
                  FETCHING LIVE DATA...
                </div>
              ) : (
                <DualLineChart data={chartData} view={timeRange} />
              )}
            </div>
            <EventFeed items={feedItems} loading={loading} />
          </div>
        </main>
      </div>
    </>
  );
}
