"use client";

import vortex from "@/lib/vortex";
import { useEffect, useMemo, useState } from "react";

export default function Home() {

  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [analytics, setAnalytics] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function fetchJobs() {

    try {

      const jobsResponse = await vortex.get("/api/jobs/all");

      const statsResponse = await vortex.get("/api/jobs/stats");

      const analyticsResponse = await vortex.get("/api/jobs/analytics");

      setJobs(jobsResponse.data);
      setStats(statsResponse.data);
      setAnalytics(analyticsResponse.data);

    } catch (error) {

      console.error(error);
    }
  }

  async function uploadFile() {

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {

      await vortex.post("/api/jobs/submit", formData);

      setFile(null);

      fetchJobs();

    } catch (error) {

      console.error(error);
    }
  }

  useEffect(() => {

  const token = localStorage.getItem("sentinel_token");

  if (token) {
    setIsAuthenticated(true);
  }

  fetchJobs();

  const interval = setInterval(() => {

    fetchJobs();

  }, 10000);

  return () => clearInterval(interval);

}, []);

  const sortedJobs = useMemo(() => {

    return [...jobs].sort((a, b) => b.id - a.id);

  }, [jobs]);

  const filteredJobs = useMemo(() => {

    return sortedJobs.filter((job) => {

      const query = search.toLowerCase();

      const matchesSearch =
        job.name?.toLowerCase().includes(query) ||
        job.result?.toLowerCase().includes(query) ||
        job.severity?.toLowerCase().includes(query) ||
        job.status?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "ALL" ||
        job.severity === filter ||
        job.result === filter;

      return matchesSearch && matchesFilter;
    });

  }, [sortedJobs, search, filter]);

  const recentThreats = useMemo(() => {

    return sortedJobs
      .filter((job) => job.severity === "CRITICAL")
      .slice(0, 5);

  }, [sortedJobs]);

  function severityColor(severity: string) {

    switch (severity) {

      case "CRITICAL":
        return "text-red-500";

      case "HIGH":
        return "text-orange-400";

      case "MEDIUM":
        return "text-yellow-400";

      default:
        return "text-green-400";
    }
  }

  function statusBadge(status: string) {

    switch (status) {

      case "COMPLETED":
        return "bg-green-500/20 text-green-400 border border-green-500/30";

      case "PROCESSING":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";

      case "FAILED":
        return "bg-red-500/20 text-red-400 border border-red-500/30";

      default:
        return "bg-zinc-700 text-zinc-300";
    }
  }

  return (

    <div className="min-h-screen bg-black text-white">

      <div className="flex">

        <aside className="w-64 min-h-screen border-r border-zinc-800 bg-zinc-950 p-6 hidden lg:block">

          <h1 className="text-3xl font-bold mb-10">
            VORTEX Security Scanner
          </h1>

          <div className="space-y-3">

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
              Dashboard
            </div>

            <div className="text-zinc-400 px-4 py-3">
              Threats
            </div>

            <div className="text-zinc-400 px-4 py-3">
              Workers
            </div>

            <div className="text-zinc-400 px-4 py-3">
              Uploads
            </div>

          </div>

        </aside>

        <main className="flex-1 p-10">

          <div className="max-w-[1600px] mx-auto">

            <div className="flex items-center justify-between mb-10">

              <div>

                <h1 className="text-5xl font-bold">
                  VORTEX Dashboard
                </h1>

                <p className="text-zinc-400 mt-2">
                  Distributed Threat Detection Platform
                </p>

              </div>

              <div className="text-right">

                <p className="text-zinc-500 text-sm">
                  Live Monitoring
                </p>

                <div className="flex items-center gap-2 mt-2 justify-end">

                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

                  <span className="text-green-400 text-sm">
                    ACTIVE
                  </span>

                </div>

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">

              <StatCard
                title="Total Jobs"
                value={stats.totalJobs || 0}
              />

              <StatCard
                title="Completed"
                value={stats.completed || 0}
              />

              <StatCard
                title="Processing"
                value={stats.processing || 0}
              />

              <StatCard
                title="Failed"
                value={stats.failed || 0}
              />

              <StatCard
                title="Active Workers"
                value={stats.activeWorkers || 0}
              />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">

              <ThreatCard
                title="Critical Threats"
                value={analytics.critical || 0}
                style="bg-red-950 border-red-900 text-red-300"
              />

              <ThreatCard
                title="High Severity"
                value={analytics.high || 0}
                style="bg-orange-950 border-orange-900 text-orange-300"
              />

              <ThreatCard
                title="Medium Severity"
                value={analytics.medium || 0}
                style="bg-yellow-950 border-yellow-900 text-yellow-300"
              />

              <ThreatCard
                title="Safe Files"
                value={analytics.low || 0}
                style="bg-green-950 border-green-900 text-green-300"
              />

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

              <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">

                <h2 className="text-2xl font-semibold mb-4">
                  Upload File
                </h2>

                <div className="flex flex-col md:flex-row gap-4">

                  <input
                    type="file"
                    disabled={!isAuthenticated}
                    onChange={(e) => {

                      if (e.target.files) {

                        setFile(e.target.files[0]);
                      }
                    }}
                    className={`border rounded-lg p-3 flex-1 ${
                      !isAuthenticated
                        ? "border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed"
                        : "border-zinc-700"
                    }`}
                  />

                  <button
                    onClick={uploadFile}
                    disabled={!isAuthenticated}
                    className={`px-8 py-3 rounded-lg font-semibold transition ${
                      !isAuthenticated
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    Upload
                  </button>

                </div>
                    {!isAuthenticated && (
                      <p className="text-sm text-zinc-500 mt-4">
                        Login required to submit files for scanning.
                      </p>
                    )}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

                <h2 className="text-xl font-semibold mb-4">
                  Recent Critical Threats
                </h2>

                <div className="space-y-3">

                  {recentThreats.length === 0 && (

                    <p className="text-zinc-500 text-sm">
                      No critical threats detected.
                    </p>

                  )}

                  {recentThreats.map((job) => (

                    <div
                      key={job.id}
                      className="border border-red-900 bg-red-950/40 rounded-xl p-4"
                    >

                      <p className="font-semibold text-red-300">
                        {job.result}
                      </p>

                      <p className="text-sm text-zinc-400 mt-1">
                        {job.name}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-6">

              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              />

              <div className="flex gap-2">

                {[
                  "ALL",
                  "CRITICAL",
                  "HIGH",
                  "MEDIUM",
                  "SAFE"
                ].map((type) => (

                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-xl border transition ${
                      filter === type
                        ? "bg-white text-black border-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300"
                    }`}
                  >
                    {type}
                  </button>

                ))}

              </div>

            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

              <table className="w-full">

                <thead className="bg-zinc-800">

                  <tr className="text-left">

                    <th className="p-4">File</th>
                    <th className="p-4">Result</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Worker</th>
                    <th className="p-4">Scan Time</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredJobs.map((job) => (

                    <tr
                      key={job.id}
                      className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"
                    >

                      <td className="p-4">
                        {job.name}
                      </td>

                      <td className="p-4 font-semibold">
                        {job.result}
                      </td>

                      <td className={`p-4 font-semibold ${severityColor(job.severity)}`}>
                        {job.severity}
                      </td>

                      <td className="p-4">

                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(job.status)}`}>
                          {job.status}
                        </span>

                      </td>

                      <td className="p-4 text-zinc-300">
                        {job.workerNode}
                      </td>

                      <td className="p-4">
                        {job.scanDurationMs} ms
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

function StatCard({
  title,
  value
}: {
  title: string;
  value: number;
}) {

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

      <p className="text-zinc-400 text-sm">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>

    </div>
  );
}

function ThreatCard({
  title,
  value,
  style
}: {
  title: string;
  value: number;
  style: string;
}) {

  return (

    <div className={`${style} border rounded-2xl p-5`}>

      <p className="text-sm">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>

    </div>
  );
}